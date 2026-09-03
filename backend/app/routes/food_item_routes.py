from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.food_item_controller import FoodItemController
from app.dependencies.auth import require_role
from app.models.user import User, UserRole
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.food_item import (
    FoodItemAvailabilityRequest,
    FoodItemResponse,
    UpdateFoodItemRequest,
)
from app.services.food_item_service import FoodItemService

router = APIRouter(prefix="/api/v1/food-items", tags=["Food Items"])


def get_food_item_controller(db: Session = Depends(get_db)) -> FoodItemController:
    """Dependency provider for FoodItemController."""
    food_repo = FoodItemRepository(db)
    restaurant_repo = RestaurantRepository(db)
    service = FoodItemService(food_repo, restaurant_repo)
    return FoodItemController(service)


@router.get(
    "/{food_item_id}",
    response_model=FoodItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Get public food item details by ID",
)
def get_public_food_item(
    food_item_id: int,
    controller: FoodItemController = Depends(get_food_item_controller),
) -> FoodItemResponse:
    """Return details of a specific available food item from a verified restaurant."""
    return controller.get_public_food_item(food_item_id)


@router.put(
    "/{food_item_id}",
    response_model=FoodItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a food item (Seller only)",
)
def update_seller_food_item(
    food_item_id: int,
    data: UpdateFoodItemRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: FoodItemController = Depends(get_food_item_controller),
) -> FoodItemResponse:
    """Update details of a food item owned by the seller's restaurant."""
    return controller.update_seller_food_item(
        current_user.id,
        food_item_id,
        data,
    )


@router.patch(
    "/{food_item_id}/availability",
    response_model=FoodItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Toggle food item availability (Seller only)",
)
def update_food_item_availability(
    food_item_id: int,
    data: FoodItemAvailabilityRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: FoodItemController = Depends(get_food_item_controller),
) -> FoodItemResponse:
    """Update the availability flag of a food item owned by the seller's restaurant."""
    return controller.update_availability(
        current_user.id,
        food_item_id,
        data,
    )


@router.delete(
    "/{food_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a food item (Seller only)",
)
def delete_seller_food_item(
    food_item_id: int,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: FoodItemController = Depends(get_food_item_controller),
) -> None:
    """Delete a food item owned by the seller's restaurant."""
    controller.delete_seller_food_item(current_user.id, food_item_id)
