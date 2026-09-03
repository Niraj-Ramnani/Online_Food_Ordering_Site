from decimal import Decimal
from fastapi import HTTPException, status

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.repositories.cart_item_repository import CartItemRepository
from app.repositories.cart_repository import CartRepository
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.cart import (
    AddToCartRequest,
    CartItemFoodResponse,
    CartItemResponse,
    CartResponse,
    CartRestaurantResponse,
    UpdateCartItemQuantityRequest,
)


class CartService:
    """Service containing business logic for user cart management."""

    def __init__(
        self,
        cart_repo: CartRepository,
        cart_item_repo: CartItemRepository,
        food_repo: FoodItemRepository,
        restaurant_repo: RestaurantRepository,
    ) -> None:
        self.cart_repo = cart_repo
        self.cart_item_repo = cart_item_repo
        self.food_repo = food_repo
        self.restaurant_repo = restaurant_repo

    def get_cart(self, user_id: int) -> CartResponse:
        """Calculate and return current cart details, items, and subtotal."""
        cart = self.cart_repo.get_by_user_id(user_id)
        if not cart or not cart.cart_items:
            return CartResponse(
                id=cart.id if cart else None,
                restaurant=None,
                items=[],
                subtotal=Decimal("0.00"),
                total_items=0,
            )

        items: list[CartItemResponse] = []
        subtotal = Decimal("0.00")
        total_items = 0

        for item in cart.cart_items:
            price = Decimal(str(item.food_item.price))
            item_total = price * item.quantity
            subtotal += item_total
            total_items += item.quantity

            items.append(
                CartItemResponse(
                    id=item.id,
                    food_item=CartItemFoodResponse(
                        id=item.food_item.id,
                        name=item.food_item.name,
                        price=price,
                        image_url=item.food_item.image_url,
                        category=item.food_item.category,
                        is_available=item.food_item.is_available,
                    ),
                    quantity=item.quantity,
                    item_total=item_total,
                )
            )

        restaurant_info = None
        if cart.restaurant:
            restaurant_info = CartRestaurantResponse(
                id=cart.restaurant.id,
                name=cart.restaurant.name,
                image_url=cart.restaurant.image_url,
            )

        return CartResponse(
            id=cart.id,
            restaurant=restaurant_info,
            items=items,
            subtotal=subtotal,
            total_items=total_items,
        )

    def add_to_cart(
        self,
        user_id: int,
        data: AddToCartRequest,
    ) -> CartResponse:
        """Add a food item to the active cart with single-restaurant and availability enforcement."""
        # 1. Validate food item existence and availability
        food_item = self.food_repo.get_by_id(data.food_item_id)
        if not food_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )

        if not food_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Food item is currently unavailable for ordering.",
            )

        # 2. Validate restaurant verification and open status
        restaurant = self.restaurant_repo.get_by_id(food_item.restaurant_id)
        if not restaurant or not restaurant.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant is not verified.",
            )

        if not restaurant.is_open:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant is currently closed and not accepting orders.",
            )

        # 3. Retrieve or create user's cart
        cart = self.cart_repo.get_by_user_id(user_id)
        if not cart:
            cart = self.cart_repo.create(
                Cart(user_id=user_id, restaurant_id=restaurant.id)
            )
        else:
            # Check single restaurant constraint
            if cart.cart_items and cart.restaurant_id and cart.restaurant_id != restaurant.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Cart already contains items from another restaurant. Please clear your cart first to order from a different restaurant.",
                )
            if not cart.cart_items:
                cart.restaurant_id = restaurant.id
                self.cart_repo.update(cart)

        # 4. Add new item or increment existing item quantity
        existing_item = self.cart_item_repo.get_by_cart_and_food(
            cart.id,
            food_item.id,
        )
        if existing_item:
            existing_item.quantity += data.quantity
            self.cart_item_repo.update(existing_item)
        else:
            new_item = CartItem(
                cart_id=cart.id,
                food_item_id=food_item.id,
                quantity=data.quantity,
            )
            self.cart_item_repo.create(new_item)

        return self.get_cart(user_id)

    def update_cart_item_quantity(
        self,
        user_id: int,
        cart_item_id: int,
        data: UpdateCartItemQuantityRequest,
    ) -> CartResponse:
        """Update the quantity of an item in the user's cart."""
        cart = self.cart_repo.get_by_user_id(user_id)
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        cart_item = self.cart_item_repo.get_by_id(cart_item_id)
        if not cart_item or cart_item.cart_id != cart.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        # Verify food item is still available
        food_item = self.food_repo.get_by_id(cart_item.food_item_id)
        if not food_item or not food_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Food item is no longer available.",
            )

        cart_item.quantity = data.quantity
        self.cart_item_repo.update(cart_item)

        return self.get_cart(user_id)

    def remove_cart_item(
        self,
        user_id: int,
        cart_item_id: int,
    ) -> CartResponse:
        """Remove a specific item from the user's cart."""
        cart = self.cart_repo.get_by_user_id(user_id)
        if not cart:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        cart_item = self.cart_item_repo.get_by_id(cart_item_id)
        if not cart_item or cart_item.cart_id != cart.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found.",
            )

        self.cart_item_repo.delete(cart_item)

        # If cart is now empty, reset restaurant_id
        refreshed_cart = self.cart_repo.get_by_user_id(user_id)
        if refreshed_cart and not refreshed_cart.cart_items:
            refreshed_cart.restaurant_id = None
            self.cart_repo.update(refreshed_cart)

        return self.get_cart(user_id)

    def clear_cart(self, user_id: int) -> CartResponse:
        """Remove all items from the user's active cart."""
        cart = self.cart_repo.get_by_user_id(user_id)
        if cart:
            self.cart_item_repo.clear_cart_items(cart.id)
            cart.restaurant_id = None
            self.cart_repo.update(cart)

        return self.get_cart(user_id)
