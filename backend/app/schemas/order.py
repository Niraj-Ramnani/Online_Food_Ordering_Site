from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class CheckoutRequest(BaseModel):
    address_id: int = Field(..., description="ID of the user's delivery address")
    description: str | None = Field(default=None, max_length=500, description="Optional delivery/order instructions")


class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus = Field(..., description="New order status")


class OrderItemResponse(BaseModel):
    id: int
    food_item_id: int
    food_name: str
    quantity: int
    unit_price: Decimal
    item_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class OrderRestaurantResponse(BaseModel):
    id: int
    name: str
    address: str
    image_url: str | None

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    user_id: int
    restaurant: OrderRestaurantResponse
    address_id: int | None
    delivery_address: str
    delivery_latitude: float | None
    delivery_longitude: float | None
    status: OrderStatus
    total_amount: Decimal
    description: str | None
    items: list[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
