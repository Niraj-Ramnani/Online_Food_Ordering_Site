from fastapi import FastAPI
from app.config.database import engine
app = FastAPI(title="Online Food Ordering API")


@app.get("/health")
def health_check():
    try:
        with engine.connect():
            return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "unhealthy", "database": "disconnected"}