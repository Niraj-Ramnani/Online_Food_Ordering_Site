from fastapi import HTTPException, status

from app.models.restaurant import Restaurant
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.restaurant import (
    CreateRestaurantRequest,
    UpdateRestaurantRequest,
)


class RestaurantService:
    """Service containing business logic for restaurants."""

    def __init__(self, restaurant_repo: RestaurantRepository) -> None:
        self.restaurant_repo = restaurant_repo

    def create_restaurant(
        self,
        seller_id: int,
        data: CreateRestaurantRequest,
    ) -> Restaurant:
        """Create a new restaurant for an authenticated seller (max 1 per seller)."""
        existing = self.restaurant_repo.get_by_seller_id(seller_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Seller already owns a restaurant.",
            )

        new_restaurant = Restaurant(
            seller_id=seller_id,
            name=data.name,
            description=data.description,
            address=data.address,
            image_url=data.image_url,
            is_verified=False,
            is_open=False,
        )
        return self.restaurant_repo.create(new_restaurant)

    def get_own_restaurant(self, seller_id: int) -> Restaurant:
        """Retrieve the authenticated seller's restaurant."""
        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller does not have a restaurant.",
            )
        return restaurant

    def update_own_restaurant(
        self,
        seller_id: int,
        data: UpdateRestaurantRequest,
    ) -> Restaurant:
        """Update fields on the authenticated seller's restaurant."""
        restaurant = self.get_own_restaurant(seller_id)

        if data.name is not None:
            restaurant.name = data.name
        if data.description is not None:
            restaurant.description = data.description
        if data.address is not None:
            restaurant.address = data.address
        if data.image_url is not None:
            restaurant.image_url = data.image_url

        return self.restaurant_repo.update(restaurant)

    def update_restaurant_status(
        self,
        seller_id: int,
        is_open: bool,
    ) -> Restaurant:
        """Update the open/close accepting orders status of the seller's restaurant."""
        restaurant = self.get_own_restaurant(seller_id)
        restaurant.is_open = is_open
        return self.restaurant_repo.update(restaurant)

    def get_public_restaurants(self) -> list[Restaurant]:
        """Fetch all verified restaurants for public customer browsing."""
        return self.restaurant_repo.get_verified_restaurants()

    def get_public_restaurant_by_id(self, restaurant_id: int) -> Restaurant:
        """Fetch a single verified restaurant by ID for public view."""
        restaurant = self.restaurant_repo.get_by_id(restaurant_id)
        if not restaurant or not restaurant.is_verified:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found.",
            )
        return restaurant
