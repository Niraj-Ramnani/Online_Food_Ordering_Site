from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.cart import Cart
from app.models.cart_item import CartItem


class CartRepository:
    """Repository handling database operations for Cart model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_user_id(self, user_id: int) -> Cart | None:
        """Fetch the single active cart belonging to a user, preloading items and relationships."""
        statement = (
            select(Cart)
            .where(Cart.user_id == user_id)
            .options(
                selectinload(Cart.cart_items).selectinload(CartItem.food_item),
                selectinload(Cart.restaurant),
            )
        )
        return self.db.scalars(statement).first()

    def create(self, cart: Cart) -> Cart:
        """Persist a new cart to the database."""
        self.db.add(cart)
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def update(self, cart: Cart) -> Cart:
        """Commit changes on a cart."""
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def delete(self, cart: Cart) -> None:
        """Delete a cart and its cascaded items."""
        self.db.delete(cart)
        self.db.commit()
