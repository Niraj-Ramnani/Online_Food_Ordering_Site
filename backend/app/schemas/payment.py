from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

from app.models.payment import PaymentStatus


class CreatePaymentOrderRequest(BaseModel):
    order_id: int = Field(..., description="ID of the order to create payment for")


class CreatePaymentOrderResponse(BaseModel):
    order_id: int
    razorpay_order_id: str
    amount: Decimal
    amount_in_paise: int
    currency: str = "INR"
    key_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(..., description="Razorpay Order ID")
    razorpay_payment_id: str = Field(..., description="Razorpay Payment ID")
    razorpay_signature: str = Field(..., description="Cryptographic signature from Razorpay")


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str | None
    amount: Decimal
    status: PaymentStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
