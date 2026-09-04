from fastapi import HTTPException, status
import jwt

from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.security.jwt import create_access_token, create_refresh_token, decode_token
from app.security.password import hash_password, verify_password


class AuthService:
    """Service containing authentication and authorization business logic."""

    def __init__(self, user_repo: UserRepository) -> None:
        self.user_repo = user_repo

    def register(self, data: RegisterRequest) -> User:
        """Register a new customer or seller account."""
        if data.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin accounts cannot be created through public registration.",
            )

        existing_user = self.user_repo.get_by_email(data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            )

        hashed_password = hash_password(data.password)
        new_user = User(
            name=data.name,
            email=data.email,
            password_hash=hashed_password,
            role=data.role,
            is_verified=False,
            is_active=True,
        )
        return self.user_repo.create(new_user)

    def login(self, data: LoginRequest) -> TokenResponse:
        """Authenticate user credentials and issue JWT tokens."""
        user = self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        token_payload = {
            "sub": str(user.id),
            "role": user.role.value,
        }
        access_token = create_access_token(token_payload)
        refresh_token = create_refresh_token(token_payload)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )

    def refresh_token(self, refresh_token: str) -> TokenResponse:
        """Validate a refresh token and issue a new token pair."""
        try:
            payload = decode_token(refresh_token)
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id_raw = payload.get("sub")
        if not user_id_raw:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        try:
            user_id = int(user_id_raw)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid subject in token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or account is inactive.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        new_payload = {
            "sub": str(user.id),
            "role": user.role.value,
        }
        new_access_token = create_access_token(new_payload)
        new_refresh_token = create_refresh_token(new_payload)

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
        )
