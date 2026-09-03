from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.cart_item import CartItem


class CartItemRepository:
    """Repository handling database operations for CartItem model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, cart_item_id: int) -> CartItem | None:
        """Fetch a single cart item with its food item preloaded."""
        statement = (
            select(CartItem)
            .where(CartItem.id == cart_item_id)
            .options(selectinload(CartItem.food_item))
        )
        return self.db.scalars(statement).first()

    def get_by_cart_and_food(
        self,
        cart_id: int,
        food_item_id: int,
    ) -> CartItem | None:
        """Fetch a specific food item row inside a cart."""
        statement = (
            select(CartItem)
            .where(
                CartItem.cart_id == cart_id,
                CartItem.food_item_id == food_item_id,
            )
        )
        return self.db.scalars(statement).first()

    def create(self, cart_item: CartItem) -> CartItem:
        """Persist a new cart item."""
        self.db.add(cart_item)
        self.db.commit()
        self.db.refresh(cart_item)
        return cart_item

    def update(self, cart_item: CartItem) -> CartItem:
        """Commit updates to a cart item."""
        self.db.commit()
        self.db.refresh(cart_item)
        return cart_item

    def delete(self, cart_item: CartItem) -> None:
        """Delete a cart item."""
        self.db.delete(cart_item)
        self.db.commit()

    def clear_cart_items(self, cart_id: int) -> None:
        """Delete all items belonging to a specific cart."""
        statement = delete(CartItem).where(CartItem.cart_id == cart_id)
        self.db.execute(statement)
        self.db.commit()
