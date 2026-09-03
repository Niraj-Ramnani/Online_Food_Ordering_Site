import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:100@localhost:5432/food_ordering",
)

JWT_SECRET_KEY: str = os.getenv(
    "JWT_SECRET_KEY",
    "supersecretjwtkey_change_in_production_1234567890",
)

JWT_ALGORITHM: str = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

REFRESH_TOKEN_EXPIRE_DAYS: int = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")
)

CORS_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

RAZORPAY_KEY_ID: str = os.getenv(
    "RAZORPAY_KEY_ID",
    "rzp_test_TXfRQ9VKtlxYC3",
)

RAZORPAY_KEY_SECRET: str = os.getenv(
    "RAZORPAY_KEY_SECRET",
    "VG3lAs1tImwTDQOiR6kKbSZh",
)

RAZORPAY_WEBHOOK_SECRET: str = os.getenv(
    "RAZORPAY_WEBHOOK_SECRET",
    "test_webhook_secret_123",
)