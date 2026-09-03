from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.order import Order
from app.models.order_item import OrderItem


class OrderRepository:
    """Repository handling database operations for Order model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, order: Order) -> Order:
        """Persist a new order with its order items atomically."""
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_by_id(self, order_id: int) -> Order | None:
        """Fetch a single order with its items and restaurant preloaded."""
        statement = (
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.order_items),
                selectinload(Order.restaurant),
            )
        )
        return self.db.scalars(statement).first()

    def get_by_user_id(self, user_id: int) -> list[Order]:
        """Fetch all orders placed by a specific user, ordered latest first."""
        statement = (
            select(Order)
            .where(Order.user_id == user_id)
            .options(
                selectinload(Order.order_items),
                selectinload(Order.restaurant),
            )
            .order_by(Order.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def get_by_restaurant_id(self, restaurant_id: int) -> list[Order]:
        """Fetch all orders placed at a specific restaurant, ordered latest first."""
        statement = (
            select(Order)
            .where(Order.restaurant_id == restaurant_id)
            .options(
                selectinload(Order.order_items),
                selectinload(Order.restaurant),
            )
            .order_by(Order.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def update(self, order: Order) -> Order:
        """Commit changes to an existing order."""
        self.db.commit()
        self.db.refresh(order)
        return order
