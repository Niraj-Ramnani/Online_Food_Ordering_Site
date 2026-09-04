from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    order_id: int | None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UnreadNotificationCountResponse(BaseModel):
    unread_count: int


class MarkAllReadResponse(BaseModel):
    message: str
    count: int
