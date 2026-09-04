from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.admin_controller import AdminController
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin import (
    AdminDashboardStatsResponse,
    AdminFoodStatusRequest,
    AdminRestaurantStatusRequest,
    AdminRestaurantVerifyRequest,
    AdminUserResponse,
    AdminUserStatusRequest,
)
from app.schemas.food_item import FoodItemResponse
from app.schemas.order import OrderResponse
from app.schemas.restaurant import RestaurantResponse
from app.services.admin_service import AdminService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def get_admin_controller(db: Session = Depends(get_db)) -> AdminController:
    """Dependency provider for AdminController."""
    user_repo = UserRepository(db)
    restaurant_repo = RestaurantRepository(db)
    food_repo = FoodItemRepository(db)
    order_repo = OrderRepository(db)
    notification_repo = NotificationRepository(db)
    notification_service = NotificationService(notification_repo)
    service = AdminService(
        db=db,
        user_repo=user_repo,
        restaurant_repo=restaurant_repo,
        food_repo=food_repo,
        order_repo=order_repo,
        notification_service=notification_service,
    )
    return AdminController(service)


@router.get(
    "/dashboard",
    response_model=AdminDashboardStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get admin dashboard aggregated statistics",
)
def get_dashboard(
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> AdminDashboardStatsResponse:
    """Retrieve platform counts: users, sellers, restaurants, verified restaurants, and orders."""
    return controller.get_dashboard()


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
    status_code=status.HTTP_200_OK,
    summary="List all users",
)
def get_users(
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> list[AdminUserResponse]:
    """Retrieve all users without password hashes."""
    return controller.get_users()


@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user active status",
)
def update_user_status(
    user_id: int,
    data: AdminUserStatusRequest,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> AdminUserResponse:
    """Activate or deactivate any user account."""
    return controller.update_user_status(user_id, data)


@router.get(
    "/restaurants",
    response_model=list[RestaurantResponse],
    status_code=status.HTTP_200_OK,
    summary="List all restaurants",
)
def get_restaurants(
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> list[RestaurantResponse]:
    """Retrieve all registered restaurants on the platform."""
    return controller.get_restaurants()


@router.patch(
    "/restaurants/{restaurant_id}/verify",
    response_model=RestaurantResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify or unverify restaurant",
)
def update_restaurant_verification(
    restaurant_id: int,
    data: AdminRestaurantVerifyRequest,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> RestaurantResponse:
    """Toggle official verification flag on a restaurant."""
    return controller.update_restaurant_verification(restaurant_id, data)


@router.patch(
    "/restaurants/{restaurant_id}/status",
    response_model=RestaurantResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle restaurant open/closed status",
)
def update_restaurant_status(
    restaurant_id: int,
    data: AdminRestaurantStatusRequest,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> RestaurantResponse:
    """Administratively open or close a restaurant."""
    return controller.update_restaurant_status(restaurant_id, data)


@router.get(
    "/food-items",
    response_model=list[FoodItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List all food items",
)
def get_food_items(
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> list[FoodItemResponse]:
    """Retrieve all food items platform-wide."""
    return controller.get_food_items()


@router.patch(
    "/food-items/{food_item_id}/status",
    response_model=FoodItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle food item availability",
)
def update_food_availability(
    food_item_id: int,
    data: AdminFoodStatusRequest,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> FoodItemResponse:
    """Administratively update food item availability."""
    return controller.update_food_availability(food_item_id, data)


@router.get(
    "/orders",
    response_model=list[OrderResponse],
    status_code=status.HTTP_200_OK,
    summary="List all platform orders",
)
def get_orders(
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> list[OrderResponse]:
    """Retrieve all orders placed across all restaurants."""
    return controller.get_orders()


@router.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Get any order details by ID",
)
def get_order_by_id(
    order_id: int,
    current_admin: User = Depends(require_role(UserRole.ADMIN)),
    controller: AdminController = Depends(get_admin_controller),
) -> OrderResponse:
    """Retrieve details for any order with admin privileges."""
    return controller.get_order_by_id(order_id)
