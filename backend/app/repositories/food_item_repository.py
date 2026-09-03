from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.food_item import FoodItem


class FoodItemRepository:
    """Repository handling database operations for FoodItem model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, food_item_id: int) -> FoodItem | None:
        """Fetch a single food item by primary key ID."""
        statement = select(FoodItem).where(FoodItem.id == food_item_id)
        return self.db.scalars(statement).first()

    def get_by_restaurant_id(
        self,
        restaurant_id: int,
        only_available: bool = False,
    ) -> list[FoodItem]:
        """Fetch all food items belonging to a restaurant, optionally filtered by availability."""
        statement = select(FoodItem).where(FoodItem.restaurant_id == restaurant_id)
        if only_available:
            statement = statement.where(FoodItem.is_available == True)  # noqa: E712
        statement = statement.order_by(FoodItem.category.asc(), FoodItem.name.asc())
        return list(self.db.scalars(statement).all())

    def create(self, food_item: FoodItem) -> FoodItem:
        """Persist a new food item to the database."""
        self.db.add(food_item)
        self.db.commit()
        self.db.refresh(food_item)
        return food_item

    def update(self, food_item: FoodItem) -> FoodItem:
        """Commit changes to an existing food item."""
        self.db.commit()
        self.db.refresh(food_item)
        return food_item

    def delete(self, food_item: FoodItem) -> None:
        """Delete a food item from the database."""
        self.db.delete(food_item)
        self.db.commit()
