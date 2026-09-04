from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService


class AuthController:
    """Controller coordinating HTTP-level authentication actions."""

    def __init__(self, auth_service: AuthService) -> None:
        self.auth_service = auth_service

    def register(self, data: RegisterRequest) -> UserResponse:
        """Handle user registration request."""
        user = self.auth_service.register(data)
        return UserResponse.model_validate(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        """Handle user login request."""
        return self.auth_service.login(data)

    def refresh(self, data: RefreshTokenRequest) -> TokenResponse:
        """Handle token refresh request."""
        return self.auth_service.refresh_token(data.refresh_token)

    def get_me(self, current_user: User) -> UserResponse:
        """Handle retrieving currently authenticated user profile."""
        return UserResponse.model_validate(current_user)
