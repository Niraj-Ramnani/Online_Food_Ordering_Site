from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config.database import SessionLocal, engine
from app.main import app
from app.models.user import User, UserRole
from app.security.password import hash_password

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

    print("=== 1. Setup Admin, Seller & Customer Users ===")
    # 1. Create Admin directly in database (outside public registration)
    db = SessionLocal()
    admin_user = User(
        name="Platform SuperAdmin",
        email="admin@foodplatform.com",
        password_hash=hash_password("adminpassword123"),
        role=UserRole.ADMIN,
        is_verified=True,
        is_active=True,
    )
    db.add(admin_user)
    db.commit()
    db.close()

    # Admin Login
    res_admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@foodplatform.com", "password": "adminpassword123"},
    )
    assert res_admin_login.status_code == 200
    admin_token = res_admin_login.json()["access_token"]
    headers_admin = {"Authorization": f"Bearer {admin_token}"}

    # 2. Customer
    client.post(
        "/api/v1/auth/register",
        json={"name": "Alice User", "email": "alice@admin.com", "password": "password123", "role": "USER"},
    )
    token_alice = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@admin.com", "password": "password123"},
    ).json()["access_token"]
    headers_alice = {"Authorization": f"Bearer {token_alice}"}

    # 3. Seller
    client.post(
        "/api/v1/auth/register",
        json={"name": "Chef Mario", "email": "mario@admin.com", "password": "password123", "role": "SELLER"},
    )
    token_mario = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@admin.com", "password": "password123"},
    ).json()["access_token"]
    headers_mario = {"Authorization": f"Bearer {token_mario}"}

    # Mario creates restaurant
    res_r = client.post(
        "/api/v1/restaurants",
        headers=headers_mario,
        json={"name": "Mario's Pizzeria", "address": "100 Olive Way"},
    )
    rest_id = res_r.json()["id"]

    # Mario creates food item
    res_f = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=headers_mario,
        json={"name": "Margherita", "category": "Pizza", "price": "199.00"},
    )
    food_id = res_f.json()["id"]

    print("Setup completed successfully.")

    print("\n=== 2. Testing Admin Role Authorization Security ===")
    # 1. Unauthenticated request rejected (401)
    assert client.get("/api/v1/admin/dashboard").status_code == 401

    # 2. Customer denied access to admin endpoints (403)
    res_cust_admin = client.get("/api/v1/admin/dashboard", headers=headers_alice)
    assert res_cust_admin.status_code == 403
    print("Customer denied admin access (403):", res_cust_admin.json()["detail"])

    # 3. Seller denied access to admin endpoints (403)
    res_seller_admin = client.get("/api/v1/admin/dashboard", headers=headers_mario)
    assert res_seller_admin.status_code == 403
    print("Seller denied admin access (403)")

    print("\n=== 3. Testing Admin Dashboard Statistics ===")
    res_dash = client.get("/api/v1/admin/dashboard", headers=headers_admin)
    assert res_dash.status_code == 200
    stats = res_dash.json()
    assert stats["total_users"] >= 1
    assert stats["total_sellers"] >= 1
    assert stats["total_restaurants"] >= 1
    assert stats["verified_restaurants"] == 0  # Not yet verified
    print("Dashboard statistics retrieved successfully:", stats)

    print("\n=== 4. Testing Admin User Management ===")
    # 1. List users (ensure password_hash is not present in response)
    res_users = client.get("/api/v1/admin/users", headers=headers_admin)
    assert res_users.status_code == 200
    users_list = res_users.json()
    assert len(users_list) == 3
    for u in users_list:
        assert "password" not in u
        assert "password_hash" not in u
    print("Admin listed users securely without exposing password hashes!")

    alice_db_id = [u["id"] for u in users_list if u["email"] == "alice@admin.com"][0]

    # 2. Deactivate Alice's account
    res_deact = client.patch(
        f"/api/v1/admin/users/{alice_db_id}/status",
        headers=headers_admin,
        json={"is_active": False},
    )
    assert res_deact.status_code == 200
    assert res_deact.json()["is_active"] is False

    # Alice cannot login while inactive (403)
    res_alice_blocked = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@admin.com", "password": "password123"},
    )
    assert res_alice_blocked.status_code == 403
    print("Deactivated user login blocked (403).")

    # Reactivate Alice
    client.patch(
        f"/api/v1/admin/users/{alice_db_id}/status",
        headers=headers_admin,
        json={"is_active": True},
    )

    print("\n=== 5. Testing Admin Restaurant Management & Verification ===")
    # 1. List restaurants
    res_rests = client.get("/api/v1/admin/restaurants", headers=headers_admin)
    assert res_rests.status_code == 200
    assert len(res_rests.json()) == 1
    assert res_rests.json()[0]["is_verified"] is False

    # 2. Verify restaurant
    res_verify = client.patch(
        f"/api/v1/admin/restaurants/{rest_id}/verify",
        headers=headers_admin,
        json={"is_verified": True},
    )
    assert res_verify.status_code == 200
    assert res_verify.json()["is_verified"] is True
    print("Admin verified restaurant successfully!")

    # 3. Toggle restaurant status (open/closed)
    res_open = client.patch(
        f"/api/v1/admin/restaurants/{rest_id}/status",
        headers=headers_admin,
        json={"is_open": True},
    )
    assert res_open.status_code == 200
    assert res_open.json()["is_open"] is True

    print("\n=== 6. Testing Admin Food Items Management ===")
    # 1. List food items
    res_foods = client.get("/api/v1/admin/food-items", headers=headers_admin)
    assert res_foods.status_code == 200
    assert len(res_foods.json()) == 1

    # 2. Admin disables food availability
    res_food_stat = client.patch(
        f"/api/v1/admin/food-items/{food_id}/status",
        headers=headers_admin,
        json={"is_available": False},
    )
    assert res_food_stat.status_code == 200
    assert res_food_stat.json()["is_available"] is False
    print("Admin toggled food item availability successfully.")

    # Re-enable food item
    client.patch(
        f"/api/v1/admin/food-items/{food_id}/status",
        headers=headers_admin,
        json={"is_available": True},
    )

    print("\n=== 7. Testing Admin Order Oversight ===")
    # Alice creates address and places an order
    res_addr = client.post(
        "/api/v1/addresses",
        headers=headers_alice,
        json={"label": "Home", "address_line": "123 Admin Way", "city": "NYC", "state": "NY", "pincode": "10001"},
    )
    addr_id = res_addr.json()["id"]
    client.post("/api/v1/cart/items", headers=headers_alice, json={"food_item_id": food_id, "quantity": 1})
    res_order = client.post("/api/v1/orders", headers=headers_alice, json={"address_id": addr_id})
    order_id = res_order.json()["id"]

    # Admin lists orders
    res_orders = client.get("/api/v1/admin/orders", headers=headers_admin)
    assert res_orders.status_code == 200
    assert len(res_orders.json()) == 1

    # Admin views single order
    res_single_order = client.get(f"/api/v1/admin/orders/{order_id}", headers=headers_admin)
    assert res_single_order.status_code == 200
    assert res_single_order.json()["id"] == order_id
    assert Decimal(str(res_single_order.json()["total_amount"])) == Decimal("199.00")
    print("Admin retrieved platform order details successfully!")

    print("\n=== 8. Verifying OpenAPI / Swagger Admin Routes ===")
    openapi = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/admin/dashboard" in openapi
    assert "/api/v1/admin/users" in openapi
    assert "/api/v1/admin/users/{user_id}/status" in openapi
    assert "/api/v1/admin/restaurants" in openapi
    assert "/api/v1/admin/restaurants/{restaurant_id}/verify" in openapi
    assert "/api/v1/admin/food-items" in openapi
    assert "/api/v1/admin/orders" in openapi
    print("All Admin endpoints verified in OpenAPI schema!")

    print("\n=== ALL ADMIN TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_tests()
