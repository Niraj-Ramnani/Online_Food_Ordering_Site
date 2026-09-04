import asyncio
from fastapi import HTTPException, status

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.websocket.connection_manager import manager


class NotificationService:
    """Service coordinating notification persistence and real-time WebSocket dispatch."""

    def __init__(self, notification_repo: NotificationRepository) -> None:
        self.notification_repo = notification_repo

    def _dispatch_websocket_event(self, user_id: int, payload: dict) -> None:
        """Helper to safely schedule async WebSocket event delivery."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(manager.send_personal_message(user_id, payload))
        except RuntimeError:
            # If no running event loop in current context, run synchronously
            try:
                asyncio.run(manager.send_personal_message(user_id, payload))
            except Exception:
                pass

    def create_and_send_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        order_id: int | None = None,
        sound: bool = True,
    ) -> Notification:
        """Create and persist a notification in PostgreSQL and push via WebSocket in real-time."""
        notification = Notification(
            user_id=user_id,
            order_id=order_id,
            title=title,
            message=message,
            type=notification_type,
            is_read=False,
        )
        saved_notification = self.notification_repo.create(notification)

        # Real-time WebSocket payload
        event_payload = {
            "type": "notification",
            "id": saved_notification.id,
            "title": title,
            "message": message,
            "notification_type": notification_type,
            "order_id": order_id,
            "sound": sound,
            "created_at": saved_notification.created_at.isoformat(),
        }
        self._dispatch_websocket_event(user_id, event_payload)

        return saved_notification

    def get_user_notifications(self, user_id: int, unread_only: bool = False) -> list[Notification]:
        """Retrieve notifications for authenticated user."""
        return self.notification_repo.get_by_user_id(user_id, unread_only=unread_only)

    def get_unread_count(self, user_id: int) -> int:
        """Get total unread notifications count."""
        return self.notification_repo.get_unread_count(user_id)

    def mark_as_read(self, user_id: int, notification_id: int) -> Notification:
        """Mark a notification as read verifying user ownership."""
        notification = self.notification_repo.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found.",
            )
        return self.notification_repo.mark_as_read(notification)

    def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications for authenticated user as read."""
        return self.notification_repo.mark_all_as_read(user_id)
