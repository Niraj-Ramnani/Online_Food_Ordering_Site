from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base

if TYPE_CHECKING:
    from app.models.cart import Cart
    from app.models.food_item import FoodItem
    from app.models.order import Order
    from app.models.user import User


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    is_open: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    seller: Mapped["User"] = relationship(
        "User",
        back_populates="restaurant",
    )

    food_items: Mapped[list["FoodItem"]] = relationship(
        "FoodItem",
        back_populates="restaurant",
    )

    carts: Mapped[list["Cart"]] = relationship(
        "Cart",
        back_populates="restaurant",
    )

    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="restaurant",
    )