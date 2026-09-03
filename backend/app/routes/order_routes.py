from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.order_controller import OrderController
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User, UserRole
from app.repositories.address_repository import AddressRepository
from app.repositories.cart_item_repository import CartItemRepository
from app.repositories.cart_repository import CartRepository
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.order_item_repository import OrderItemRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.order import (
    CheckoutRequest,
    OrderResponse,
    UpdateOrderStatusRequest,
)
from app.services.order_service import OrderService

# User Orders Router
order_router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

# Seller Orders Router
seller_order_router = APIRouter(prefix="/api/v1/seller/orders", tags=["Seller Orders"])


def get_order_controller(db: Session = Depends(get_db)) -> OrderController:
    """Dependency provider for OrderController with all necessary repositories and service injected."""
    order_repo = OrderRepository(db)
    order_item_repo = OrderItemRepository(db)
    cart_repo = CartRepository(db)
    cart_item_repo = CartItemRepository(db)
    address_repo = AddressRepository(db)
    restaurant_repo = RestaurantRepository(db)
    food_repo = FoodItemRepository(db)

    service = OrderService(
        order_repo=order_repo,
        order_item_repo=order_item_repo,
        cart_repo=cart_repo,
        cart_item_repo=cart_item_repo,
        address_repo=address_repo,
        restaurant_repo=restaurant_repo,
        food_repo=food_repo,
    )
    return OrderController(service)


# ---------------------------------------------------------------------------
# CUSTOMER / USER ORDER ENDPOINTS
# ---------------------------------------------------------------------------

@order_router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Checkout and place order from active cart",
)
def checkout(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    controller: OrderController = Depends(get_order_controller),
) -> OrderResponse:
    """Create an order from the user's active cart, snapshotting item details and delivery address."""
    return controller.checkout(current_user.id, data)


@order_router.get(
    "",
    response_model=list[OrderResponse],
    status_code=status.HTTP_200_OK,
    summary="Get user's order history",
)
def get_user_orders(
    current_user: User = Depends(get_current_user),
    controller: OrderController = Depends(get_order_controller),
) -> list[OrderResponse]:
    """Retrieve all historical and active orders placed by the current user."""
    return controller.get_user_orders(current_user.id)


@order_router.get(
    "/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Get specific order details",
)
def get_user_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    controller: OrderController = Depends(get_order_controller),
) -> OrderResponse:
    """Retrieve details of a specific order placed by the current user."""
    return controller.get_user_order(current_user.id, order_id)


@order_router.patch(
    "/{order_id}/cancel",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel order (Customer)",
)
def cancel_user_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    controller: OrderController = Depends(get_order_controller),
) -> OrderResponse:
    """Cancel an order if it is still in PLACED status."""
    return controller.cancel_user_order(current_user.id, order_id)


# ---------------------------------------------------------------------------
# SELLER ORDER MANAGEMENT ENDPOINTS
# ---------------------------------------------------------------------------

@seller_order_router.get(
    "",
    response_model=list[OrderResponse],
    status_code=status.HTTP_200_OK,
    summary="List all orders for seller's restaurant",
)
def get_seller_orders(
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: OrderController = Depends(get_order_controller),
) -> list[OrderResponse]:
    """Retrieve all incoming and past orders for the authenticated seller's restaurant."""
    return controller.get_seller_orders(current_user.id)


@seller_order_router.get(
    "/{order_id}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Get seller order details by ID",
)
def get_seller_order(
    order_id: int,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: OrderController = Depends(get_order_controller),
) -> OrderResponse:
    """Retrieve details of an order placed at the seller's restaurant."""
    return controller.get_seller_order(current_user.id, order_id)


@seller_order_router.patch(
    "/{order_id}/status",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Update order status (Seller)",
)
def update_seller_order_status(
    order_id: int,
    data: UpdateOrderStatusRequest,
    current_user: User = Depends(require_role(UserRole.SELLER)),
    controller: OrderController = Depends(get_order_controller),
) -> OrderResponse:
    """Update status of an order following strict lifecycle rules."""
    return controller.update_seller_order_status(
        current_user.id,
        order_id,
        data,
    )
