from datetime import datetime
from decimal import Decimal
import re
from pydantic import BaseModel, ConfigDict, Field, field_validator

URL_REGEX = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)


class CreateFoodItemRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Food item name")
    description: str | None = Field(default=None, max_length=1000, description="Food item description")
    category: str = Field(..., min_length=1, max_length=50, description="Food category, e.g., Pizza, Burger, Beverage")
    price: Decimal = Field(..., gt=Decimal("0.00"), decimal_places=2, max_digits=10, description="Food item price (must be > 0)")
    image_url: str | None = Field(default=None, max_length=500, description="Food item image URL")

    @field_validator("name", "category")
    @classmethod
    def strip_required_strings(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty or just whitespace.")
        return v

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if v and not URL_REGEX.match(v):
                raise ValueError("image_url must be a valid HTTP or HTTPS URL.")
        return v if v else None


class UpdateFoodItemRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150, description="Updated food item name")
    description: str | None = Field(default=None, max_length=1000, description="Updated description")
    category: str | None = Field(default=None, min_length=1, max_length=50, description="Updated category")
    price: Decimal | None = Field(default=None, gt=Decimal("0.00"), decimal_places=2, max_digits=10, description="Updated price")
    image_url: str | None = Field(default=None, max_length=500, description="Updated image URL")

    @field_validator("name", "category")
    @classmethod
    def strip_strings(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be empty string.")
        return v

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if v and not URL_REGEX.match(v):
                raise ValueError("image_url must be a valid HTTP or HTTPS URL.")
        return v if v else None


class FoodItemAvailabilityRequest(BaseModel):
    is_available: bool = Field(..., description="Availability status for ordering")


class FoodItemResponse(BaseModel):
    id: int
    restaurant_id: int
    name: str
    description: str | None
    category: str
    price: Decimal
    image_url: str | None
    is_available: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
