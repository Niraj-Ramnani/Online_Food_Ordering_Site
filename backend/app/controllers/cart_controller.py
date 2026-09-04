from app.schemas.cart import (
    AddToCartRequest,
    CartResponse,
    UpdateCartItemQuantityRequest,
)
from app.services.cart_service import CartService


class CartController:
    """Controller coordinating HTTP-level cart actions."""

    def __init__(self, cart_service: CartService) -> None:
        self.cart_service = cart_service

    def get_cart(self, user_id: int) -> CartResponse:
        """Handle retrieving the user's current cart."""
        return self.cart_service.get_cart(user_id)

    def add_to_cart(
        self,
        user_id: int,
        data: AddToCartRequest,
    ) -> CartResponse:
        """Handle adding a food item to the user's cart."""
        return self.cart_service.add_to_cart(user_id, data)

    def update_item_quantity(
        self,
        user_id: int,
        cart_item_id: int,
        data: UpdateCartItemQuantityRequest,
    ) -> CartResponse:
        """Handle updating the quantity of an existing cart item."""
        return self.cart_service.update_cart_item_quantity(
            user_id,
            cart_item_id,
            data,
        )

    def remove_item(
        self,
        user_id: int,
        cart_item_id: int,
    ) -> CartResponse:
        """Handle removing a single cart item."""
        return self.cart_service.remove_cart_item(user_id, cart_item_id)

    def clear_cart(self, user_id: int) -> CartResponse:
        """Handle clearing the entire cart."""
        return self.cart_service.clear_cart(user_id)
