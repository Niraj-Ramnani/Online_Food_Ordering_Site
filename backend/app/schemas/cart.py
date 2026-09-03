from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class AddToCartRequest(BaseModel):
    food_item_id: int = Field(..., description="ID of the food item to add")
    quantity: int = Field(default=1, gt=0, description="Quantity of food item (must be > 0)")


class UpdateCartItemQuantityRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="New quantity of the cart item (must be > 0)")


class CartItemFoodResponse(BaseModel):
    id: int
    name: str
    price: Decimal
    image_url: str | None
    category: str
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class CartItemResponse(BaseModel):
    id: int
    food_item: CartItemFoodResponse
    quantity: int
    item_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class CartRestaurantResponse(BaseModel):
    id: int
    name: str
    image_url: str | None

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    id: int | None = Field(default=None, description="Cart ID (null if empty)")
    restaurant: CartRestaurantResponse | None = Field(default=None, description="Active restaurant")
    items: list[CartItemResponse] = Field(default_factory=list, description="List of items in the cart")
    subtotal: Decimal = Field(default=Decimal("0.00"), description="Sum total of all item totals")
    total_items: int = Field(default=0, description="Total count of items across all quantities")

    model_config = ConfigDict(from_attributes=True)
