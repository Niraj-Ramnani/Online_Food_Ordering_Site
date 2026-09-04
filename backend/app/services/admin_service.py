import asyncio
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.food_item import FoodItem
from app.models.order import Order, OrderStatus
from app.models.restaurant import Restaurant
from app.models.user import User, UserRole
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.repositories.user_repository import UserRepository
from app.services.notification_service import NotificationService
from app.websocket.connection_manager import manager


class AdminService:
    """Service handling platform-wide administrative oversight, verification, and analytics."""

    def __init__(
        self,
        db: Session,
        user_repo: UserRepository,
        restaurant_repo: RestaurantRepository,
        food_repo: FoodItemRepository,
        order_repo: OrderRepository,
        notification_service: NotificationService | None = None,
    ) -> None:
        self.db = db
        self.user_repo = user_repo
        self.restaurant_repo = restaurant_repo
        self.food_repo = food_repo
        self.order_repo = order_repo
        self.notification_service = notification_service

    def _dispatch_websocket_event(self, user_id: int, payload: dict) -> None:
        """Helper to safely schedule async WebSocket event delivery."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(manager.send_personal_message(user_id, payload))
        except RuntimeError:
            try:
                asyncio.run(manager.send_personal_message(user_id, payload))
            except Exception:
                pass

    def get_users(self) -> list[User]:
        """Fetch all registered users."""
        statement = select(User).order_by(User.id.asc())
        return list(self.db.scalars(statement).all())

    def update_user_status(self, user_id: int, is_active: bool) -> User:
        """Activate or deactivate a user account."""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        user.is_active = is_active
        updated = self.user_repo.update(user)
        self._dispatch_websocket_event(
            user_id,
            {
                "type": "user_status_updated",
                "user_id": user_id,
                "is_active": is_active,
            },
        )
        return updated

    def get_restaurants(self) -> list[Restaurant]:
        """Fetch all restaurants regardless of verification status."""
        statement = select(Restaurant).order_by(Restaurant.id.asc())
        return list(self.db.scalars(statement).all())

    def update_restaurant_verification(self, restaurant_id: int, is_verified: bool) -> Restaurant:
        """Verify or unverify a restaurant."""
        restaurant = self.restaurant_repo.get_by_id(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found.",
            )
        restaurant.is_verified = is_verified
        updated = self.restaurant_repo.update(restaurant)

        # Notify seller and dispatch real-time WebSocket event
        if updated.seller_id:
            if self.notification_service:
                title = "Restaurant Verified!" if is_verified else "Verification Status Changed"
                message = (
                    f"Congratulations! Your restaurant '{updated.name}' is now a Verified Partner."
                    if is_verified
                    else f"Your restaurant '{updated.name}' verification has been updated by admin."
                )
                self.notification_service.create_and_send_notification(
                    user_id=updated.seller_id,
                    title=title,
                    message=message,
                    notification_type="RESTAURANT_VERIFIED" if is_verified else "RESTAURANT_UNVERIFIED",
                    sound=True,
                )
            self._dispatch_websocket_event(
                updated.seller_id,
                {
                    "type": "restaurant_verified",
                    "restaurant_id": updated.id,
                    "is_verified": is_verified,
                },
            )

        return updated

    def update_restaurant_status(self, restaurant_id: int, is_open: bool) -> Restaurant:
        """Open or close a restaurant administratively."""
        restaurant = self.restaurant_repo.get_by_id(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found.",
            )
        restaurant.is_open = is_open
        updated = self.restaurant_repo.update(restaurant)

        if updated.seller_id:
            self._dispatch_websocket_event(
                updated.seller_id,
                {
                    "type": "restaurant_status_updated",
                    "restaurant_id": updated.id,
                    "is_open": is_open,
                },
            )

        return updated

    def get_food_items(self) -> list[FoodItem]:
        """Fetch all food items platform-wide."""
        statement = select(FoodItem).order_by(FoodItem.id.asc())
        return list(self.db.scalars(statement).all())

    def update_food_availability(self, food_item_id: int, is_available: bool) -> FoodItem:
        """Toggle food item availability administratively."""
        food_item = self.food_repo.get_by_id(food_item_id)
        if not food_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )
        food_item.is_available = is_available
        return self.food_repo.update(food_item)

    def get_orders(self) -> list[Order]:
        """Fetch all platform orders."""
        statement = (
            select(Order)
            .options(
                selectinload(Order.order_items),
                selectinload(Order.restaurant),
                selectinload(Order.user),
            )
            .order_by(Order.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def get_order_by_id(self, order_id: int) -> Order:
        """Fetch any specific order by ID."""
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )
        return order

    def get_dashboard_stats(self) -> dict:
        """Aggregate high-level platform statistics using efficient SQL count queries."""
        total_users = (
            self.db.scalar(select(func.count(User.id)).where(User.role == UserRole.USER)) or 0
        )
        total_sellers = (
            self.db.scalar(select(func.count(User.id)).where(User.role == UserRole.SELLER)) or 0
        )
        total_restaurants = self.db.scalar(select(func.count(Restaurant.id))) or 0
        verified_restaurants = (
            self.db.scalar(
                select(func.count(Restaurant.id)).where(Restaurant.is_verified.is_(True))
            )
            or 0
        )
        total_orders = self.db.scalar(select(func.count(Order.id))) or 0
        pending_orders = (
            self.db.scalar(
                select(func.count(Order.id)).where(
                    Order.status.in_([OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY])
                )
            )
            or 0
        )
        completed_orders = (
            self.db.scalar(
                select(func.count(Order.id)).where(Order.status == OrderStatus.DELIVERED)
            )
            or 0
        )

        return {
            "total_users": total_users,
            "total_sellers": total_sellers,
            "total_restaurants": total_restaurants,
            "verified_restaurants": verified_restaurants,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
        }
