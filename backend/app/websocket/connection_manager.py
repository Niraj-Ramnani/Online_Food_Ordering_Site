import json
from typing import Any
from fastapi import WebSocket


class ConnectionManager:
    """Connection manager for managing authenticated WebSocket clients and real-time event broadcasting."""

    def __init__(self) -> None:
        # Map user_id -> list of active WebSocket connections
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        """Accept WebSocket connection and register it under user_id."""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        """Unregister a disconnected WebSocket connection."""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, user_id: int, message: dict[str, Any]) -> None:
        """Send a JSON event payload to all active WebSocket connections for a specific user."""
        if user_id in self.active_connections:
            dead_connections: list[WebSocket] = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    dead_connections.append(connection)

            for dead in dead_connections:
                self.disconnect(user_id, dead)

    async def broadcast_to_users(self, user_ids: list[int], message: dict[str, Any]) -> None:
        """Broadcast a JSON event payload to a list of users."""
        for user_id in user_ids:
            await self.send_personal_message(user_id, message)


# Global singleton instance of ConnectionManager
manager = ConnectionManager()
