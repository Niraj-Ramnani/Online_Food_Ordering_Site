from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.controllers.address_controller import AddressController
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.repositories.address_repository import AddressRepository
from app.schemas.address import (
    AddressResponse,
    CreateAddressRequest,
    UpdateAddressRequest,
)
from app.services.address_service import AddressService

router = APIRouter(prefix="/api/v1/addresses", tags=["Addresses"])


def get_address_controller(db: Session = Depends(get_db)) -> AddressController:
    """Dependency provider for AddressController."""
    repo = AddressRepository(db)
    service = AddressService(repo)
    return AddressController(service)


@router.post(
    "",
    response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new delivery address",
)
def create_address(
    data: CreateAddressRequest,
    current_user: User = Depends(get_current_user),
    controller: AddressController = Depends(get_address_controller),
) -> AddressResponse:
    """Save a new delivery address for the authenticated user."""
    return controller.create_address(current_user.id, data)


@router.get(
    "",
    response_model=list[AddressResponse],
    status_code=status.HTTP_200_OK,
    summary="List all user addresses",
)
def get_user_addresses(
    current_user: User = Depends(get_current_user),
    controller: AddressController = Depends(get_address_controller),
) -> list[AddressResponse]:
    """Retrieve all delivery addresses for the authenticated user."""
    return controller.get_user_addresses(current_user.id)


@router.get(
    "/{address_id}",
    response_model=AddressResponse,
    status_code=status.HTTP_200_OK,
    summary="Get address by ID",
)
def get_user_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    controller: AddressController = Depends(get_address_controller),
) -> AddressResponse:
    """Retrieve a single delivery address by ID."""
    return controller.get_user_address(current_user.id, address_id)


@router.put(
    "/{address_id}",
    response_model=AddressResponse,
    status_code=status.HTTP_200_OK,
    summary="Update address",
)
def update_address(
    address_id: int,
    data: UpdateAddressRequest,
    current_user: User = Depends(get_current_user),
    controller: AddressController = Depends(get_address_controller),
) -> AddressResponse:
    """Update details of an existing delivery address."""
    return controller.update_address(current_user.id, address_id, data)


@router.patch(
    "/{address_id}/default",
    response_model=AddressResponse,
    status_code=status.HTTP_200_OK,
    summary="Set address as default",
)
def set_default_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    controller: AddressController = Depends(get_address_controller),
) -> AddressResponse:
    """Designate an address as the sole default delivery address."""
    return controller.set_default_address(current_user.id, address_id)


@router.delete(
    "/{address_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete address",
)
def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user),
    controller: AddressController = Depends(get_address_controller),
) -> None:
    """Delete a delivery address."""
    controller.delete_address(current_user.id, address_id)
