from app.schemas.payment import (
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    PaymentResponse,
    VerifyPaymentRequest,
)
from app.services.payment_service import PaymentService


class PaymentController:
    """Controller coordinating HTTP-level payment actions."""

    def __init__(self, payment_service: PaymentService) -> None:
        self.payment_service = payment_service

    def create_payment_order(
        self,
        user_id: int,
        data: CreatePaymentOrderRequest,
    ) -> CreatePaymentOrderResponse:
        """Handle Razorpay order generation request."""
        res = self.payment_service.create_payment_order(user_id, data.order_id)
        return CreatePaymentOrderResponse(**res)

    def verify_payment(
        self,
        user_id: int,
        data: VerifyPaymentRequest,
    ) -> PaymentResponse:
        """Handle payment cryptographic verification."""
        payment = self.payment_service.verify_payment(
            user_id=user_id,
            razorpay_order_id=data.razorpay_order_id,
            razorpay_payment_id=data.razorpay_payment_id,
            razorpay_signature=data.razorpay_signature,
        )
        return PaymentResponse.model_validate(payment)

    def get_payment_by_order(
        self,
        user_id: int,
        order_id: int,
    ) -> PaymentResponse:
        """Handle payment query by order ID."""
        payment = self.payment_service.get_payment_by_order_id(user_id, order_id)
        return PaymentResponse.model_validate(payment)

    def handle_webhook(self, payload: bytes, signature: str) -> dict:
        """Handle Razorpay webhook callback."""
        return self.payment_service.handle_webhook(payload, signature)
