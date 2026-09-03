from app.schemas.restaurant import (
    CreateRestaurantRequest,
    PublicRestaurantResponse,
    RestaurantResponse,
    RestaurantStatusUpdateRequest,
    UpdateRestaurantRequest,
)
from app.services.restaurant_service import RestaurantService


class RestaurantController:
    """Controller coordinating HTTP-level restaurant actions."""

    def __init__(self, restaurant_service: RestaurantService) -> None:
        self.restaurant_service = restaurant_service

    def create_restaurant(
        self,
        seller_id: int,
        data: CreateRestaurantRequest,
    ) -> RestaurantResponse:
        """Handle creating a restaurant for the authenticated seller."""
        restaurant = self.restaurant_service.create_restaurant(seller_id, data)
        return RestaurantResponse.model_validate(restaurant)

    def get_own_restaurant(self, seller_id: int) -> RestaurantResponse:
        """Handle retrieving the authenticated seller's restaurant."""
        restaurant = self.restaurant_service.get_own_restaurant(seller_id)
        return RestaurantResponse.model_validate(restaurant)

    def update_own_restaurant(
        self,
        seller_id: int,
        data: UpdateRestaurantRequest,
    ) -> RestaurantResponse:
        """Handle updating the authenticated seller's restaurant."""
        restaurant = self.restaurant_service.update_own_restaurant(seller_id, data)
        return RestaurantResponse.model_validate(restaurant)

    def update_status(
        self,
        seller_id: int,
        data: RestaurantStatusUpdateRequest,
    ) -> RestaurantResponse:
        """Handle updating restaurant open/close status."""
        restaurant = self.restaurant_service.update_restaurant_status(
            seller_id,
            data.is_open,
        )
        return RestaurantResponse.model_validate(restaurant)

    def get_public_restaurants(self) -> list[PublicRestaurantResponse]:
        """Handle retrieving verified restaurants for public browsing."""
        restaurants = self.restaurant_service.get_public_restaurants()
        return [
            PublicRestaurantResponse.model_validate(r)
            for r in restaurants
        ]

    def get_public_restaurant(
        self,
        restaurant_id: int,
    ) -> PublicRestaurantResponse:
        """Handle retrieving a single verified restaurant for public view."""
        restaurant = self.restaurant_service.get_public_restaurant_by_id(restaurant_id)
        return PublicRestaurantResponse.model_validate(restaurant)
