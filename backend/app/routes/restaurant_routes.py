from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.food_item_controller import FoodItemController
from app.controllers.restaurant_controller import RestaurantController
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.food_item import (
    CreateFoodItemRequest,
    FoodItemResponse,
)
from app.schemas.restaurant import (
    CreateRestaurantRequest,
    PublicRestaurantResponse,
    RestaurantResponse,
    RestaurantStatusUpdateRequest,
    UpdateRestaurantRequest,
)
from app.services.food_item_service import FoodItemService
from app.services.restaurant_service import RestaurantService

router = APIRouter(prefix="/api/v1/restaurants", tags=["Restaurants"])


def get_restaurant_controller(db: Session = Depends(get_db)) -> RestaurantController:
    """Dependency provider for RestaurantController with injected service and repository."""
    repo = RestaurantRepository(db)
    service = RestaurantService(repo)
    return RestaurantController(service)


def get_food_item_controller(db: Session = Depends(get_db)) -> FoodItemController:
    """Dependency provider for FoodItemController."""
    food_repo = FoodItemRepository(db)
    restaurant_repo = RestaurantRepository(db)
    service = FoodItemService(food_repo, restaurant_repo)
    return FoodItemController(service)


# ---------------------------------------------------------------------------
# SELLER RESTAURANT ENDPOINTS (Must be defined before {restaurant_id} path)
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=RestaurantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a restaurant (Seller only)",
)
def create_restaurant(
    data: CreateRestaurantRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: RestaurantController = Depends(get_restaurant_controller),
) -> RestaurantResponse:
    """Register a new restaurant for the authenticated seller (max 1 per seller)."""
    return controller.create_restaurant(current_user.id, data)


@router.get(
    "/me",
    response_model=RestaurantResponse,
    status_code=status.HTTP_200_OK,
    summary="Get seller's own restaurant",
)
def get_own_restaurant(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: RestaurantController = Depends(get_restaurant_controller),
) -> RestaurantResponse:
    """Retrieve the restaurant profile belonging to the authenticated seller."""
    return controller.get_own_restaurant(current_user.id)


@router.put(
    "/me",
    response_model=RestaurantResponse,
    status_code=status.HTTP_200_OK,
    summary="Update seller's own restaurant",
)
def update_own_restaurant(
    data: UpdateRestaurantRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: RestaurantController = Depends(get_restaurant_controller),
) -> RestaurantResponse:
    """Update details for the authenticated seller's restaurant."""
    return controller.update_own_restaurant(current_user.id, data)


@router.patch(
    "/me/status",
    response_model=RestaurantResponse,
    status_code=status.HTTP_200_OK,
    summary="Update restaurant open/close status",
)
def update_restaurant_status(
    data: RestaurantStatusUpdateRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: RestaurantController = Depends(get_restaurant_controller),
) -> RestaurantResponse:
    """Toggle open/close status for order acceptance."""
    return controller.update_status(current_user.id, data)


# ---------------------------------------------------------------------------
# SELLER FOOD ITEM ENDPOINTS UNDER /restaurants/me
# ---------------------------------------------------------------------------

@router.post(
    "/me/food-items",
    response_model=FoodItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a food item to seller's restaurant",
)
def create_food_item(
    data: CreateFoodItemRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: FoodItemController = Depends(get_food_item_controller),
) -> FoodItemResponse:
    """Create a new food item in the authenticated seller's restaurant."""
    return controller.create_food_item(current_user.id, data)


@router.get(
    "/me/food-items",
    response_model=list[FoodItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List all food items in seller's restaurant",
)
def get_seller_food_items(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: FoodItemController = Depends(get_food_item_controller),
) -> list[FoodItemResponse]:
    """Retrieve all food items belonging to the authenticated seller's restaurant."""
    return controller.get_seller_food_items(current_user.id)


# ---------------------------------------------------------------------------
# PUBLIC BROWSING ENDPOINTS
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[PublicRestaurantResponse],
    status_code=status.HTTP_200_OK,
    summary="List all verified restaurants for public browsing",
)
def get_public_restaurants(
    controller: RestaurantController = Depends(get_restaurant_controller),
) -> list[PublicRestaurantResponse]:
    """Return all verified restaurants for customer browsing."""
    return controller.get_public_restaurants()


@router.get(
    "/{restaurant_id}",
    response_model=PublicRestaurantResponse,
    status_code=status.HTTP_200_OK,
    summary="Get verified restaurant details by ID",
)
def get_public_restaurant(
    restaurant_id: int,
    controller: RestaurantController = Depends(get_restaurant_controller),
) -> PublicRestaurantResponse:
    """Return details of a specific verified restaurant."""
    return controller.get_public_restaurant(restaurant_id)


@router.get(
    "/{restaurant_id}/food-items",
    response_model=list[FoodItemResponse],
    status_code=status.HTTP_200_OK,
    summary="List available food items for a verified restaurant",
)
def get_public_food_items(
    restaurant_id: int,
    controller: FoodItemController = Depends(get_food_item_controller),
) -> list[FoodItemResponse]:
    """Return available food items belonging to a verified restaurant."""
    return controller.get_public_food_items(restaurant_id)
