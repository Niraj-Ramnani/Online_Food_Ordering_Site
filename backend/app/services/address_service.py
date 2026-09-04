from fastapi import HTTPException, status

from app.models.address import Address
from app.repositories.address_repository import AddressRepository
from app.schemas.address import (
    CreateAddressRequest,
    UpdateAddressRequest,
)


class AddressService:
    """Service containing business logic for address management."""

    def __init__(self, address_repo: AddressRepository) -> None:
        self.address_repo = address_repo

    def create_address(
        self,
        user_id: int,
        data: CreateAddressRequest,
    ) -> Address:
        """Create a new delivery address for the authenticated user."""
        if data.is_default:
            self.address_repo.clear_user_default_addresses(user_id)

        new_address = Address(
            user_id=user_id,
            label=data.label,
            address_line=data.address_line,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
            latitude=data.latitude,
            longitude=data.longitude,
            is_default=data.is_default,
        )
        return self.address_repo.create(new_address)

    def get_user_addresses(self, user_id: int) -> list[Address]:
        """Fetch all delivery addresses belonging to the authenticated user."""
        return self.address_repo.get_by_user_id(user_id)

    def get_user_address_by_id(
        self,
        user_id: int,
        address_id: int,
    ) -> Address:
        """Fetch a specific address after verifying user ownership."""
        address = self.address_repo.get_by_id(address_id)
        if not address or address.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found.",
            )
        return address

    def update_address(
        self,
        user_id: int,
        address_id: int,
        data: UpdateAddressRequest,
    ) -> Address:
        """Update an existing delivery address after verifying user ownership."""
        address = self.get_user_address_by_id(user_id, address_id)

        if data.is_default is True and not address.is_default:
            self.address_repo.clear_user_default_addresses(
                user_id,
                exclude_address_id=address.id,
            )
            address.is_default = True
        elif data.is_default is False:
            address.is_default = False

        if data.label is not None:
            address.label = data.label
        if data.address_line is not None:
            address.address_line = data.address_line
        if data.city is not None:
            address.city = data.city
        if data.state is not None:
            address.state = data.state
        if data.pincode is not None:
            address.pincode = data.pincode
        if data.latitude is not None:
            address.latitude = data.latitude
        if data.longitude is not None:
            address.longitude = data.longitude

        return self.address_repo.update(address)

    def set_default_address(
        self,
        user_id: int,
        address_id: int,
    ) -> Address:
        """Mark an address as the sole default delivery address for the user."""
        address = self.get_user_address_by_id(user_id, address_id)
        self.address_repo.clear_user_default_addresses(
            user_id,
            exclude_address_id=address.id,
        )
        address.is_default = True
        return self.address_repo.update(address)

    def delete_address(
        self,
        user_id: int,
        address_id: int,
    ) -> None:
        """Delete an address after verifying user ownership."""
        address = self.get_user_address_by_id(user_id, address_id)
        self.address_repo.delete(address)
