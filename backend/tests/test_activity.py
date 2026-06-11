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


def test_activity_log_is_created_after_task_creation(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")

    task_response = client.post("/api/v1/tasks", json={"title": "Create task"})
    task_id = task_response.json()["id"]

    response = client.get(f"/api/v1/tasks/{task_id}/activity")

    assert response.status_code == 200
    assert response.json()["activities"][0]["action"] == "task.created"
    assert response.json()["activities"][0]["new_value"]["title"] == "Create task"


def test_activity_log_is_created_after_task_update(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")

    created = client.post("/api/v1/tasks", json={"title": "Initial title"}).json()
    client.patch(f"/api/v1/tasks/{created['id']}", json={"title": "Updated title"})

    response = client.get(f"/api/v1/tasks/{created['id']}/activity")

    assert response.status_code == 200
    actions = [entry["action"] for entry in response.json()["activities"]]
    assert "task.updated" in actions
    updated_entry = next(entry for entry in response.json()["activities"] if entry["action"] == "task.updated")
    assert updated_entry["old_value"]["title"] == "Initial title"
    assert updated_entry["new_value"]["title"] == "Updated title"


def test_user_cannot_see_another_users_task_activity(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    created = client.post("/api/v1/tasks", json={"title": "Owner task"}).json()
    client.post("/api/v1/auth/logout")
    signup_and_login(client, email="other@example.com")

    response = client.get(f"/api/v1/tasks/{created['id']}/activity")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"
