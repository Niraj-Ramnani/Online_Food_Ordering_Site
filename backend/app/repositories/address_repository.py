from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.address import Address


class AddressRepository:
    """Repository handling database operations for Address model."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_id(self, address_id: int) -> Address | None:
        """Fetch an address by its primary key ID."""
        statement = select(Address).where(Address.id == address_id)
        return self.db.scalars(statement).first()

    def get_by_user_id(self, user_id: int) -> list[Address]:
        """Fetch all addresses belonging to a specific user ordered by default first."""
        statement = (
            select(Address)
            .where(Address.user_id == user_id)
            .order_by(Address.is_default.desc(), Address.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def create(self, address: Address) -> Address:
        """Persist a new address."""
        self.db.add(address)
        self.db.commit()
        self.db.refresh(address)
        return address

    def update(self, address: Address) -> Address:
        """Commit changes to an existing address."""
        self.db.commit()
        self.db.refresh(address)
        return address

    def delete(self, address: Address) -> None:
        """Delete an address record."""
        self.db.delete(address)
        self.db.commit()

    def clear_user_default_addresses(
        self,
        user_id: int,
        exclude_address_id: int | None = None,
    ) -> None:
        """Set is_default = False on all addresses for the user, optionally excluding one."""
        statement = (
            update(Address)
            .where(Address.user_id == user_id)
        )
        if exclude_address_id is not None:
            statement = statement.where(Address.id != exclude_address_id)

        statement = statement.values(is_default=False)
        self.db.execute(statement)
        self.db.commit()
