from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.cart_controller import CartController
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.cart_item_repository import CartItemRepository
from app.repositories.cart_repository import CartRepository
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.cart import (
    AddToCartRequest,
    CartResponse,
    UpdateCartItemQuantityRequest,
)
from app.services.cart_service import CartService

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


def get_cart_controller(db: Session = Depends(get_db)) -> CartController:
    """Dependency provider for CartController."""
    cart_repo = CartRepository(db)
    cart_item_repo = CartItemRepository(db)
    food_repo = FoodItemRepository(db)
    restaurant_repo = RestaurantRepository(db)
    service = CartService(
        cart_repo=cart_repo,
        cart_item_repo=cart_item_repo,
        food_repo=food_repo,
        restaurant_repo=restaurant_repo,
    )
    return CartController(service)


@router.get(
    "",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user's active cart",
)
def get_cart(
    current_user: User = Depends(get_current_user),
    controller: CartController = Depends(get_cart_controller),
) -> CartResponse:
    """Retrieve the current authenticated user's active cart with calculated subtotals."""
    return controller.get_cart(current_user.id)


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Add food item to cart",
)
def add_to_cart(
    data: AddToCartRequest,
    current_user: User = Depends(get_current_user),
    controller: CartController = Depends(get_cart_controller),
) -> CartResponse:
    """Add a food item to active cart. Enforces single-restaurant and availability rules."""
    return controller.add_to_cart(current_user.id, data)


@router.patch(
    "/items/{cart_item_id}",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Update cart item quantity",
)
def update_cart_item_quantity(
    cart_item_id: int,
    data: UpdateCartItemQuantityRequest,
    current_user: User = Depends(get_current_user),
    controller: CartController = Depends(get_cart_controller),
) -> CartResponse:
    """Update the quantity of an existing item in the user's cart."""
    return controller.update_item_quantity(current_user.id, cart_item_id, data)


@router.delete(
    "/items/{cart_item_id}",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove an item from cart",
)
def remove_cart_item(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    controller: CartController = Depends(get_cart_controller),
) -> CartResponse:
    """Remove a specific food item from the active cart."""
    return controller.remove_item(current_user.id, cart_item_id)


@router.delete(
    "",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Clear entire cart",
)
def clear_cart(
    current_user: User = Depends(get_current_user),
    controller: CartController = Depends(get_cart_controller),
) -> CartResponse:
    """Remove all items from the user's active cart."""
    return controller.clear_cart(current_user.id)
