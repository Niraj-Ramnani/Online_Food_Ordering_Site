from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine
from app.config.settings import CORS_ORIGINS
import app.models  # Register all models for SQLAlchemy Base.metadata
from app.routes.auth_routes import router as auth_router

app = FastAPI(
    title="Online Food Ordering API",
    version="1.0.0",
    description="Backend API for Online Food Ordering Application",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include Routers
app.include_router(auth_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }