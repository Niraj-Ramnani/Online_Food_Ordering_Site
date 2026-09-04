from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.auth_controller import AuthController
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def get_auth_controller(db: Session = Depends(get_db)) -> AuthController:
    """Dependency provider for AuthController with injected service and repository."""
    user_repository = UserRepository(db)
    auth_service = AuthService(user_repository)
    return AuthController(auth_service)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    data: RegisterRequest,
    controller: AuthController = Depends(get_auth_controller),
) -> UserResponse:
    """Register a new customer (USER) or restaurant owner (SELLER)."""
    return controller.register(data)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate and obtain access & refresh tokens",
)
def login(
    data: LoginRequest,
    controller: AuthController = Depends(get_auth_controller),
) -> TokenResponse:
    """Authenticate with email and password to receive JWT tokens."""
    return controller.login(data)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token using a valid refresh token",
)
def refresh_token(
    data: RefreshTokenRequest,
    controller: AuthController = Depends(get_auth_controller),
) -> TokenResponse:
    """Exchange a valid refresh token for a new access token and refresh token."""
    return controller.refresh(data)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
    controller: AuthController = Depends(get_auth_controller),
) -> UserResponse:
    """Return the profile information of the currently authenticated user."""
    return controller.get_me(current_user)
