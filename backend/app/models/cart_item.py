from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base

if TYPE_CHECKING:
    from app.models.cart import Cart
    from app.models.food_item import FoodItem


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint("cart_id", "food_item_id", name="uq_cart_food_item"),
        CheckConstraint("quantity > 0", name="check_cart_item_quantity_positive"),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    cart_id: Mapped[int] = mapped_column(
        ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False,
    )

    food_item_id: Mapped[int] = mapped_column(
        ForeignKey("food_items.id"),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    cart: Mapped["Cart"] = relationship(
        "Cart",
        back_populates="cart_items",
    )

    food_item: Mapped["FoodItem"] = relationship(
        "FoodItem",
        back_populates="cart_items",
    )
