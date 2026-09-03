from app.schemas.food_item import (
    CreateFoodItemRequest,
    FoodItemAvailabilityRequest,
    FoodItemResponse,
    UpdateFoodItemRequest,
)
from app.services.food_item_service import FoodItemService


class FoodItemController:
    """Controller coordinating HTTP-level food item actions."""

    def __init__(self, food_service: FoodItemService) -> None:
        self.food_service = food_service

    def create_food_item(
        self,
        seller_id: int,
        data: CreateFoodItemRequest,
    ) -> FoodItemResponse:
        """Handle creating a food item for the authenticated seller's restaurant."""
        food_item = self.food_service.create_food_item(seller_id, data)
        return FoodItemResponse.model_validate(food_item)

    def get_seller_food_items(
        self,
        seller_id: int,
    ) -> list[FoodItemResponse]:
        """Handle retrieving all food items for the authenticated seller's restaurant."""
        food_items = self.food_service.get_seller_food_items(seller_id)
        return [
            FoodItemResponse.model_validate(item)
            for item in food_items
        ]

    def update_seller_food_item(
        self,
        seller_id: int,
        food_item_id: int,
        data: UpdateFoodItemRequest,
    ) -> FoodItemResponse:
        """Handle updating a food item for the authenticated seller."""
        food_item = self.food_service.update_seller_food_item(
            seller_id,
            food_item_id,
            data,
        )
        return FoodItemResponse.model_validate(food_item)

    def update_availability(
        self,
        seller_id: int,
        food_item_id: int,
        data: FoodItemAvailabilityRequest,
    ) -> FoodItemResponse:
        """Handle updating food item availability."""
        food_item = self.food_service.update_food_item_availability(
            seller_id,
            food_item_id,
            data.is_available,
        )
        return FoodItemResponse.model_validate(food_item)

    def delete_seller_food_item(
        self,
        seller_id: int,
        food_item_id: int,
    ) -> None:
        """Handle deleting a food item."""
        self.food_service.delete_seller_food_item(seller_id, food_item_id)

    def get_public_food_items(
        self,
        restaurant_id: int,
    ) -> list[FoodItemResponse]:
        """Handle public retrieval of available food items for a verified restaurant."""
        food_items = self.food_service.get_public_food_items_by_restaurant(restaurant_id)
        return [
            FoodItemResponse.model_validate(item)
            for item in food_items
        ]

    def get_public_food_item(
        self,
        food_item_id: int,
    ) -> FoodItemResponse:
        """Handle public retrieval of a single food item."""
        food_item = self.food_service.get_public_food_item_by_id(food_item_id)
        return FoodItemResponse.model_validate(food_item)
