from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config.database import SessionLocal, engine
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

    print("=== 1. Setup Users, Restaurant & Order for Notification Tests ===")
    # Customer Alice
    client.post(
        "/api/v1/auth/register",
        json={"name": "Alice Notif", "email": "alice@notif.com", "password": "password123", "role": "USER"},
    )
    token_alice = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@notif.com", "password": "password123"},
    ).json()["access_token"]
    headers_alice = {"Authorization": f"Bearer {token_alice}"}

    # Customer Bob
    client.post(
        "/api/v1/auth/register",
        json={"name": "Bob Notif", "email": "bob@notif.com", "password": "password123", "role": "USER"},
    )
    token_bob = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@notif.com", "password": "password123"},
    ).json()["access_token"]
    headers_bob = {"Authorization": f"Bearer {token_bob}"}

    # Seller Mario
    client.post(
        "/api/v1/auth/register",
        json={"name": "Chef Mario", "email": "mario@notif.com", "password": "password123", "role": "SELLER"},
    )
    token_mario = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@notif.com", "password": "password123"},
    ).json()["access_token"]
    headers_mario = {"Authorization": f"Bearer {token_mario}"}

    res_r = client.post(
        "/api/v1/restaurants",
        headers=headers_mario,
        json={"name": "Mario Kitchen", "address": "456 Pizza St"},
    )
    rest_id = res_r.json()["id"]

    db = SessionLocal()
    r = db.query(Restaurant).filter(Restaurant.id == rest_id).first()
    r.is_verified = True
    r.is_open = True
    db.commit()
    db.close()

    res_f = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=headers_mario,
        json={"name": "Veggie Supreme", "category": "Pizza", "price": "220.00"},
    )
    food_id = res_f.json()["id"]

    res_addr = client.post(
        "/api/v1/addresses",
        headers=headers_alice,
        json={"label": "Home", "address_line": "123 Notif Lane", "city": "NYC", "state": "NY", "pincode": "10001"},
    )
    addr_id = res_addr.json()["id"]

    # Place order: Alice orders pizza -> creates notifications for both Alice and Mario
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": food_id, "quantity": 1})
    res_order = client.post("/api/v1/orders", headers=headers_alice, json={"address_id": addr_id})
    order_id = res_order.json()["id"]
    print("Order placed with ID:", order_id)

    print("\n=== 2. Testing Order Event Notifications ===")
    # 1. Check Alice's notifications (Should have "Order Placed")
    res_alice_notifs = client.get("/api/v1/notifications", headers=headers_alice)
    assert res_alice_notifs.status_code == 200
    alice_notifs = res_alice_notifs.json()
    assert len(alice_notifs) == 1
    assert alice_notifs[0]["title"] == "Order Placed"
    assert alice_notifs[0]["is_read"] is False
    alice_notif_id = alice_notifs[0]["id"]
    print("Alice received 'Order Placed' notification:", alice_notifs[0]["title"])

    # 2. Check Mario's notifications (Should have "New Order Received")
    res_mario_notifs = client.get("/api/v1/notifications", headers=headers_mario)
    assert res_mario_notifs.status_code == 200
    mario_notifs = res_mario_notifs.json()
    assert len(mario_notifs) == 1
    assert mario_notifs[0]["title"] == "New Order Received"
    print("Mario received 'New Order Received' notification:", mario_notifs[0]["title"])

    # 3. Check Bob has 0 notifications
    res_bob_notifs = client.get("/api/v1/notifications", headers=headers_bob)
    assert res_bob_notifs.status_code == 200
    assert len(res_bob_notifs.json()) == 0

    print("\n=== 3. Testing Order Status Update Notifications ===")
    # Mario accepts order -> Alice receives "Order Accepted" notification
    client.patch(
        f"/api/v1/seller/orders/{order_id}/status",
        headers=headers_mario,
        json={"status": "ACCEPTED"},
    )
    alice_notifs_updated = client.get("/api/v1/notifications", headers=headers_alice).json()
    assert len(alice_notifs_updated) == 2
    assert alice_notifs_updated[0]["title"] == "Order Accepted"
    print("Alice received 'Order Accepted' notification after seller update!")

    # Check unread count for Alice
    res_count = client.get("/api/v1/notifications/unread-count", headers=headers_alice)
    assert res_count.status_code == 200
    assert res_count.json()["unread_count"] == 2

    print("\n=== 4. Testing Mark Notification As Read & Read All ===")
    # 1. Bob cannot mark Alice's notification as read (404)
    res_cross_mark = client.patch(f"/api/v1/notifications/{alice_notif_id}/read", headers=headers_bob)
    assert res_cross_mark.status_code == 404
    print("Cross-user notification modification blocked (404)")

    # 2. Alice marks single notification as read
    res_mark_single = client.patch(f"/api/v1/notifications/{alice_notif_id}/read", headers=headers_alice)
    assert res_mark_single.status_code == 200
    assert res_mark_single.json()["is_read"] is True

    # Verify unread count decreased to 1
    assert client.get("/api/v1/notifications/unread-count", headers=headers_alice).json()["unread_count"] == 1

    # Filter unread notifications
    res_unread_only = client.get("/api/v1/notifications?unread_only=true", headers=headers_alice)
    assert len(res_unread_only.json()) == 1

    # 3. Alice marks all notifications as read
    res_read_all = client.patch("/api/v1/notifications/read-all", headers=headers_alice)
    assert res_read_all.status_code == 200
    assert res_read_all.json()["count"] == 1

    # Verify unread count is now 0
    assert client.get("/api/v1/notifications/unread-count", headers=headers_alice).json()["unread_count"] == 0
    print("Mark all notifications as read verified successfully!")

    print("\n=== ALL NOTIFICATION TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_tests()
