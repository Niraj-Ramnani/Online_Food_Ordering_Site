from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.order_item import OrderItem


class OrderItemRepository:
    """Repository handling database operations for OrderItem model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_order_id(self, order_id: int) -> list[OrderItem]:
        """Fetch all items belonging to a specific order."""
        statement = (
            select(OrderItem)
            .where(OrderItem.order_id == order_id)
            .order_by(OrderItem.id.asc())
        )
        return list(self.db.scalars(statement).all())

    def create_many(self, items: list[OrderItem]) -> list[OrderItem]:
        """Persist a batch of order items."""
        self.db.add_all(items)
        self.db.commit()
        return items
