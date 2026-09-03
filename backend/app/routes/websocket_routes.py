from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.models.user import User
from app.security.jwt import decode_token
from app.websocket.connection_manager import manager

router = APIRouter(tags=["WebSockets"])


@router.websocket("/ws/orders")
async def websocket_orders_endpoint(
    websocket: WebSocket,
    token: str | None = Query(default=None),
):
    """Authenticated WebSocket endpoint for real-time order and notification updates.
    
    Clients connect using: ws://<host>:<port>/ws/orders?token=<jwt_access_token>
    """
    if not token:
        await websocket.close(code=1008, reason="Authentication token missing")
        return

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid or expired token")
        return

    token_type = payload.get("type")
    user_id_str = payload.get("sub")
    if token_type != "access" or not user_id_str:
        await websocket.close(code=1008, reason="Invalid token claims")
        return

    try:
        user_id = int(user_id_str)
    except ValueError:
        await websocket.close(code=1008, reason="Invalid user identifier")
        return

    # Verify user exists and is active in DB
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            await websocket.close(code=1008, reason="User inactive or not found")
            return
    finally:
        db.close()

    # Accept connection and register with connection manager
    await manager.connect(user_id, websocket)

    # Send initial connection acknowledgment event
    await manager.send_personal_message(
        user_id,
        {
            "type": "connection_established",
            "message": "Connected to real-time order updates channel.",
            "user_id": user_id,
        },
    )

    try:
        while True:
            # Keep connection alive and receive any client-side heartbeats / pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type": "pong"}')
    except (WebSocketDisconnect, Exception):
        manager.disconnect(user_id, websocket)
