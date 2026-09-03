from decimal import Decimal

from app.models.order import Order
from app.schemas.admin import (
    AdminDashboardStatsResponse,
    AdminFoodStatusRequest,
    AdminRestaurantStatusRequest,
    AdminRestaurantVerifyRequest,
    AdminUserResponse,
    AdminUserStatusRequest,
)
from app.schemas.food_item import FoodItemResponse
from app.schemas.order import (
    OrderItemResponse,
    OrderResponse,
    OrderRestaurantResponse,
)
from app.schemas.restaurant import RestaurantResponse
from app.services.admin_service import AdminService


class AdminController:
    """Controller coordinating HTTP actions for Admin dashboard and oversight."""

    def __init__(self, admin_service: AdminService) -> None:
        self.admin_service = admin_service

    def _format_order(self, order: Order) -> OrderResponse:
        items = []
        for item in order.order_items:
            unit_price = Decimal(str(item.unit_price))
            items.append(
                OrderItemResponse(
                    id=item.id,
                    food_item_id=item.food_item_id,
                    food_name=item.food_name,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    item_total=unit_price * item.quantity,
                )
            )
        rest_info = OrderRestaurantResponse(
            id=order.restaurant.id if order.restaurant else order.restaurant_id,
            name=order.restaurant.name if order.restaurant else "",
            address=order.restaurant.address if order.restaurant else "",
            image_url=order.restaurant.image_url if order.restaurant else None,
        )
        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            restaurant=rest_info,
            address_id=order.address_id,
            delivery_address=order.delivery_address,
            delivery_latitude=order.delivery_latitude,
            delivery_longitude=order.delivery_longitude,
            status=order.status,
            total_amount=Decimal(str(order.total_amount)),
            description=order.description,
            items=items,
            created_at=order.created_at,
            updated_at=order.updated_at,
        )

    def get_users(self) -> list[AdminUserResponse]:
        users = self.admin_service.get_users()
        return [AdminUserResponse.model_validate(u) for u in users]

    def update_user_status(self, user_id: int, data: AdminUserStatusRequest) -> AdminUserResponse:
        user = self.admin_service.update_user_status(user_id, data.is_active)
        return AdminUserResponse.model_validate(user)

    def get_restaurants(self) -> list[RestaurantResponse]:
        restaurants = self.admin_service.get_restaurants()
        return [RestaurantResponse.model_validate(r) for r in restaurants]

    def update_restaurant_verification(
        self, restaurant_id: int, data: AdminRestaurantVerifyRequest
    ) -> RestaurantResponse:
        restaurant = self.admin_service.update_restaurant_verification(
            restaurant_id, data.is_verified
        )
        return RestaurantResponse.model_validate(restaurant)

    def update_restaurant_status(
        self, restaurant_id: int, data: AdminRestaurantStatusRequest
    ) -> RestaurantResponse:
        restaurant = self.admin_service.update_restaurant_status(restaurant_id, data.is_open)
        return RestaurantResponse.model_validate(restaurant)

    def get_food_items(self) -> list[FoodItemResponse]:
        food_items = self.admin_service.get_food_items()
        return [FoodItemResponse.model_validate(f) for f in food_items]

    def update_food_availability(
        self, food_item_id: int, data: AdminFoodStatusRequest
    ) -> FoodItemResponse:
        food_item = self.admin_service.update_food_availability(food_item_id, data.is_available)
        return FoodItemResponse.model_validate(food_item)

    def get_orders(self) -> list[OrderResponse]:
        orders = self.admin_service.get_orders()
        return [self._format_order(o) for o in orders]

    def get_order_by_id(self, order_id: int) -> OrderResponse:
        order = self.admin_service.get_order_by_id(order_id)
        return self._format_order(order)

    def get_dashboard(self) -> AdminDashboardStatsResponse:
        stats = self.admin_service.get_dashboard_stats()
        return AdminDashboardStatsResponse(**stats)
