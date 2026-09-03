from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.payment import Payment


class PaymentRepository:
    """Repository handling database operations for Payment model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payment: Payment) -> Payment:
        """Persist a new payment record."""
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def get_by_id(self, payment_id: int) -> Payment | None:
        """Fetch payment by primary key."""
        statement = select(Payment).where(Payment.id == payment_id).options(selectinload(Payment.order))
        return self.db.scalars(statement).first()

    def get_by_order_id(self, order_id: int) -> Payment | None:
        """Fetch payment by associated order ID."""
        statement = select(Payment).where(Payment.order_id == order_id).options(selectinload(Payment.order))
        return self.db.scalars(statement).first()

    def get_by_razorpay_order_id(self, razorpay_order_id: str) -> Payment | None:
        """Fetch payment by Razorpay Order ID."""
        statement = (
            select(Payment)
            .where(Payment.razorpay_order_id == razorpay_order_id)
            .options(selectinload(Payment.order))
        )
        return self.db.scalars(statement).first()

    def get_by_razorpay_payment_id(self, razorpay_payment_id: str) -> Payment | None:
        """Fetch payment by Razorpay Payment ID."""
        statement = (
            select(Payment)
            .where(Payment.razorpay_payment_id == razorpay_payment_id)
            .options(selectinload(Payment.order))
        )
        return self.db.scalars(statement).first()

    def update(self, payment: Payment) -> Payment:
        """Commit changes to an existing payment record."""
        self.db.commit()
        self.db.refresh(payment)
        return payment
