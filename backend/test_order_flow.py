from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config.database import SessionLocal, engine
from app.main import app
from app.models.order import OrderStatus
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

    print("=== 1. Setup Users, Addresses, Restaurants & Food Items ===")
    # 1. Customer A
    client.post(
        "/api/v1/auth/register",
        json={"name": "Alice User", "email": "alice@order.com", "password": "password123", "role": "USER"},
    )
    token_alice = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@order.com", "password": "password123"},
    ).json()["access_token"]
    headers_alice = {"Authorization": f"Bearer {token_alice}"}

    # Alice Address
    res_addr_alice = client.post(
        "/api/v1/addresses",
        headers=headers_alice,
        json={
            "label": "Home",
            "address_line": "123 Main Street, Apt 4B",
            "city": "Springfield",
            "state": "IL",
            "pincode": "62701",
            "latitude": 39.7817,
            "longitude": -89.6501,
            "is_default": True,
        },
    )
    alice_addr_id = res_addr_alice.json()["id"]

    # 2. Customer B
    client.post(
        "/api/v1/auth/register",
        json={"name": "Bob User", "email": "bob@order.com", "password": "password123", "role": "USER"},
    )
    token_bob = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@order.com", "password": "password123"},
    ).json()["access_token"]
    headers_bob = {"Authorization": f"Bearer {token_bob}"}

    res_addr_bob = client.post(
        "/api/v1/addresses",
        headers=headers_bob,
        json={"label": "Bob House", "address_line": "500 Elm St", "city": "Springfield", "state": "IL", "pincode": "62702"},
    )
    bob_addr_id = res_addr_bob.json()["id"]

    # 3. Seller 1 (Mario Pizza)
    client.post(
        "/api/v1/auth/register",
        json={"name": "Chef Mario", "email": "mario@pizza.com", "password": "password123", "role": "SELLER"},
    )
    token_mario = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@pizza.com", "password": "password123"},
    ).json()["access_token"]
    headers_mario = {"Authorization": f"Bearer {token_mario}"}

    res_rest1 = client.post(
        "/api/v1/restaurants",
        headers=headers_mario,
        json={"name": "Mario Pizza Place", "address": "77 Italian Way"},
    )
    rest1_id = res_rest1.json()["id"]

    # 4. Seller 2 (Luigi Burgers)
    client.post(
        "/api/v1/auth/register",
        json={"name": "Chef Luigi", "email": "luigi@burger.com", "password": "password123", "role": "SELLER"},
    )
    token_luigi = client.post(
        "/api/v1/auth/login",
        json={"email": "luigi@burger.com", "password": "password123"},
    ).json()["access_token"]
    headers_luigi = {"Authorization": f"Bearer {token_luigi}"}

    res_rest2 = client.post(
        "/api/v1/restaurants",
        headers=headers_luigi,
        json={"name": "Luigi Burger Place", "address": "88 Burger Blvd"},
    )
    rest2_id = res_rest2.json()["id"]

    # Verify and open both restaurants in DB
    db = SessionLocal()
    r1 = db.query(Restaurant).filter(Restaurant.id == rest1_id).first()
    r1.is_verified = True
    r1.is_open = True
    r2 = db.query(Restaurant).filter(Restaurant.id == rest2_id).first()
    r2.is_verified = True
    r2.is_open = True
    db.commit()
    db.close()

    # Add Food Items to Restaurant 1
    res_f1 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=headers_mario,
        json={"name": "Margherita Pizza", "category": "Pizza", "price": "200.00"},
    )
    f1_id = res_f1.json()["id"]

    res_f2 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=headers_mario,
        json={"name": "Garlic Bread", "category": "Sides", "price": "100.00"},
    )
    f2_id = res_f2.json()["id"]

    # Add Food Item to Restaurant 2
    res_f3 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=headers_luigi,
        json={"name": "Cheeseburger", "category": "Burgers", "price": "150.00"},
    )
    f3_id = res_f3.json()["id"]

    print("Setup completed successfully.")

    print("\n=== 2. Testing Checkout Validation Edge Cases ===")
    # 1. Checkout with empty cart rejected (400)
    res_empty_checkout = client.post(
        "/api/v1/orders",
        headers=headers_alice,
        json={"address_id": alice_addr_id},
    )
    assert res_empty_checkout.status_code == 400
    print("Empty cart checkout rejected (400):", res_empty_checkout.json()["detail"])

    # Alice adds Margherita Pizza (qty=2, price=200) to cart -> Subtotal: 400.00
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": f1_id, "quantity": 2})

    # 2. Checkout with Bob's address (404)
    res_cross_addr = client.post(
        "/api/v1/orders",
        headers=headers_alice,
        json={"address_id": bob_addr_id},
    )
    assert res_cross_addr.status_code == 404
    print("Cross-user address in checkout rejected (404)")

    # 3. Checkout with closed restaurant (400)
    client.patch("/api/v1/restaurants/me/status", headers=headers_mario, json={"is_open": False})
    res_closed = client.post(
        "/api/v1/orders",
        headers=headers_alice,
        json={"address_id": alice_addr_id},
    )
    assert res_closed.status_code == 400
    print("Closed restaurant checkout rejected (400):", res_closed.json()["detail"])
    # Reopen restaurant
    client.patch("/api/v1/restaurants/me/status", headers=headers_mario, json={"is_open": True})

    # 4. Checkout with unavailable food item (400)
    client.patch(f"/api/v1/food-items/{f1_id}/availability", headers=headers_mario, json={"is_available": False})
    res_unavail = client.post(
        "/api/v1/orders",
        headers=headers_alice,
        json={"address_id": alice_addr_id},
    )
    assert res_unavail.status_code == 400
    print("Unavailable food item in checkout rejected (400):", res_unavail.json()["detail"])
    # Re-enable food item
    client.patch(f"/api/v1/food-items/{f1_id}/availability", headers=headers_mario, json={"is_available": True})

    print("\n=== 3. Testing Successful Checkout & Snapshots ===")
    # Alice also adds Garlic Bread (qty=1, price=100) -> Total: 200*2 + 100*1 = 500.00
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": f2_id, "quantity": 1})

    res_checkout = client.post(
        "/api/v1/orders",
        headers=headers_alice,
        json={
            "address_id": alice_addr_id,
            "description": "Please ring door bell",
        },
    )
    assert res_checkout.status_code == 201, res_checkout.text
    order_data = res_checkout.json()
    order_id = order_data["id"]

    assert order_data["status"] == "PLACED"
    assert Decimal(str(order_data["total_amount"])) == Decimal("500.00")
    assert order_data["description"] == "Please ring door bell"
    assert len(order_data["items"]) == 2
    assert "123 Main Street" in order_data["delivery_address"]
    print("Order created successfully with ID:", order_id, "Total:", order_data["total_amount"])

    # Verify Cart was cleared after checkout
    cart_after = client.get("/api/v1/cart", headers=headers_alice).json()
    assert len(cart_after["items"]) == 0
    assert Decimal(str(cart_after["subtotal"])) == Decimal("0.00")
    print("Cart verified completely empty after checkout!")

    print("\n=== 4. Testing Price Snapshot & Address Snapshot Immutability ===")
    # 1. Seller increases Margherita Pizza price from 200 to 300
    client.put(f"/api/v1/food-items/{f1_id}", headers=headers_mario, json={"price": "300.00"})

    # 2. Alice updates/changes her saved delivery address
    client.put(f"/api/v1/addresses/{alice_addr_id}", headers=headers_alice, json={"address_line": "999 New Address Blvd"})

    # 3. Retrieve historical order and verify snapshots did not change
    res_hist_order = client.get(f"/api/v1/orders/{order_id}", headers=headers_alice)
    assert res_hist_order.status_code == 200
    hist_data = res_hist_order.json()

    pizza_item = [i for i in hist_data["items"] if i["food_item_id"] == f1_id][0]
    assert Decimal(str(pizza_item["unit_price"])) == Decimal("200.00")
    assert Decimal(str(pizza_item["item_total"])) == Decimal("400.00")
    assert Decimal(str(hist_data["total_amount"])) == Decimal("500.00")
    assert "123 Main Street" in hist_data["delivery_address"]
    assert "999 New Address" not in hist_data["delivery_address"]
    print("Price snapshot verified: Unit price remains Rs. 200.00 despite live price change to Rs. 300.00!")
    print("Address snapshot verified: Address remains '123 Main Street' despite live address modification!")

    print("\n=== 5. Testing User Order Queries & Ownership Isolation ===")
    # Alice lists orders
    res_alice_orders = client.get("/api/v1/orders", headers=headers_alice)
    assert res_alice_orders.status_code == 200
    assert len(res_alice_orders.json()) == 1

    # Bob lists orders (should be empty for Bob)
    res_bob_orders = client.get("/api/v1/orders", headers=headers_bob)
    assert res_bob_orders.status_code == 200
    assert len(res_bob_orders.json()) == 0

    # Bob attempts to view Alice's order (404)
    res_cross_view = client.get(f"/api/v1/orders/{order_id}", headers=headers_bob)
    assert res_cross_view.status_code == 404
    print("Cross-user order view blocked (404)")

    # Bob attempts to cancel Alice's order (404)
    res_cross_cancel = client.patch(f"/api/v1/orders/{order_id}/cancel", headers=headers_bob)
    assert res_cross_cancel.status_code == 404
    print("Cross-user order cancellation blocked (404)")

    print("\n=== 6. Testing Seller Order Management & Ownership ===")
    # Seller 1 (Mario) views orders for Restaurant 1
    res_mario_orders = client.get("/api/v1/seller/orders", headers=headers_mario)
    assert res_mario_orders.status_code == 200
    assert len(res_mario_orders.json()) == 1
    assert res_mario_orders.json()[0]["id"] == order_id

    # Seller 2 (Luigi) views orders for Restaurant 2 (should be empty)
    res_luigi_orders = client.get("/api/v1/seller/orders", headers=headers_luigi)
    assert res_luigi_orders.status_code == 200
    assert len(res_luigi_orders.json()) == 0

    # Seller 2 attempts to view Seller 1's order (404)
    res_cross_seller_get = client.get(f"/api/v1/seller/orders/{order_id}", headers=headers_luigi)
    assert res_cross_seller_get.status_code == 404
    print("Cross-seller order view blocked (404)")

    # Seller 2 attempts to update status on Seller 1's order (404)
    res_cross_seller_patch = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_luigi,
        json={"status": "ACCEPTED"},
    )
    assert res_cross_seller_patch.status_code == 404
    print("Cross-seller order status update blocked (404)")

    print("\n=== 7. Testing Order Status Transitions & Full Lifecycle ===")
    # 1. Invalid jump from PLACED to DELIVERED rejected (400)
    res_bad_jump = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "DELIVERED"},
    )
    assert res_bad_jump.status_code == 400
    print("Invalid jump PLACED -> DELIVERED rejected (400):", res_bad_jump.json()["detail"])

    # 2. Mario accepts order: PLACED -> ACCEPTED
    res_accept = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "ACCEPTED"},
    )
    assert res_accept.status_code == 200
    assert res_accept.json()["status"] == "ACCEPTED"
    print("Transition PLACED -> ACCEPTED verified.")

    # 3. Customer tries to cancel after order is ACCEPTED (must fail with 400)
    res_cust_cancel = client.patch(f"/api/v1/orders/{order_id}/cancel", headers=headers_alice)
    assert res_cust_cancel.status_code == 400
    print("Customer cancellation of ACCEPTED order rejected (400):", res_cust_cancel.json()["detail"])

    # 4. Mario transitions ACCEPTED -> PREPARING
    res_prep = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "PREPARING"},
    )
    assert res_prep.status_code == 200
    assert res_prep.json()["status"] == "PREPARING"
    print("Transition ACCEPTED -> PREPARING verified.")

    # 5. Mario transitions PREPARING -> READY
    res_ready = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "READY"},
    )
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "READY"
    print("Transition PREPARING -> READY verified.")

    # 6. Mario transitions READY -> OUT_FOR_DELIVERY
    res_out = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "OUT_FOR_DELIVERY"},
    )
    assert res_out.status_code == 200
    assert res_out.json()["status"] == "OUT_FOR_DELIVERY"
    print("Transition READY -> OUT_FOR_DELIVERY verified.")

    # 7. Mario transitions OUT_FOR_DELIVERY -> DELIVERED
    res_deliv = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "DELIVERED"},
    )
    assert res_deliv.status_code == 200
    assert res_deliv.json()["status"] == "DELIVERED"
    print("Transition OUT_FOR_DELIVERY -> DELIVERED verified.")

    # 8. Terminal state check: DELIVERED cannot transition to anything
    res_terminal = client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "CANCELLED"},
    )
    assert res_terminal.status_code == 400
    print("Terminal state modification rejected (400):", res_terminal.json()["detail"])

    print("\n=== 8. Testing Order Rejection & Cancellation Flows ===")
    # Create Order 2 for Alice and test Customer Cancellation from PLACED
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": f2_id, "quantity": 1})
    order2 = client.post("/api/v1/orders", headers=headers_alice, json={"address_id": alice_addr_id}).json()
    order2_id = order2["id"]
    res_cancel_ok = client.patch(f"/api/v1/orders/{order2_id}/cancel", headers=headers_alice)
    assert res_cancel_ok.status_code == 200
    assert res_cancel_ok.json()["status"] == "CANCELLED"
    print("Customer successfully cancelled PLACED order.")

    # Create Order 3 for Alice and test Seller Rejection (PLACED -> REJECTED)
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": f2_id, "quantity": 1})
    order3 = client.post("/api/v1/orders", headers=headers_alice, json={"address_id": alice_addr_id}).json()
    order3_id = order3["id"]
    res_reject_ok = client.patch(
        f"/api/v1/seller/orders/{order3_id}/status",
        headers=headers_mario,
        json={"status": "REJECTED"},
    )
    assert res_reject_ok.status_code == 200
    assert res_reject_ok.json()["status"] == "REJECTED"
    print("Seller successfully rejected PLACED order.")

    print("\n=== 9. Verifying OpenAPI Schema ===")
    openapi_paths = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/orders" in openapi_paths
    assert "/api/v1/orders/{order_id}" in openapi_paths
    assert "/api/v1/orders/{order_id}/cancel" in openapi_paths
    assert "/api/v1/seller/orders" in openapi_paths
    assert "/api/v1/seller/orders/{order_id}" in openapi_paths
    assert "/api/v1/seller/orders/{order_id}/status" in openapi_paths
    print("All Order and Seller Order routes present in OpenAPI documentation!")

    print("\n=== ALL ORDER, CHECKOUT & SELLER MANAGEMENT TESTS PASSED! ===")


if __name__ == "__main__":
    run_tests()
