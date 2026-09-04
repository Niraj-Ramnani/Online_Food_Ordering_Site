from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.config.database import SessionLocal, engine
from app.main import app
from app.models.restaurant import Restaurant
from app.models.user import User, UserRole

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

    print("=== 1. Setup Test Users ===")
    # Register Seller A
    res_seller_a = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Mario Rossi",
            "email": "mario@pizza.com",
            "password": "password123",
            "role": "SELLER",
        },
    )
    assert res_seller_a.status_code == 201
    seller_a_token = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@pizza.com", "password": "password123"},
    ).json()["access_token"]
    seller_a_headers = {"Authorization": f"Bearer {seller_a_token}"}

    # Register Seller B
    res_seller_b = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Luigi Verde",
            "email": "luigi@burger.com",
            "password": "password123",
            "role": "SELLER",
        },
    )
    assert res_seller_b.status_code == 201
    seller_b_token = client.post(
        "/api/v1/auth/login",
        json={"email": "luigi@burger.com", "password": "password123"},
    ).json()["access_token"]
    seller_b_headers = {"Authorization": f"Bearer {seller_b_token}"}

    # Register Normal Customer
    res_cust = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Customer John",
            "email": "customer@user.com",
            "password": "password123",
            "role": "USER",
        },
    )
    assert res_cust.status_code == 201
    cust_token = client.post(
        "/api/v1/auth/login",
        json={"email": "customer@user.com", "password": "password123"},
    ).json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}
    print("Users setup completed successfully.")

    print("\n=== 2. Testing Seller Restaurant Creation & Constraints ===")
    # Customer trying to create restaurant (must fail with 403)
    res = client.post(
        "/api/v1/restaurants",
        headers=cust_headers,
        json={
            "name": "Customer Pizza",
            "address": "123 Street",
        },
    )
    assert res.status_code == 403
    print("Customer denied restaurant creation (403):", res.json()["detail"])

    # Unauthenticated create attempt (401)
    res = client.post(
        "/api/v1/restaurants",
        json={"name": "Anon Pizza", "address": "123 Street"},
    )
    assert res.status_code == 401
    print("Unauthenticated creation rejected (401)")

    # Seller A creates Restaurant A
    res_rest_a = client.post(
        "/api/v1/restaurants",
        headers=seller_a_headers,
        json={
            "name": "Mario's Pizzeria",
            "description": "Authentic wood-fired Italian pizza",
            "address": "Via Roma 42, Little Italy",
            "image_url": "https://example.com/pizza.jpg",
        },
    )
    assert res_rest_a.status_code == 201, res_rest_a.text
    rest_a_data = res_rest_a.json()
    assert rest_a_data["name"] == "Mario's Pizzeria"
    assert rest_a_data["is_verified"] is False
    assert rest_a_data["is_open"] is False
    rest_a_id = rest_a_data["id"]
    print("Seller A created restaurant successfully:", rest_a_data["name"])

    # Seller A tries to create a 2nd restaurant (must fail with 409 Conflict)
    res_rest_a2 = client.post(
        "/api/v1/restaurants",
        headers=seller_a_headers,
        json={
            "name": "Mario's 2nd Place",
            "address": "Via Napoli 10",
        },
    )
    assert res_rest_a2.status_code == 409
    print("Seller 2nd restaurant creation rejected (409):", res_rest_a2.json()["detail"])

    # Seller B creates Restaurant B
    res_rest_b = client.post(
        "/api/v1/restaurants",
        headers=seller_b_headers,
        json={
            "name": "Luigi's Burgers",
            "description": "Juicy gourmet smash burgers",
            "address": "5th Avenue 100",
            "image_url": "https://example.com/burger.jpg",
        },
    )
    assert res_rest_b.status_code == 201
    rest_b_id = res_rest_b.json()["id"]
    print("Seller B created restaurant successfully:", res_rest_b.json()["name"])

    print("\n=== 3. Testing Seller View, Update & Status ===")
    # View own restaurant
    res_me = client.get("/api/v1/restaurants/me", headers=seller_a_headers)
    assert res_me.status_code == 200
    assert res_me.json()["id"] == rest_a_id
    print("Seller A retrieved own restaurant successfully.")

    # Update own restaurant details
    res_update = client.put(
        "/api/v1/restaurants/me",
        headers=seller_a_headers,
        json={
            "name": "Mario's Authentic Pizzeria & Pasta",
            "description": "Handmade pasta and wood-fired pizza",
        },
    )
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Mario's Authentic Pizzeria & Pasta"
    assert res_update.json()["is_verified"] is False  # Cannot change is_verified
    print("Seller A updated restaurant details successfully.")

    # Toggle open/close status
    res_status = client.patch(
        "/api/v1/restaurants/me/status",
        headers=seller_a_headers,
        json={"is_open": True},
    )
    assert res_status.status_code == 200
    assert res_status.json()["is_open"] is True
    assert res_status.json()["is_verified"] is False
    print("Seller A toggled restaurant status (is_open = True).")

    print("\n=== 4. Testing Public Restaurant Endpoints & Verification Rule ===")
    # Public listing before verification (should be empty because restaurants are not verified yet)
    res_public = client.get("/api/v1/restaurants")
    assert res_public.status_code == 200
    assert len(res_public.json()) == 0
    print("Unverified restaurants correctly omitted from public list.")

    # Public single restaurant before verification (should return 404)
    res_public_a = client.get(f"/api/v1/restaurants/{rest_a_id}")
    assert res_public_a.status_code == 404
    print("Unverified restaurant details correctly return 404.")

    # Admin verifies Restaurant A directly in DB
    db = SessionLocal()
    db_rest_a = db.query(Restaurant).filter(Restaurant.id == rest_a_id).first()
    db_rest_a.is_verified = True
    db.commit()
    db.close()
    print("Simulated Admin verification of Restaurant A.")

    # Public listing after verification (Restaurant A should now appear, Restaurant B should not)
    res_public_after = client.get("/api/v1/restaurants")
    assert res_public_after.status_code == 200
    public_list = res_public_after.json()
    assert len(public_list) == 1
    assert public_list[0]["id"] == rest_a_id
    print("Public restaurant listing shows verified Restaurant A!")

    # Public detail of Restaurant A
    res_pub_detail = client.get(f"/api/v1/restaurants/{rest_a_id}")
    assert res_pub_detail.status_code == 200
    assert res_pub_detail.json()["name"] == "Mario's Authentic Pizzeria & Pasta"
    print("Public detail returns verified Restaurant A successfully.")

    print("\n=== 5. Testing Food Item Creation & Validation ===")
    # Invalid Price <= 0 rejected
    res_bad_price = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
        json={
            "name": "Free Pizza",
            "category": "Pizza",
            "price": "0.00",
        },
    )
    assert res_bad_price.status_code == 422
    print("Zero price rejected (422)")

    # Negative price rejected
    res_neg_price = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
        json={
            "name": "Negative Pizza",
            "category": "Pizza",
            "price": "-150.00",
        },
    )
    assert res_neg_price.status_code == 422
    print("Negative price rejected (422)")

    # Invalid image url rejected
    res_bad_img = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
        json={
            "name": "Pizza",
            "category": "Pizza",
            "price": "299.00",
            "image_url": "ftp://invalid-scheme.com",
        },
    )
    assert res_bad_img.status_code == 422
    print("Invalid image URL rejected (422)")

    # Seller A creates Margherita Pizza
    res_food_a1 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
        json={
            "name": "Margherita Pizza",
            "description": "Tomato sauce, mozzarella, and fresh basil",
            "category": "Pizza",
            "price": "299.00",
            "image_url": "https://example.com/margherita.jpg",
        },
    )
    assert res_food_a1.status_code == 201
    food_a1_data = res_food_a1.json()
    assert food_a1_data["name"] == "Margherita Pizza"
    assert Decimal(str(food_a1_data["price"])) == Decimal("299.00")
    assert food_a1_data["is_available"] is True
    food_a1_id = food_a1_data["id"]
    print("Seller A created food item 1:", food_a1_data["name"])

    # Seller A creates Tiramisu
    res_food_a2 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
        json={
            "name": "Classic Tiramisu",
            "description": "Espresso-soaked ladyfingers with mascarpone",
            "category": "Dessert",
            "price": "180.00",
        },
    )
    assert res_food_a2.status_code == 201
    food_a2_id = res_food_a2.json()["id"]
    print("Seller A created food item 2:", res_food_a2.json()["name"])

    # Seller B creates Classic Smash Burger
    res_food_b1 = client.post(
        "/api/v1/restaurants/me/food-items",
        headers=seller_b_headers,
        json={
            "name": "Double Smash Burger",
            "description": "Double beef patty with cheddar and special sauce",
            "category": "Burgers",
            "price": "349.00",
        },
    )
    assert res_food_b1.status_code == 201
    food_b1_id = res_food_b1.json()["id"]
    print("Seller B created food item:", res_food_b1.json()["name"])

    # Seller A lists own food items
    res_seller_a_items = client.get(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
    )
    assert res_seller_a_items.status_code == 200
    assert len(res_seller_a_items.json()) == 2
    print("Seller A listed all own food items (2 items).")

    print("\n=== 6. Testing Food Item Ownership Enforcement ===")
    # Seller A attempts to update Seller B's burger (must fail with 403 Forbidden)
    res_steal_update = client.put(
        f"/api/v1/food-items/{food_b1_id}",
        headers=seller_a_headers,
        json={"name": "Hacked Burger", "price": "1.00"},
    )
    assert res_steal_update.status_code == 403
    print("Cross-seller update blocked (403):", res_steal_update.json()["detail"])

    # Seller A attempts to toggle availability on Seller B's burger (403 Forbidden)
    res_steal_avail = client.patch(
        f"/api/v1/food-items/{food_b1_id}/availability",
        headers=seller_a_headers,
        json={"is_available": False},
    )
    assert res_steal_avail.status_code == 403
    print("Cross-seller availability toggle blocked (403)")

    # Seller A attempts to delete Seller B's burger (403 Forbidden)
    res_steal_del = client.delete(
        f"/api/v1/food-items/{food_b1_id}",
        headers=seller_a_headers,
    )
    assert res_steal_del.status_code == 403
    print("Cross-seller delete blocked (403)")

    print("\n=== 7. Testing Seller Food Item Update & Availability ===")
    # Seller A updates Margherita Pizza
    res_up_food = client.put(
        f"/api/v1/food-items/{food_a1_id}",
        headers=seller_a_headers,
        json={
            "name": "Signature Margherita Pizza",
            "price": "319.00",
        },
    )
    assert res_up_food.status_code == 200
    assert res_up_food.json()["name"] == "Signature Margherita Pizza"
    assert Decimal(str(res_up_food.json()["price"])) == Decimal("319.00")
    print("Seller A updated own food item successfully.")

    # Seller A marks Tiramisu unavailable
    res_toggle_avail = client.patch(
        f"/api/v1/food-items/{food_a2_id}/availability",
        headers=seller_a_headers,
        json={"is_available": False},
    )
    assert res_toggle_avail.status_code == 200
    assert res_toggle_avail.json()["is_available"] is False
    print("Seller A toggled Tiramisu availability to False.")

    print("\n=== 8. Testing Public Food Items Browsing ===")
    # Public browsing food items for verified Restaurant A (only available items should appear)
    res_pub_food = client.get(f"/api/v1/restaurants/{rest_a_id}/food-items")
    assert res_pub_food.status_code == 200
    pub_items = res_pub_food.json()
    assert len(pub_items) == 1
    assert pub_items[0]["id"] == food_a1_id
    print("Public food items list correctly filtered out unavailable Tiramisu!")

    # Public single food item detail for available item
    res_item_detail = client.get(f"/api/v1/food-items/{food_a1_id}")
    assert res_item_detail.status_code == 200
    assert res_item_detail.json()["name"] == "Signature Margherita Pizza"
    print("Public food item detail retrieved successfully.")

    # Public single food item detail for unavailable item (should return 404)
    res_item_unavail = client.get(f"/api/v1/food-items/{food_a2_id}")
    assert res_item_unavail.status_code == 404
    print("Unavailable food item detail correctly returns 404.")

    # Public food items for unverified Restaurant B (should return 404)
    res_unver_food = client.get(f"/api/v1/restaurants/{rest_b_id}/food-items")
    assert res_unver_food.status_code == 404
    print("Food items for unverified restaurant correctly return 404.")

    print("\n=== 9. Testing Food Item Deletion ===")
    # Seller A deletes Tiramisu
    res_del = client.delete(
        f"/api/v1/food-items/{food_a2_id}",
        headers=seller_a_headers,
    )
    assert res_del.status_code == 204
    print("Seller A deleted Tiramisu successfully (204 No Content).")

    # Confirm item no longer in seller's list
    res_seller_after_del = client.get(
        "/api/v1/restaurants/me/food-items",
        headers=seller_a_headers,
    )
    assert len(res_seller_after_del.json()) == 1
    assert res_seller_after_del.json()[0]["id"] == food_a1_id
    print("Item deletion verified in seller's food item list.")

    print("\n=== 10. Verifying OpenAPI / Swagger Routes ===")
    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    paths = openapi_res.json()["paths"]
    assert "/api/v1/restaurants" in paths
    assert "/api/v1/restaurants/me" in paths
    assert "/api/v1/restaurants/me/status" in paths
    assert "/api/v1/restaurants/me/food-items" in paths
    assert "/api/v1/restaurants/{restaurant_id}" in paths
    assert "/api/v1/restaurants/{restaurant_id}/food-items" in paths
    assert "/api/v1/food-items/{food_item_id}" in paths
    assert "/api/v1/food-items/{food_item_id}/availability" in paths
    print("All restaurant and food item routes verified in OpenAPI schema!")

    print("\n=== ALL RESTAURANT & FOOD ITEM INTEGRATION TESTS PASSED! ===")


if __name__ == "__main__":
    run_tests()
