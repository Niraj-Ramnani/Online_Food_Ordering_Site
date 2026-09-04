from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserRole


class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserStatusRequest(BaseModel):
    is_active: bool = Field(..., description="Active status for user account")


class AdminRestaurantVerifyRequest(BaseModel):
    is_verified: bool = Field(..., description="Verification status for restaurant")


class AdminRestaurantStatusRequest(BaseModel):
    is_open: bool = Field(..., description="Open/closed status for restaurant")


class AdminFoodStatusRequest(BaseModel):
    is_available: bool = Field(..., description="Availability status for food item")


class AdminDashboardStatsResponse(BaseModel):
    total_users: int
    total_sellers: int
    total_restaurants: int
    verified_restaurants: int
    total_orders: int
    pending_orders: int
    completed_orders: int
