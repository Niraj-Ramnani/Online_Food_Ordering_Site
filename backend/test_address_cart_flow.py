from decimal import Decimal
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

    print("=== 1. Setup Users, Restaurants & Food Items ===")
    # Customer A
    res_a = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Alice Customer",
            "email": "alice@user.com",
            "password": "password123",
            "role": "USER",
        },
    )
    assert res_a.status_code == 201
    token_a = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@user.com", "password": "password123"},
    ).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Customer B
    res_b = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Bob Customer",
            "email": "bob@user.com",
            "password": "password123",
            "role": "USER",
        },
    )
    assert res_b.status_code == 201
    token_b = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@user.com", "password": "password123"},
    ).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Seller 1 (Italian)
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Chef Mario",
            "email": "mario@chef.com",
            "password": "password123",
            "role": "SELLER",
        },
    )
    seller_1_token = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@chef.com", "password": "password123"},
    ).json()["access_token"]
    seller_1_headers = {"Authorization": f"Bearer {seller_1_token}"}

    res_r1 = client.post(
        "/api/v1/restaurants",
        headers=seller_1_headers,
        json={"name": "Mario Pizza", "address": "Little Italy 1"},
    )
    r1_id = res_r1.json()["id"]

    # Seller 2 (Burgers)
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Chef Luigi",
            "email": "luigi@chef.com",
            "password": "password123",
            "role": "SELLER",
        },
    )
    seller_2_token = client.post(
        "/api/v1/auth/login",
        json={"email": "luigi@chef.com", "password": "password123"},
    ).json()["access_token"]
    seller_2_headers = {"Authorization": f"Bearer {seller_2_token}"}

    res_r2 = client.post(
        "/api/v1/restaurants",
        headers=seller_2_headers,
        json={"name": "Luigi Burgers", "address": "Main Street 2"},
    )
    r2_id = res_r2.json()["id"]

    # Open and verify restaurants in DB
    db = SessionLocal()
    db_r1 = db.query(Restaurant).filter(Restaurant.id == r1_id).first()
    db_r1.is_verified = True
    db_r1.is_open = True
    db_r2 = db.query(Restaurant).filter(Restaurant.id == r2_id).first()
    db_r2.is_verified = True
    db_r2.is_open = True
    db.commit()
    db.close()

    # Add Food items to Restaurant 1 (Pizza)
    res_f1 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_1_headers,
        json={
            "name": "Margherita Pizza",
            "category": "Pizza",
            "price": "250.00",
        },
    )
    f1_id = res_f1.json()["id"]

    res_f2 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_1_headers,
        json={
            "name": "Garlic Bread",
            "category": "Sides",
            "price": "120.00",
        },
    )
    f2_id = res_f2.json()["id"]

    # Unavailable item in Restaurant 1
    res_f_unavail = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_1_headers,
        json={
            "name": "Seasonal Truffle Pizza",
            "category": "Pizza",
            "price": "499.00",
        },
    )
    f_unavail_id = res_f_unavail.json()["id"]
    client.patch(
        f"/api/v1/food-items/{f_unavail_id}/availability",
        headers=seller_1_headers,
        json={"is_available": False},
    )

    # Add Food item to Restaurant 2 (Burger)
    res_f3 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_2_headers,
        json={
            "name": "Classic Cheeseburger",
            "category": "Burger",
            "price": "180.00",
        },
    )
    f3_id = res_f3.json()["id"]
    print("Setup completed successfully.")

    print("\n=== 2. Testing Address Management ===")
    # Unauthenticated create rejected (401)
    res = client.post("/api/v1/addresses", json={"label": "Home", "address_line": "123 Street", "city": "NYC", "state": "NY", "pincode": "10001"})
    assert res.status_code == 401

    # Invalid latitude rejected (422)
    res_bad_lat = client.post(
        "/api/v1/addresses",
        headers=headers_a,
        json={
            "label": "Home",
            "address_line": "123 Street",
            "city": "NYC",
            "state": "NY",
            "pincode": "10001",
            "latitude": 95.0,  # Invalid (>90)
        },
    )
    assert res_bad_lat.status_code == 422
    print("Invalid latitude rejected (422)")

    # Alice creates Home Address (Default)
    res_addr1 = client.post(
        "/api/v1/addresses",
        headers=headers_a,
        json={
            "label": "Home",
            "address_line": "450 Broadway Ave, Apt 4B",
            "city": "New York",
            "state": "NY",
            "pincode": "10013",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "is_default": True,
        },
    )
    assert res_addr1.status_code == 201
    addr1_data = res_addr1.json()
    assert addr1_data["is_default"] is True
    addr1_id = addr1_data["id"]
    print("Alice created Address 1 (Default):", addr1_data["label"])

    # Alice creates Office Address (Default = True -> should make Address 1 is_default = False)
    res_addr2 = client.post(
        "/api/v1/addresses",
        headers=headers_a,
        json={
            "label": "Office",
            "address_line": "100 Wall Street, Floor 12",
            "city": "New York",
            "state": "NY",
            "pincode": "10005",
            "is_default": True,
        },
    )
    assert res_addr2.status_code == 201
    addr2_id = res_addr2.json()["id"]

    # Verify only Address 2 is default now
    addr1_check = client.get(f"/api/v1/addresses/{addr1_id}", headers=headers_a).json()
    addr2_check = client.get(f"/api/v1/addresses/{addr2_id}", headers=headers_a).json()
    assert addr1_check["is_default"] is False
    assert addr2_check["is_default"] is True
    print("Single default address rule verified (Address 2 is default, Address 1 is false).")

    # Bob creates Address
    res_bob_addr = client.post(
        "/api/v1/addresses",
        headers=headers_b,
        json={
            "label": "Bob House",
            "address_line": "789 Pine St",
            "city": "Boston",
            "state": "MA",
            "pincode": "02108",
        },
    )
    assert res_bob_addr.status_code == 201
    bob_addr_id = res_bob_addr.json()["id"]

    print("\n=== 3. Testing Address Ownership Security ===")
    # Alice trying to view Bob's address (404)
    res_cross_get = client.get(f"/api/v1/addresses/{bob_addr_id}", headers=headers_a)
    assert res_cross_get.status_code == 404
    print("Cross-user address view blocked (404)")

    # Alice trying to update Bob's address (404)
    res_cross_put = client.put(f"/api/v1/addresses/{bob_addr_id}", headers=headers_a, json={"label": "Hacked"})
    assert res_cross_put.status_code == 404
    print("Cross-user address update blocked (404)")

    # Alice trying to set default on Bob's address (404)
    res_cross_def = client.patch(f"/api/v1/addresses/{bob_addr_id}/default", headers=headers_a)
    assert res_cross_def.status_code == 404
    print("Cross-user address set default blocked (404)")

    # Alice trying to delete Bob's address (404)
    res_cross_del = client.delete(f"/api/v1/addresses/{bob_addr_id}", headers=headers_a)
    assert res_cross_del.status_code == 404
    print("Cross-user address delete blocked (404)")

    # Alice updates Address 1 and sets it back to default
    res_set_def = client.patch(f"/api/v1/addresses/{addr1_id}/default", headers=headers_a)
    assert res_set_def.status_code == 200
    assert res_set_def.json()["is_default"] is True
    assert client.get(f"/api/v1/addresses/{addr2_id}", headers=headers_a).json()["is_default"] is False

    # Alice deletes Address 2
    res_del_a2 = client.delete(f"/api/v1/addresses/{addr2_id}", headers=headers_a)
    assert res_del_a2.status_code == 204
    print("Alice deleted Address 2 successfully (204).")

    print("\n=== 4. Testing Cart Management & Empty State ===")
    # Unauthenticated cart get (401)
    assert client.get("/api/v1/cart").status_code == 401

    # Alice views initial empty cart
    res_cart = client.get("/api/v1/cart", headers=headers_a)
    assert res_cart.status_code == 200
    cart_data = res_cart.json()
    assert cart_data["items"] == []
    assert Decimal(str(cart_data["subtotal"])) == Decimal("0.00")
    assert cart_data["total_items"] == 0
    print("Empty cart representation verified:", cart_data)

    print("\n=== 5. Testing Adding Items to Cart & Business Rules ===")
    # 1. Invalid quantity <= 0 rejected
    res_qty0 = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f1_id, "quantity": 0},
    )
    assert res_qty0.status_code == 422
    print("Quantity = 0 rejected (422)")

    # 2. Unavailable food item rejected
    res_unavail = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f_unavail_id, "quantity": 1},
    )
    assert res_unavail.status_code == 400
    print("Unavailable food item addition rejected (400):", res_unavail.json()["detail"])

    # 3. Add Margherita Pizza (qty=2, price=250.00 -> total=500.00)
    res_add1 = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f1_id, "quantity": 2},
    )
    assert res_add1.status_code == 200
    cart1 = res_add1.json()
    assert len(cart1["items"]) == 1
    assert cart1["items"][0]["quantity"] == 2
    assert Decimal(str(cart1["subtotal"])) == Decimal("500.00")
    assert cart1["total_items"] == 2
    cart_item1_id = cart1["items"][0]["id"]
    print("Added Margherita Pizza (qty 2). Subtotal: Rs. 500.00")

    # 4. Duplicate food addition: Add Margherita Pizza again (qty=1 -> total qty=3, subtotal=750.00)
    res_add_dup = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f1_id, "quantity": 1},
    )
    assert res_add_dup.status_code == 200
    cart_dup = res_add_dup.json()
    assert len(cart_dup["items"]) == 1  # Still 1 row!
    assert cart_dup["items"][0]["quantity"] == 3
    assert Decimal(str(cart_dup["subtotal"])) == Decimal("750.00")
    print("Duplicate food addition incremented quantity to 3 (Subtotal: Rs. 750.00).")

    # 5. Add Garlic Bread from same restaurant (qty=2, price=120.00 -> item total=240.00, subtotal=990.00)
    res_add2 = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f2_id, "quantity": 2},
    )
    assert res_add2.status_code == 200
    cart2 = res_add2.json()
    assert len(cart2["items"]) == 2
    assert Decimal(str(cart2["subtotal"])) == Decimal("990.00")
    assert cart2["total_items"] == 5
    cart_item2_id = [item["id"] for item in cart2["items"] if item["food_item"]["id"] == f2_id][0]
    print("Added Garlic Bread (qty 2) from same restaurant. Total subtotal: Rs. 990.00")

    print("\n=== 6. Testing One-Restaurant-Per-Cart Rule ===")
    # 6. Attempt to add Burger from Restaurant 2 while cart has items from Restaurant 1 (must fail with 409 Conflict)
    res_conflict = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f3_id, "quantity": 1},
    )
    assert res_conflict.status_code == 409
    print("Different restaurant addition rejected (409):", res_conflict.json()["detail"])

    # Verify cart is completely intact
    cart_check = client.get("/api/v1/cart", headers=headers_a).json()
    assert len(cart_check["items"]) == 2
    assert Decimal(str(cart_check["subtotal"])) == Decimal("990.00")
    print("Cart state remained unchanged after 409 conflict.")

    print("\n=== 7. Testing Cart Item Quantity Update & Ownership ===")
    # Update quantity of Garlic Bread to 1 (subtotal becomes 750 + 120 = 870)
    res_patch_qty = client.patch(
        f"/api/v1/cart/items/{cart_item2_id}",
        headers=headers_a,
        json={"quantity": 1},
    )
    assert res_patch_qty.status_code == 200
    assert Decimal(str(res_patch_qty.json()["subtotal"])) == Decimal("870.00")
    print("Updated Garlic Bread quantity to 1. New Subtotal: Rs. 870.00")

    # Bob attempts to modify Alice's cart item (404)
    res_cross_patch = client.patch(
        f"/api/v1/cart/items/{cart_item2_id}",
        headers=headers_b,
        json={"quantity": 10},
    )
    assert res_cross_patch.status_code == 404
    print("Cross-user cart modification blocked (404)")

    # Bob attempts to delete Alice's cart item (404)
    res_cross_del_item = client.delete(
        f"/api/v1/cart/items/{cart_item2_id}",
        headers=headers_b,
    )
    assert res_cross_del_item.status_code == 404
    print("Cross-user cart item delete blocked (404)")

    print("\n=== 8. Testing Remove Item & Clear Cart ===")
    # Alice removes Garlic bread
    res_rem = client.delete(
        f"/api/v1/cart/items/{cart_item2_id}",
        headers=headers_a,
    )
    assert res_rem.status_code == 200
    assert len(res_rem.json()["items"]) == 1
    assert Decimal(str(res_rem.json()["subtotal"])) == Decimal("750.00")
    print("Removed Garlic Bread. Remaining items: 1 (Subtotal: Rs. 750.00)")

    # Alice clears entire cart
    res_clear = client.delete("/api/v1/cart", headers=headers_a)
    assert res_clear.status_code == 200
    assert len(res_clear.json()["items"]) == 0
    assert Decimal(str(res_clear.json()["subtotal"])) == Decimal("0.00")
    print("Alice cleared cart successfully.")

    # Now that cart is cleared, Alice can add items from Restaurant 2 (Burgers)
    res_add_r2 = client.post(
        "/api/v1/cart/items",
        headers=headers_a,
        json={"food_item_id": f3_id, "quantity": 2},
    )
    assert res_add_r2.status_code == 200
    assert res_add_r2.json()["restaurant"]["name"] == "Luigi Burgers"
    assert Decimal(str(res_add_r2.json()["subtotal"])) == Decimal("360.00")
    print("Alice added Burger from Restaurant 2 after clearing cart successfully!")

    print("\n=== 9. Testing Seller Can Also Use Address & Cart ===")
    # Seller 1 adds address and cart item
    res_seller_addr = client.post(
        "/api/v1/addresses",
        headers=seller_1_headers,
        json={
            "label": "Seller Home",
            "address_line": "50 Pizza Road",
            "city": "NYC",
            "state": "NY",
            "pincode": "10001",
        },
    )
    assert res_seller_addr.status_code == 201
    res_seller_cart = client.post(
        "/api/v1/cart/items",
        headers=seller_1_headers,
        json={"food_item_id": f3_id, "quantity": 1},
    )
    assert res_seller_cart.status_code == 200
    assert Decimal(str(res_seller_cart.json()["subtotal"])) == Decimal("180.00")
    print("Seller account used address and cart functionality successfully.")

    print("\n=== 10. Verifying OpenAPI Schema ===")
    openapi = client.get("/openapi.json").json()["paths"]
    assert "/api/v1/addresses" in openapi
    assert "/api/v1/addresses/{address_id}" in openapi
    assert "/api/v1/addresses/{address_id}/default" in openapi
    assert "/api/v1/cart" in openapi
    assert "/api/v1/cart/items" in openapi
    assert "/api/v1/cart/items/{cart_item_id}" in openapi
    print("All Address and Cart routes present in OpenAPI schema!")

    print("\n=== ALL ADDRESS & CART INTEGRATION TESTS PASSED! ===")


if __name__ == "__main__":
    run_tests()
