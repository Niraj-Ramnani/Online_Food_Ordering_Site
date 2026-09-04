from app.schemas.address import (
    AddressResponse,
    CreateAddressRequest,
    UpdateAddressRequest,
)
from app.services.address_service import AddressService


class AddressController:
    """Controller coordinating HTTP-level address actions."""

    def __init__(self, address_service: AddressService) -> None:
        self.address_service = address_service

    def create_address(
        self,
        user_id: int,
        data: CreateAddressRequest,
    ) -> AddressResponse:
        """Handle creating a delivery address for the user."""
        address = self.address_service.create_address(user_id, data)
        return AddressResponse.model_validate(address)

    def get_user_addresses(
        self,
        user_id: int,
    ) -> list[AddressResponse]:
        """Handle retrieving all delivery addresses for the user."""
        addresses = self.address_service.get_user_addresses(user_id)
        return [
            AddressResponse.model_validate(addr)
            for addr in addresses
        ]

    def get_user_address(
        self,
        user_id: int,
        address_id: int,
    ) -> AddressResponse:
        """Handle retrieving a single delivery address."""
        address = self.address_service.get_user_address_by_id(user_id, address_id)
        return AddressResponse.model_validate(address)

    def update_address(
        self,
        user_id: int,
        address_id: int,
        data: UpdateAddressRequest,
    ) -> AddressResponse:
        """Handle updating a delivery address."""
        address = self.address_service.update_address(user_id, address_id, data)
        return AddressResponse.model_validate(address)

    def set_default_address(
        self,
        user_id: int,
        address_id: int,
    ) -> AddressResponse:
        """Handle designating an address as the default."""
        address = self.address_service.set_default_address(user_id, address_id)
        return AddressResponse.model_validate(address)

    def delete_address(
        self,
        user_id: int,
        address_id: int,
    ) -> None:
        """Handle deleting a delivery address."""
        self.address_service.delete_address(user_id, address_id)
