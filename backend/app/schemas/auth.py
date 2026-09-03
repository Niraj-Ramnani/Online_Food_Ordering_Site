from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User full name")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, max_length=100, description="User password (min 6 characters)")
    role: UserRole = Field(default=UserRole.USER, description="User role (USER or SELLER)")

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: UserRole) -> UserRole:
        if value == UserRole.ADMIN:
            raise ValueError("Admin accounts cannot be created through public registration.")
        if value not in (UserRole.USER, UserRole.SELLER):
            raise ValueError("Role must be either USER or SELLER.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, description="User password")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1, description="JWT refresh token")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_verified: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
