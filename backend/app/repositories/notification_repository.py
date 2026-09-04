from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:
    """Repository handling database operations for Notification model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, notification: Notification) -> Notification:
        """Persist a new notification."""
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_by_id(self, notification_id: int) -> Notification | None:
        """Fetch a single notification by primary key."""
        statement = select(Notification).where(Notification.id == notification_id)
        return self.db.scalars(statement).first()

    def get_by_user_id(self, user_id: int, unread_only: bool = False) -> list[Notification]:
        """Fetch notifications for a user, latest first."""
        statement = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            statement = statement.where(Notification.is_read.is_(False))
        statement = statement.order_by(Notification.created_at.desc())
        return list(self.db.scalars(statement).all())

    def get_unread_count(self, user_id: int) -> int:
        """Count unread notifications for a user."""
        statement = (
            select(func.count(Notification.id))
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
        )
        return self.db.scalar(statement) or 0

    def mark_as_read(self, notification: Notification) -> Notification:
        """Mark a single notification as read."""
        notification.is_read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all unread notifications for a user as read in bulk."""
        statement = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        result = self.db.execute(statement)
        self.db.commit()
        return result.rowcount
