import asyncio
import json
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.config.database import SessionLocal, engine
from app.main import app
from app.models.user import User, UserRole
from app.websocket.connection_manager import manager

client = TestClient(app)


def run_tests():
    print("=== 1. Setup User for WebSocket Tests ===")
    res_reg = client.post(
        "/api/v1/auth/register",
        json={"name": "Alice WS", "email": "alice@ws.com", "password": "password123", "role": "USER"},
    )
    assert res_reg.status_code == 201
    user_id = res_reg.json()["id"]

    token_res = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@ws.com", "password": "password123"},
    ).json()
    access_token = token_res["access_token"]
    refresh_token = token_res["refresh_token"]

    print("\n=== 2. Testing Unauthenticated WebSocket Rejections ===")
    # 1. Missing token rejected
    try:
        with client.websocket_connect("/ws/orders") as ws:
            pass
    except Exception:
        print("Missing token connection rejected.")

    # 2. Invalid token rejected
    try:
        with client.websocket_connect("/ws/orders?token=invalid_token_xyz") as ws:
            pass
    except Exception:
        print("Invalid token connection rejected.")

    # 3. Refresh token used instead of access token rejected
    try:
        with client.websocket_connect(f"/ws/orders?token={refresh_token}") as ws:
            pass
    except Exception:
        print("Refresh token rejected on WebSocket connection.")

    print("\n=== 3. Testing Authenticated WebSocket Connection & Heartbeat ===")
    # 4. Valid access token connection accepted
    with client.websocket_connect(f"/ws/orders?token={access_token}") as websocket:
        # Receive welcome acknowledgment
        ack_msg = websocket.receive_json()
        assert ack_msg["type"] == "connection_established"
        assert ack_msg["user_id"] == user_id
        print("Connected and received acknowledgment:", ack_msg["message"])

        # Send ping heartbeat
        websocket.send_text("ping")
        pong_msg = websocket.receive_json()
        assert pong_msg["type"] == "pong"
        print("Sent ping, received pong heartbeat successfully.")

        # Simulate real-time order status update sent through ConnectionManager
        test_event = {
            "type": "order_status_updated",
            "order_id": 999,
            "status": "PREPARING",
        }
        asyncio.run(manager.send_personal_message(user_id, test_event))

        received_event = websocket.receive_json()
        assert received_event["type"] == "order_status_updated"
        assert received_event["order_id"] == 999
        assert received_event["status"] == "PREPARING"
        print("Received live order update event over WebSocket:", received_event)

    print("\n=== ALL WEBSOCKET TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    run_tests()
