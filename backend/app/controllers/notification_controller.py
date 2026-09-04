from app.schemas.notification import (
    MarkAllReadResponse,
    NotificationResponse,
    UnreadNotificationCountResponse,
)
from app.services.notification_service import NotificationService


class NotificationController:
    """Controller coordinating HTTP-level notification actions."""

    def __init__(self, notification_service: NotificationService) -> None:
        self.notification_service = notification_service

    def get_notifications(
        self,
        user_id: int,
        unread_only: bool = False,
    ) -> list[NotificationResponse]:
        """Fetch notifications for authenticated user."""
        notifications = self.notification_service.get_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
        )
        return [NotificationResponse.model_validate(n) for n in notifications]

    def get_unread_count(self, user_id: int) -> UnreadNotificationCountResponse:
        """Fetch unread count for authenticated user."""
        count = self.notification_service.get_unread_count(user_id)
        return UnreadNotificationCountResponse(unread_count=count)

    def mark_as_read(self, user_id: int, notification_id: int) -> NotificationResponse:
        """Mark specific notification as read."""
        notification = self.notification_service.mark_as_read(user_id, notification_id)
        return NotificationResponse.model_validate(notification)

    def mark_all_as_read(self, user_id: int) -> MarkAllReadResponse:
        """Mark all notifications for user as read."""
        count = self.notification_service.mark_all_as_read(user_id)
        return MarkAllReadResponse(
            message="All notifications marked as read.",
            count=count,
        )
