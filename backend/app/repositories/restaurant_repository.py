from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.restaurant import Restaurant


class RestaurantRepository:
    """Repository handling database operations for Restaurant model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, restaurant_id: int) -> Restaurant | None:
        """Fetch a single restaurant by primary key ID."""
        statement = select(Restaurant).where(Restaurant.id == restaurant_id)
        return self.db.scalars(statement).first()

    def get_by_seller_id(self, seller_id: int) -> Restaurant | None:
        """Fetch a restaurant owned by a specific seller ID."""
        statement = select(Restaurant).where(Restaurant.seller_id == seller_id)
        return self.db.scalars(statement).first()

    def get_verified_restaurants(self) -> list[Restaurant]:
        """Fetch all restaurants that have been verified by admin."""
        statement = (
            select(Restaurant)
            .where(Restaurant.is_verified == True)  # noqa: E712
            .order_by(Restaurant.name.asc())
        )
        return list(self.db.scalars(statement).all())

    def create(self, restaurant: Restaurant) -> Restaurant:
        """Persist a new restaurant to the database."""
        self.db.add(restaurant)
        self.db.commit()
        self.db.refresh(restaurant)
        return restaurant

    def update(self, restaurant: Restaurant) -> Restaurant:
        """Commit changes to an existing restaurant."""
        self.db.commit()
        self.db.refresh(restaurant)
        return restaurant
