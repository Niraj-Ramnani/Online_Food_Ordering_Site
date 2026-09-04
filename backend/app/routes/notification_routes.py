from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.notification_controller import NotificationController
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import (
    MarkAllReadResponse,
    NotificationResponse,
    UnreadNotificationCountResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])


def get_notification_controller(db: Session = Depends(get_db)) -> NotificationController:
    """Dependency provider for NotificationController."""
    repo = NotificationRepository(db)
    service = NotificationService(repo)
    return NotificationController(service)


@router.get(
    "",
    response_model=list[NotificationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user notifications",
)
def get_notifications(
    unread_only: bool = Query(default=False, description="Filter only unread notifications"),
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends(get_notification_controller),
) -> list[NotificationResponse]:
    """Retrieve all notifications for the authenticated user."""
    return controller.get_notifications(current_user.id, unread_only=unread_only)


@router.get(
    "/unread-count",
    response_model=UnreadNotificationCountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get unread notification count",
)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends(get_notification_controller),
) -> UnreadNotificationCountResponse:
    """Retrieve total count of unread notifications for the authenticated user."""
    return controller.get_unread_count(current_user.id)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark notification as read",
)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends(get_notification_controller),
) -> NotificationResponse:
    """Mark a specific notification as read."""
    return controller.mark_as_read(current_user.id, notification_id)


@router.patch(
    "/read-all",
    response_model=MarkAllReadResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark all notifications as read",
)
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    controller: NotificationController = Depends(get_notification_controller),
) -> MarkAllReadResponse:
    """Mark all unread notifications for the authenticated user as read."""
    return controller.mark_all_as_read(current_user.id)
