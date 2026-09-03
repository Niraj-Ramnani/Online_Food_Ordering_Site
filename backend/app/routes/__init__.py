from app.routes.auth_routes import router as auth_router
from app.routes.food_item_routes import router as food_item_router
from app.routes.restaurant_routes import router as restaurant_router

__all__ = [
    "auth_router",
    "restaurant_router",
    "food_item_router",
]
