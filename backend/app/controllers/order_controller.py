from decimal import Decimal

from app.models.order import Order
from app.schemas.order import (
    CheckoutRequest,
    OrderItemResponse,
    OrderResponse,
    OrderRestaurantResponse,
    UpdateOrderStatusRequest,
)
from app.services.order_service import OrderService


class OrderController:
    """Controller coordinating HTTP-level order actions."""

    def __init__(self, order_service: OrderService) -> None:
        self.order_service = order_service

    def _format_order_response(self, order: Order) -> OrderResponse:
        """Format an Order SQLAlchemy model into an OrderResponse DTO with calculated item totals."""
        items: list[OrderItemResponse] = []
        for item in order.order_items:
            unit_price = Decimal(str(item.unit_price))
            item_total = unit_price * item.quantity
            items.append(
                OrderItemResponse(
                    id=item.id,
                    food_item_id=item.food_item_id,
                    food_name=item.food_name,
                    quantity=item.quantity,
                    unit_price=unit_price,
                    item_total=item_total,
                )
            )

        restaurant_info = OrderRestaurantResponse(
            id=order.restaurant.id if order.restaurant else order.restaurant_id,
            name=order.restaurant.name if order.restaurant else "",
            address=order.restaurant.address if order.restaurant else "",
            image_url=order.restaurant.image_url if order.restaurant else None,
        )

        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            restaurant=restaurant_info,
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

    def checkout(
        self,
        user_id: int,
        data: CheckoutRequest,
    ) -> OrderResponse:
        """Handle checkout request."""
        order = self.order_service.checkout(user_id, data)
        return self._format_order_response(order)

    def get_user_orders(
        self,
        user_id: int,
    ) -> list[OrderResponse]:
        """Handle retrieving order history for authenticated user."""
        orders = self.order_service.get_user_orders(user_id)
        return [self._format_order_response(o) for o in orders]

    def get_user_order(
        self,
        user_id: int,
        order_id: int,
    ) -> OrderResponse:
        """Handle retrieving specific user order."""
        order = self.order_service.get_user_order_by_id(user_id, order_id)
        return self._format_order_response(order)

    def cancel_user_order(
        self,
        user_id: int,
        order_id: int,
    ) -> OrderResponse:
        """Handle customer order cancellation."""
        order = self.order_service.cancel_user_order(user_id, order_id)
        return self._format_order_response(order)

    def get_seller_orders(
        self,
        seller_id: int,
    ) -> list[OrderResponse]:
        """Handle retrieving incoming orders for seller's restaurant."""
        orders = self.order_service.get_seller_orders(seller_id)
        return [self._format_order_response(o) for o in orders]

    def get_seller_order(
        self,
        seller_id: int,
        order_id: int,
    ) -> OrderResponse:
        """Handle retrieving specific incoming order for seller."""
        order = self.order_service.get_seller_order_by_id(seller_id, order_id)
        return self._format_order_response(order)

    def update_seller_order_status(
        self,
        seller_id: int,
        order_id: int,
        data: UpdateOrderStatusRequest,
    ) -> OrderResponse:
        """Handle updating order status by seller."""
        order = self.order_service.update_seller_order_status(
            seller_id,
            order_id,
            data.status,
        )
        return self._format_order_response(order)
