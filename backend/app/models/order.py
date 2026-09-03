from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base

if TYPE_CHECKING:
    from app.models.address import Address
    from app.models.notification import Notification
    from app.models.order_item import OrderItem
    from app.models.payment import Payment
    from app.models.restaurant import Restaurant
    from app.models.user import User


class OrderStatus(str, Enum):
    PLACED = "PLACED"
    ACCEPTED = "ACCEPTED"
    PREPARING = "PREPARING"
    READY = "READY"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurants.id"),
        nullable=False,
    )

    address_id: Mapped[int | None] = mapped_column(
        ForeignKey("addresses.id"),
        nullable=True,
    )

    delivery_address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    delivery_latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    delivery_longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    status: Mapped[OrderStatus] = mapped_column(
        SQLEnum(OrderStatus),
        default=OrderStatus.PLACED,
        nullable=False,
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
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

    user: Mapped["User"] = relationship(
        "User",
        back_populates="orders",
    )

    restaurant: Mapped["Restaurant"] = relationship(
        "Restaurant",
        back_populates="orders",
    )

    address: Mapped["Address | None"] = relationship(
        "Address",
        back_populates="orders",
    )

    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    payment: Mapped["Payment | None"] = relationship(
        "Payment",
        back_populates="order",
        uselist=False,
    )

    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="order",
    )
