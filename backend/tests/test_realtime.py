from datetime import UTC, datetime

from fastapi.testclient import TestClient


def signup_and_login(client: TestClient, *, email: str) -> None:
    client.post(
        "/api/v1/auth/signup",
        json={"name": email.split("@")[0], "email": email, "password": "password123"},
    )
    client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )


def test_websocket_rejects_unauthenticated_connection(client: TestClient) -> None:
    try:
        with client.websocket_connect("/api/v1/ws/tasks"):
            assert False, "websocket should not connect without auth"
    except Exception:
        pass


def test_websocket_receives_task_update_event(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")

    with client.websocket_connect("/api/v1/ws/tasks") as websocket:
        create_response = client.post("/api/v1/tasks", json={"title": "Realtime task"})
        event = websocket.receive_json()

    assert create_response.status_code == 201
    assert event["type"] == "task.created"
    assert event["task_id"] == create_response.json()["id"]
    assert event["user_id"] == create_response.json()["user_id"]
    assert event["payload"]["title"] == "Realtime task"
    datetime.fromisoformat(event["timestamp"].replace("Z", "+00:00")).astimezone(UTC)


def test_sse_endpoint_requires_auth(client: TestClient) -> None:
    response = client.get("/api/v1/events/tasks")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"
