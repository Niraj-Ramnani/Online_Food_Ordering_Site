from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.payment_controller import PaymentController
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.payment_repository import PaymentRepository
from app.schemas.payment import (
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    PaymentResponse,
    VerifyPaymentRequest,
)
from app.services.notification_service import NotificationService
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/api/v1/payments", tags=["Payments"])


def get_payment_controller(db: Session = Depends(get_db)) -> PaymentController:
    """Dependency provider for PaymentController."""
    payment_repo = PaymentRepository(db)
    order_repo = OrderRepository(db)
    notif_repo = NotificationRepository(db)
    notif_service = NotificationService(notif_repo)
    service = PaymentService(
        payment_repo=payment_repo,
        order_repo=order_repo,
        notification_service=notif_service,
    )
    return PaymentController(service)


@router.post(
    "/create-order",
    response_model=CreatePaymentOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Razorpay order for an existing food order",
)
def create_payment_order(
    data: CreatePaymentOrderRequest,
    current_user: User = Depends(get_current_user),
    controller: PaymentController = Depends(get_payment_controller),
) -> CreatePaymentOrderResponse:
    """Generate a Razorpay Order ID for customer checkout."""
    return controller.create_payment_order(current_user.id, data)


@router.post(
    "/verify",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Cryptographically verify Razorpay payment signature",
)
def verify_payment(
    data: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    controller: PaymentController = Depends(get_payment_controller),
) -> PaymentResponse:
    """Verify payment signature from Razorpay checkout modal."""
    return controller.verify_payment(current_user.id, data)


@router.get(
    "/order/{order_id}",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get payment details for a specific order",
)
def get_payment_by_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    controller: PaymentController = Depends(get_payment_controller),
) -> PaymentResponse:
    """Retrieve payment status for an order owned by current user."""
    return controller.get_payment_by_order(current_user.id, order_id)


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Razorpay Webhook endpoint",
)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
    controller: PaymentController = Depends(get_payment_controller),
):
    """Handle verified Razorpay webhook events."""
    if not x_razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Razorpay-Signature header.",
        )
    payload = await request.body()
    return controller.handle_webhook(payload, x_razorpay_signature)
