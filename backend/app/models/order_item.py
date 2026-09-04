from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base

if TYPE_CHECKING:
    from app.models.food_item import FoodItem
    from app.models.order import Order


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_order_item_quantity_positive"),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )

    food_item_id: Mapped[int] = mapped_column(
        ForeignKey("food_items.id"),
        nullable=False,
    )

    food_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="order_items",
    )

    food_item: Mapped["FoodItem"] = relationship(
        "FoodItem",
        back_populates="order_items",
    )
