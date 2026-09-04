import asyncio
from decimal import Decimal
from fastapi import HTTPException, status

from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.repositories.address_repository import AddressRepository
from app.repositories.cart_item_repository import CartItemRepository
from app.repositories.cart_repository import CartRepository
from app.repositories.food_item_repository import FoodItemRepository
from app.repositories.order_item_repository import OrderItemRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.restaurant_repository import RestaurantRepository
from app.schemas.order import CheckoutRequest
from app.services.notification_service import NotificationService
from app.websocket.connection_manager import manager

VALID_SELLER_TRANSITIONS: dict[OrderStatus, list[OrderStatus]] = {
    OrderStatus.PLACED: [OrderStatus.ACCEPTED, OrderStatus.REJECTED],
    OrderStatus.ACCEPTED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    OrderStatus.PREPARING: [OrderStatus.READY],
    OrderStatus.READY: [OrderStatus.OUT_FOR_DELIVERY],
    OrderStatus.OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
    OrderStatus.DELIVERED: [],
    OrderStatus.CANCELLED: [],
    OrderStatus.REJECTED: [],
}

STATUS_TITLE_MAP = {
    OrderStatus.ACCEPTED: "Order Accepted",
    OrderStatus.PREPARING: "Order Preparing",
    OrderStatus.READY: "Order Ready",
    OrderStatus.OUT_FOR_DELIVERY: "Order Out For Delivery",
    OrderStatus.DELIVERED: "Order Delivered",
    OrderStatus.REJECTED: "Order Rejected",
    OrderStatus.CANCELLED: "Order Cancelled",
}

STATUS_MESSAGE_MAP = {
    OrderStatus.ACCEPTED: "Your order has been accepted by the restaurant.",
    OrderStatus.PREPARING: "Your order is currently being prepared.",
    OrderStatus.READY: "Your order is ready for delivery.",
    OrderStatus.OUT_FOR_DELIVERY: "Your order is out for delivery.",
    OrderStatus.DELIVERED: "Your order has been delivered. Enjoy your meal!",
    OrderStatus.REJECTED: "The restaurant was unable to accept your order.",
    OrderStatus.CANCELLED: "Your order was cancelled.",
}


class OrderService:
    """Service containing order lifecycle, checkout, status transitions, notifications, and real-time updates."""

    def __init__(
        self,
        order_repo: OrderRepository,
        order_item_repo: OrderItemRepository,
        cart_repo: CartRepository,
        cart_item_repo: CartItemRepository,
        address_repo: AddressRepository,
        restaurant_repo: RestaurantRepository,
        food_repo: FoodItemRepository,
        notification_service: NotificationService | None = None,
    ) -> None:
        self.order_repo = order_repo
        self.order_item_repo = order_item_repo
        self.cart_repo = cart_repo
        self.cart_item_repo = cart_item_repo
        self.address_repo = address_repo
        self.restaurant_repo = restaurant_repo
        self.food_repo = food_repo
        self.notification_service = notification_service

    def _dispatch_websocket_event(self, user_id: int, payload: dict) -> None:
        """Helper to safely schedule async WebSocket event delivery."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(manager.send_personal_message(user_id, payload))
        except RuntimeError:
            try:
                asyncio.run(manager.send_personal_message(user_id, payload))
            except Exception:
                pass

    def checkout(
        self,
        user_id: int,
        data: CheckoutRequest,
    ) -> Order:
        """Process checkout from active cart, creating order and snapshotting items and address."""
        # 1. Fetch user's cart
        cart = self.cart_repo.get_by_user_id(user_id)
        if not cart or not cart.cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot place order with an empty cart.",
            )

        # 2. Validate delivery address ownership
        address = self.address_repo.get_by_id(data.address_id)
        if not address or address.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery address not found.",
            )

        # 3. Validate restaurant status
        if not cart.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart has no associated restaurant.",
            )

        restaurant = self.restaurant_repo.get_by_id(cart.restaurant_id)
        if not restaurant or not restaurant.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant is not verified.",
            )

        if not restaurant.is_open:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant is currently closed and not accepting orders.",
            )

        # 4. Validate food items availability & restaurant match
        total_amount = Decimal("0.00")
        order_items_to_create: list[OrderItem] = []

        for item in cart.cart_items:
            food_item = self.food_repo.get_by_id(item.food_item_id)
            if not food_item or not food_item.is_available:
                name = item.food_item.name if item.food_item else f"ID {item.food_item_id}"
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Food item '{name}' is no longer available.",
                )

            if food_item.restaurant_id != restaurant.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Food item in cart does not belong to the restaurant.",
                )

            current_unit_price = Decimal(str(food_item.price))
            total_amount += current_unit_price * item.quantity

            # Snapshot food name and price at checkout time
            order_items_to_create.append(
                OrderItem(
                    food_item_id=food_item.id,
                    food_name=food_item.name,
                    quantity=item.quantity,
                    unit_price=current_unit_price,
                )
            )

        # 5. Snapshot delivery address format
        formatted_address = (
            f"{address.address_line}, {address.city}, {address.state} - {address.pincode}"
        )

        # 6. Create Order record
        new_order = Order(
            user_id=user_id,
            restaurant_id=restaurant.id,
            address_id=address.id,
            delivery_address=formatted_address,
            delivery_latitude=address.latitude,
            delivery_longitude=address.longitude,
            status=OrderStatus.PLACED,
            total_amount=total_amount,
            description=data.description,
        )
        new_order.order_items = order_items_to_create

        created_order = self.order_repo.create(new_order)

        # 7. Clear cart items and reset restaurant on cart
        self.cart_item_repo.clear_cart_items(cart.id)
        cart.restaurant_id = None
        self.cart_repo.update(cart)

        # 8. Trigger Notifications & Real-Time Events
        if self.notification_service:
            # Customer Notification
            self.notification_service.create_and_send_notification(
                user_id=user_id,
                title="Order Placed",
                message=f"Your order #{created_order.id} for Rs. {created_order.total_amount} has been placed.",
                notification_type="ORDER_PLACED",
                order_id=created_order.id,
                sound=True,
            )

            # Seller Notification
            if restaurant.seller_id:
                self.notification_service.create_and_send_notification(
                    user_id=restaurant.seller_id,
                    title="New Order Received",
                    message=f"New order #{created_order.id} received for {restaurant.name} (Rs. {created_order.total_amount}).",
                    notification_type="NEW_ORDER",
                    order_id=created_order.id,
                    sound=True,
                )
                self._dispatch_websocket_event(
                    restaurant.seller_id,
                    {
                        "type": "new_order_received",
                        "order_id": created_order.id,
                        "status": "PLACED",
                        "total_amount": str(created_order.total_amount),
                    },
                )

        return created_order

    def get_user_orders(self, user_id: int) -> list[Order]:
        """Fetch all orders placed by the authenticated user."""
        return self.order_repo.get_by_user_id(user_id)

    def get_user_order_by_id(self, user_id: int, order_id: int) -> Order:
        """Fetch a specific order after verifying user ownership."""
        order = self.order_repo.get_by_id(order_id)
        if not order or order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )
        return order

    def cancel_user_order(self, user_id: int, order_id: int) -> Order:
        """Allow a customer to cancel an order if it is still in PLACED status."""
        order = self.get_user_order_by_id(user_id, order_id)
        if order.status != OrderStatus.PLACED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be cancelled in its current status ({order.status.value}).",
            )

        order.status = OrderStatus.CANCELLED
        updated_order = self.order_repo.update(order)

        # Notify Customer & Seller
        if self.notification_service:
            self.notification_service.create_and_send_notification(
                user_id=user_id,
                title="Order Cancelled",
                message=f"Your order #{order.id} has been cancelled.",
                notification_type="ORDER_CANCELLED",
                order_id=order.id,
                sound=False,
            )
            seller_id = order.restaurant.seller_id if order.restaurant else None
            if seller_id:
                self.notification_service.create_and_send_notification(
                    user_id=seller_id,
                    title="Order Cancelled",
                    message=f"Customer cancelled Order #{order.id}.",
                    notification_type="ORDER_CANCELLED",
                    order_id=order.id,
                    sound=False,
                )
                self._dispatch_websocket_event(
                    seller_id,
                    {
                        "type": "order_status_updated",
                        "order_id": order.id,
                        "status": "CANCELLED",
                    },
                )

        return updated_order

    def get_seller_orders(self, seller_id: int) -> list[Order]:
        """Fetch all orders placed at the authenticated seller's restaurant."""
        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller does not have a restaurant.",
            )
        return self.order_repo.get_by_restaurant_id(restaurant.id)

    def get_seller_order_by_id(self, seller_id: int, order_id: int) -> Order:
        """Fetch a specific order after verifying seller restaurant ownership."""
        restaurant = self.restaurant_repo.get_by_seller_id(seller_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seller does not have a restaurant.",
            )

        order = self.order_repo.get_by_id(order_id)
        if not order or order.restaurant_id != restaurant.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found.",
            )
        return order

    def update_seller_order_status(
        self,
        seller_id: int,
        order_id: int,
        new_status: OrderStatus,
    ) -> Order:
        """Update an order status after verifying seller ownership and valid transition rules."""
        order = self.get_seller_order_by_id(seller_id, order_id)

        allowed_transitions = VALID_SELLER_TRANSITIONS.get(order.status, [])
        if new_status not in allowed_transitions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition order from {order.status.value} to {new_status.value}.",
            )

        order.status = new_status
        updated_order = self.order_repo.update(order)

        # Notify Customer and send real-time WebSocket update
        if self.notification_service:
            title = STATUS_TITLE_MAP.get(new_status, f"Order {new_status.value}")
            msg = STATUS_MESSAGE_MAP.get(
                new_status, f"Your order #{order.id} status updated to {new_status.value}."
            )
            self.notification_service.create_and_send_notification(
                user_id=order.user_id,
                title=title,
                message=msg,
                notification_type=f"ORDER_{new_status.value}",
                order_id=order.id,
                sound=True,
            )
            status_event = {
                "type": "order_status_updated",
                "order_id": order.id,
                "status": new_status.value,
            }
            self._dispatch_websocket_event(order.user_id, status_event)
            self._dispatch_websocket_event(seller_id, status_event)

        return updated_order
