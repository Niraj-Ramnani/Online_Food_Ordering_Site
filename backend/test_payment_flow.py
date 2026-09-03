from decimal import Decimal
import hashlib
import hmac
import json
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config.database import SessionLocal, engine
from app.config.settings import RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
from app.main import app
from app.models.restaurant import Restaurant

client = TestClient(app)


def cleanup_db():
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM notifications"))
        conn.execute(text("DELETE FROM payments"))
        conn.execute(text("DELETE FROM order_items"))
        conn.execute(text("DELETE FROM orders"))
        conn.execute(text("DELETE FROM cart_items"))
        conn.execute(text("DELETE FROM carts"))
        conn.execute(text("DELETE FROM food_items"))
        conn.execute(text("DELETE FROM restaurants"))
        conn.execute(text("DELETE FROM addresses"))
        conn.execute(text("DELETE FROM users"))
        conn.commit()


def run_tests():
    cleanup_db()

    print("=== 1. Setup Users, Restaurant & Order for Payment Tests ===")
    # Customer Alice
    client.post(
        "/api/v1/auth/register",
        json={"name": "Alice Payment", "email": "alice@payment.com", "password": "password123", "role": "USER"},
    )
    token_alice = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@payment.com", "password": "password123"},
    ).json()["access_token"]
    headers_alice = {"Authorization": f"Bearer {token_alice}"}

    # Customer Bob
    client.post(
        "/api/v1/auth/register",
        json={"name": "Bob Payment", "email": "bob@payment.com", "password": "password123", "role": "USER"},
    )
    token_bob = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@payment.com", "password": "password123"},
    ).json()["access_token"]
    headers_bob = {"Authorization": f"Bearer {token_bob}"}

    # Seller Mario
    client.post(
        "/api/v1/auth/register",
        json={"name": "Chef Mario", "email": "mario@payment.com", "password": "password123", "role": "SELLER"},
    )
    token_mario = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@payment.com", "password": "password123"},
    ).json()["access_token"]
    headers_mario = {"Authorization": f"Bearer {token_mario}"}

    res_r = client.post(
        "/api/v1/restaurants",
        headers=headers_mario,
        json={"name": "Mario Trattoria", "address": "123 Pasta Lane"},
    )
    rest_id = res_r.json()["id"]

    # Verify restaurant
    db = SessionLocal()
    r = db.query(Restaurant).filter(Restaurant.id == rest_id).first()
    r.is_verified = True
    r.is_open = True
    db.commit()
    db.close()

    # Add Food Item (Rs. 350.00)
    res_f = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=headers_mario,
        json={"name": "Pasta Carbonara", "category": "Pasta", "price": "350.00"},
    )
    food_id = res_f.json()["id"]

    # Alice creates address
    res_addr = client.post(
        "/api/v1/addresses",
        headers=headers_alice,
        json={"label": "Home", "address_line": "123 Main St", "city": "NYC", "state": "NY", "pincode": "10001"},
    )
    addr_id = res_addr.json()["id"]

    # Alice adds item to cart and checkouts (Order 1: Rs. 700.00)
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": food_id, "quantity": 2})
    res_order = client.post("/api/v1/orders", headers=headers_alice, json={"address_id": addr_id})
    assert res_order.status_code == 201
    order_id = res_order.json()["id"]
    print("Order setup complete: Order ID", order_id)

    print("\n=== 2. Testing Razorpay Order Creation & Ownership ===")
    # 1. Unauthenticated creation rejected (401)
    assert client.post("/api/v1/payments/create-order", json={"order_id": order_id}).status_code == 401

    # 2. Bob attempts to create payment for Alice's order (404)
    res_cross_create = client.post(
        "/api/v1/payments/create-order",
        headers=headers_bob,
        json={"order_id": order_id},
    )
    assert res_cross_create.status_code == 404
    print("Cross-user payment creation blocked (404)")

    # 3. Alice creates payment order successfully (201)
    res_pay_create = client.post(
        "/api/v1/payments/create-order",
        headers=headers_alice,
        json={"order_id": order_id},
    )
    assert res_pay_create.status_code == 201
    pay_data = res_pay_create.json()
    rzp_order_id = pay_data["razorpay_order_id"]
    assert pay_data["order_id"] == order_id
    assert Decimal(str(pay_data["amount"])) == Decimal("700.00")
    assert pay_data["amount_in_paise"] == 70000
    assert pay_data["currency"] == "INR"
    assert "key_id" in pay_data
    print("Payment order created successfully:", rzp_order_id)

    # 4. Check payment by order endpoint
    res_get_pay = client.get(f"/api/v1/payments/order/{order_id}", headers=headers_alice)
    assert res_get_pay.status_code == 200
    assert res_get_pay.json()["status"] == "PENDING"

    print("\n=== 3. Testing Payment Cryptographic Verification ===")
    mock_rzp_payment_id = "pay_mock_123456789"

    # 1. Invalid signature verification rejected (400)
    res_invalid_verify = client.post(
        "/api/v1/payments/verify",
        headers=headers_alice,
        json={
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": mock_rzp_payment_id,
            "razorpay_signature": "invalid_fake_signature_hash",
        },
    )
    assert res_invalid_verify.status_code == 400
    print("Invalid signature rejected (400):", res_invalid_verify.json()["detail"])

    # 2. Generate valid cryptographic HMAC-SHA256 signature
    valid_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{rzp_order_id}|{mock_rzp_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    # 3. Successful verification
    res_valid_verify = client.post(
        "/api/v1/payments/verify",
        headers=headers_alice,
        json={
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": mock_rzp_payment_id,
            "razorpay_signature": valid_signature,
        },
    )
    assert res_valid_verify.status_code == 200
    verified_data = res_valid_verify.json()
    assert verified_data["status"] == "SUCCESS"
    assert verified_data["razorpay_payment_id"] == mock_rzp_payment_id
    print("Payment cryptographically verified with SUCCESS status!")

    print("\n=== 4. Testing Payment Idempotency & Prevent Double Payment ===")
    # 1. Repeated verification returns existing SUCCESS payment safely
    res_dup_verify = client.post(
        "/api/v1/payments/verify",
        headers=headers_alice,
        json={
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": mock_rzp_payment_id,
            "razorpay_signature": valid_signature,
        },
    )
    assert res_dup_verify.status_code == 200
    assert res_dup_verify.json()["status"] == "SUCCESS"
    print("Payment idempotency verified: duplicate verification safe.")

    # 2. Re-attempting to create a payment order for already paid order (400)
    res_dup_create = client.post(
        "/api/v1/payments/create-order",
        headers=headers_alice,
        json={"order_id": order_id},
    )
    assert res_dup_create.status_code == 400
    print("Create payment for already paid order rejected (400):", res_dup_create.json()["detail"])

    print("\n=== 5. Testing Webhook Verification ===")
    webhook_payload = json.dumps(
        {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook_987",
                        "order_id": rzp_order_id,
                        "amount": 70000,
                    }
                }
            },
        }
    ).encode("utf-8")

    # 1. Invalid webhook signature rejected (400)
    res_bad_webhook = client.post(
        "/api/v1/payments/webhook",
        content=webhook_payload,
        headers={"X-Razorpay-Signature": "wrong_signature", "Content-Type": "application/json"},
    )
    assert res_bad_webhook.status_code == 400
    print("Invalid webhook signature rejected (400)")

    # 2. Valid webhook signature accepted (200)
    valid_webhook_sig = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode(),
        webhook_payload,
        hashlib.sha256,
    ).hexdigest()

    res_good_webhook = client.post(
        "/api/v1/payments/webhook",
        content=webhook_payload,
        headers={"X-Razorpay-Signature": valid_webhook_sig, "Content-Type": "application/json"},
    )
    assert res_good_webhook.status_code == 200
    assert res_good_webhook.json()["status"] == "processed"
    print("Valid webhook verified and processed successfully!")

    print("\n=== ALL PAYMENT TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_tests()
