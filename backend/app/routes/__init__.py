from app.routes.address_routes import router as address_router
from app.routes.admin_routes import router as admin_router
from app.routes.auth_routes import router as auth_router
from app.routes.cart_routes import router as cart_router
from app.routes.food_item_routes import router as food_item_router
from app.routes.notification_routes import router as notification_router
from app.routes.order_routes import order_router, seller_order_router
from app.routes.payment_routes import router as payment_router
from app.routes.restaurant_routes import router as restaurant_router
from app.routes.websocket_routes import router as websocket_router

__all__ = [
    "auth_router",
    "restaurant_router",
    "food_item_router",
    "address_router",
    "cart_router",
    "order_router",
    "seller_order_router",
    "payment_router",
    "notification_router",
    "admin_router",
    "websocket_router",
]
