from fastapi import HTTPException, status

from app.models.food_item import FoodItem
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.food_item import (
    CreateFoodItemRequest,
    UpdateFoodItemRequest,
)


class FoodItemService:
    """Service containing business logic for food items."""

    def __init__(
        self,
        food_repo: FoodItemRepository,
        restaurant_repo: RestaurantRepository,
    ) -> None:
        self.food_repo = food_repo
        self.restaurant_repo = restaurant_repo

    def create_food_item(
        self,
        seller_id: int,
        data: CreateFoodItemRequest,
    ) -> FoodItem:
        """Create a new food item for the authenticated seller's restaurant."""
        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller must create a restaurant before adding food items.",
            )

        new_food_item = FoodItem(
            restaurant_id=restaurant.id,
            name=data.name,
            description=data.description,
            category=data.category,
            price=data.price,
            image_url=data.image_url,
            is_available=True,
        )
        return self.food_repo.create(new_food_item)

    def get_seller_food_items(self, seller_id: int) -> list[FoodItem]:
        """Fetch all food items belonging to the authenticated seller's restaurant."""
        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller does not have a restaurant.",
            )
        return self.food_repo.get_by_restaurant_id(restaurant.id)

    def update_seller_food_item(
        self,
        seller_id: int,
        food_item_id: int,
        data: UpdateFoodItemRequest,
    ) -> FoodItem:
        """Update a food item after verifying seller restaurant ownership."""
        food_item = self.food_repo.get_by_id(food_item_id)
        if not food_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )

        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant or food_item.restaurant_id != restaurant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this food item.",
            )

        if data.name is not None:
            food_item.name = data.name
        if data.description is not None:
            food_item.description = data.description
        if data.category is not None:
            food_item.category = data.category
        if data.price is not None:
            food_item.price = data.price
        if data.image_url is not None:
            food_item.image_url = data.image_url

        return self.food_repo.update(food_item)

    def update_food_item_availability(
        self,
        seller_id: int,
        food_item_id: int,
        is_available: bool,
    ) -> FoodItem:
        """Update a food item's availability status."""
        food_item = self.food_repo.get_by_id(food_item_id)
        if not food_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )

        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant or food_item.restaurant_id != restaurant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this food item.",
            )

        food_item.is_available = is_available
        return self.food_repo.update(food_item)

    def delete_seller_food_item(
        self,
        seller_id: int,
        food_item_id: int,
    ) -> None:
        """Delete a food item after verifying seller restaurant ownership."""
        food_item = self.food_repo.get_by_id(food_item_id)
        if not food_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )

        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant or food_item.restaurant_id != restaurant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this food item.",
            )

        self.food_repo.delete(food_item)

    def get_public_food_items_by_restaurant(
        self,
        restaurant_id: int,
    ) -> list[FoodItem]:
        """Fetch available food items for a verified restaurant."""
        restaurant = self.restaurant_repo.get_by_id(restaurant_id)
        if not restaurant or not restaurant.is_verified:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found or not verified.",
            )
        return self.food_repo.get_by_restaurant_id(restaurant_id, only_available=True)

    def get_public_food_item_by_id(self, food_item_id: int) -> FoodItem:
        """Fetch a single available food item belonging to a verified restaurant."""
        food_item = self.food_repo.get_by_id(food_item_id)
        if not food_item or not food_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )

        restaurant = self.restaurant_repo.get_by_id(food_item.restaurant_id)
        if not restaurant or not restaurant.is_verified:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food item not found.",
            )

        return food_item
