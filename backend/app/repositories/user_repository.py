from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    """Repository handling database operations for User model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        """Fetch a single user by primary key ID."""
        statement = select(User).where(User.id == user_id)
        return self.db.scalars(statement).first()

    def get_by_email(self, email: str) -> User | None:
        """Fetch a single user by email address."""
        statement = select(User).where(User.email == email)
        return self.db.scalars(statement).first()

    def create(self, user: User) -> User:
        """Persist a new user to the database."""
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
