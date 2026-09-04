from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CreateAddressRequest(BaseModel):
    label: str = Field(..., min_length=1, max_length=50, description="Address label (e.g., Home, Office, Other)")
    address_line: str = Field(..., min_length=1, max_length=255, description="Street address, building, apartment")
    city: str = Field(..., min_length=1, max_length=100, description="City")
    state: str = Field(..., min_length=1, max_length=100, description="State / Province")
    pincode: str = Field(..., min_length=1, max_length=20, description="Postal / ZIP code")
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0, description="Latitude (-90 to 90)")
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0, description="Longitude (-180 to 180)")
    is_default: bool = Field(default=False, description="Set as default delivery address")

    @field_validator("label", "address_line", "city", "state", "pincode")
    @classmethod
    def strip_strings(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty or just whitespace.")
        return v


class UpdateAddressRequest(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=50, description="Updated address label")
    address_line: str | None = Field(default=None, min_length=1, max_length=255, description="Updated street address")
    city: str | None = Field(default=None, min_length=1, max_length=100, description="Updated city")
    state: str | None = Field(default=None, min_length=1, max_length=100, description="Updated state")
    pincode: str | None = Field(default=None, min_length=1, max_length=20, description="Updated pincode")
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0, description="Updated latitude (-90 to 90)")
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0, description="Updated longitude (-180 to 180)")
    is_default: bool | None = Field(default=None, description="Set as default address")

    @field_validator("label", "address_line", "city", "state", "pincode")
    @classmethod
    def strip_strings_optional(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be empty string.")
        return v


class AddressResponse(BaseModel):
    id: int
    user_id: int
    label: str
    address_line: str
    city: str
    state: str
    pincode: str
    latitude: float | None
    longitude: float | None
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
