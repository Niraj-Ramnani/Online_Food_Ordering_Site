from fastapi import FastAPI

from app.config.database import Base, engine
import app.models

app = FastAPI(title="Online Food Ordering API")


Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }