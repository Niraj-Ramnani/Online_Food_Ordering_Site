import time
from datetime import timedelta
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.config.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.security.password import verify_password
from app.security.jwt import create_access_token, create_refresh_token
from app.dependencies.auth import require_role
from fastapi import Depends

client = TestClient(app)


def run_tests():
    print("=== 1. Testing Health Endpoint ===")
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    print("Health OK:", res.json())

    # Cleanup any previous test data
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

    print("\n=== 2. Testing Registration ===")
    # Valid user registration
    reg_user = client.post(
        "/api/v1/auth/register",
        json={
            "name": "John Doe",
            "email": "john@example.com",
            "password": "password123",
            "role": "USER",
        },
    )
    assert reg_user.status_code == 201, reg_user.text
    user_data = reg_user.json()
    assert user_data["email"] == "john@example.com"
    assert user_data["role"] == "USER"
    assert "password" not in user_data
    assert "password_hash" not in user_data
    print("Customer registration passed:", user_data)

    # Valid seller registration
    reg_seller = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Chef Mario",
            "email": "mario@example.com",
            "password": "password123",
            "role": "SELLER",
        },
    )
    assert reg_seller.status_code == 201
    seller_data = reg_seller.json()
    assert seller_data["role"] == "SELLER"
    print("Seller registration passed:", seller_data)

    # Duplicate email registration
    reg_dup = client.post(
        "/api/v1/auth/register",
        json={
            "name": "John Duplicate",
            "email": "john@example.com",
            "password": "password123",
            "role": "USER",
        },
    )
    assert reg_dup.status_code == 409
    print("Duplicate email rejected (409):", reg_dup.json()["detail"])

    # ADMIN registration attempt (must fail)
    reg_admin = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Super Admin",
            "email": "admin@example.com",
            "password": "password123",
            "role": "ADMIN",
        },
    )
    assert reg_admin.status_code == 422 or reg_admin.status_code == 400
    print("Admin registration attempt rejected:", reg_admin.status_code)

    # Invalid email format
    reg_bad_email = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Bad Email",
            "email": "not-an-email",
            "password": "password123",
            "role": "USER",
        },
    )
    assert reg_bad_email.status_code == 422
    print("Invalid email rejected (422)")

    # Short password
    reg_short_pwd = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Short Pwd",
            "email": "short@example.com",
            "password": "123",
            "role": "USER",
        },
    )
    assert reg_short_pwd.status_code == 422
    print("Short password rejected (422)")

    print("\n=== 3. Testing Database Password Hashing ===")
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == "john@example.com").first()
    assert db_user is not None
    assert db_user.password_hash != "password123"
    assert db_user.password_hash.startswith("$2b$") or db_user.password_hash.startswith("$2a$")
    assert verify_password("password123", db_user.password_hash) is True
    assert verify_password("wrongpassword", db_user.password_hash) is False
    db.close()
    print("Password securely stored with bcrypt hash in DB!")

    print("\n=== 4. Testing Login ===")
    # Valid login
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "john@example.com",
            "password": "password123",
        },
    )
    assert login_res.status_code == 200
    tokens = login_res.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]
    print("Login successful with access and refresh tokens!")

    # Wrong password
    login_wrong = client.post(
        "/api/v1/auth/login",
        json={
            "email": "john@example.com",
            "password": "wrongpassword",
        },
    )
    assert login_wrong.status_code == 401
    print("Wrong password rejected (401):", login_wrong.json()["detail"])

    # Nonexistent user
    login_nonexistent = client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123",
        },
    )
    assert login_nonexistent.status_code == 401
    print("Nonexistent user rejected (401):", login_nonexistent.json()["detail"])

    # Inactive user login
    db = SessionLocal()
    inactive_user = User(
        name="Inactive",
        email="inactive@example.com",
        password_hash=db_user.password_hash,
        role=UserRole.USER,
        is_active=False,
    )
    db.add(inactive_user)
    db.commit()
    db.close()
    login_inactive = client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactive@example.com",
            "password": "password123",
        },
    )
    assert login_inactive.status_code == 403
    print("Inactive user rejected (403):", login_inactive.json()["detail"])

    print("\n=== 5. Testing /me Endpoint & JWT ===")
    # Valid token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "john@example.com"
    print("/me endpoint successful:", me_res.json())

    # Missing token
    me_missing = client.get("/api/v1/auth/me")
    assert me_missing.status_code == 401
    print("/me missing token rejected (401)")

    # Invalid token
    me_invalid = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid.token.value"},
    )
    assert me_invalid.status_code == 401
    print("/me invalid token rejected (401)")

    # Expired token
    expired_token = create_access_token(
        {"sub": str(user_data["id"]), "role": "USER"},
        expires_delta=timedelta(seconds=-10),
    )
    me_expired = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert me_expired.status_code == 401
    print("/me expired token rejected (401):", me_expired.json()["detail"])

    print("\n=== 6. Testing Token Refresh ===")
    # Valid refresh
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    new_tokens = refresh_res.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    print("Token refresh successful!")

    # Verify new access token works on /me
    me_refreshed = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"},
    )
    assert me_refreshed.status_code == 200
    assert me_refreshed.json()["email"] == "john@example.com"
    print("/me with refreshed token successful!")

    # Invalid refresh token
    refresh_bad = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "bad.token"},
    )
    assert refresh_bad.status_code == 401
    print("Invalid refresh token rejected (401)")

    # Using access token as refresh token (type mismatch)
    refresh_wrong_type = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": access_token},
    )
    assert refresh_wrong_type.status_code == 401
    print("Access token used as refresh token rejected (401):", refresh_wrong_type.json()["detail"])

    print("\n=== 7. Testing Role Authorization Dependency ===")
    seller_login = client.post(
        "/api/v1/auth/login",
        json={"email": "mario@example.com", "password": "password123"},
    ).json()
    seller_token = seller_login["access_token"]

    @app.get("/test/seller-only", tags=["Test"])
    def seller_only(current_user: User = Depends(require_role(UserRole.SELLER))):
        return {"message": "Welcome seller!", "seller_name": current_user.name}

    # Customer accessing seller endpoint
    cust_try = client.get(
        "/test/seller-only",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert cust_try.status_code == 403
    print("Customer denied access to seller resource (403):", cust_try.json()["detail"])

    # Seller accessing seller endpoint
    seller_ok = client.get(
        "/test/seller-only",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert seller_ok.status_code == 200
    assert seller_ok.json()["seller_name"] == "Chef Mario"
    print("Seller authorized successfully (200):", seller_ok.json())

    print("\n=== 8. Testing OpenAPI Docs / OpenAPI Schema ===")
    docs_res = client.get("/openapi.json")
    assert docs_res.status_code == 200
    openapi_schema = docs_res.json()
    assert "/api/v1/auth/register" in openapi_schema["paths"]
    assert "/api/v1/auth/login" in openapi_schema["paths"]
    assert "/api/v1/auth/refresh" in openapi_schema["paths"]
    assert "/api/v1/auth/me" in openapi_schema["paths"]
    print("OpenAPI / Swagger routes verified successfully!")

    print("\n=== ALL AUTHENTICATION AND ARCHITECTURE TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_tests()
