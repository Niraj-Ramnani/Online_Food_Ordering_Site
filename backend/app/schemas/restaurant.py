from datetime import datetime
import re
from pydantic import BaseModel, ConfigDict, Field, field_validator

URL_REGEX = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)


class CreateRestaurantRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Restaurant name")
    description: str | None = Field(default=None, max_length=1000, description="Restaurant description")
    address: str = Field(..., min_length=1, max_length=255, description="Physical address of the restaurant")
    image_url: str | None = Field(default=None, max_length=500, description="URL of restaurant image")

    @field_validator("name", "address")
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


class UpdateRestaurantRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150, description="Updated name")
    description: str | None = Field(default=None, max_length=1000, description="Updated description")
    address: str | None = Field(default=None, min_length=1, max_length=255, description="Updated address")
    image_url: str | None = Field(default=None, max_length=500, description="Updated image URL")

    @field_validator("name", "address")
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


class RestaurantStatusUpdateRequest(BaseModel):
    is_open: bool = Field(..., description="Whether the restaurant is currently accepting orders")


class RestaurantResponse(BaseModel):
    id: int
    seller_id: int
    name: str
    description: str | None
    address: str
    image_url: str | None
    is_verified: bool
    is_open: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicRestaurantResponse(BaseModel):
    id: int
    name: str
    description: str | None
    address: str
    image_url: str | None
    is_verified: bool
    is_open: bool

    model_config = ConfigDict(from_attributes=True)
