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


def create_task(client: TestClient, *, title: str, **overrides: object) -> dict:
    payload = {
        "title": title,
        "description": "Task description",
        "status": "pending",
        "priority": "medium",
    }
    payload.update(overrides)
    response = client.post("/api/v1/tasks", json=payload)
    return response.json()


def test_unauthenticated_user_cannot_create_task(client: TestClient) -> None:
    response = client.post("/api/v1/tasks", json={"title": "New Task"})

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_authenticated_user_can_create_task(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")

    response = client.post(
        "/api/v1/tasks",
        json={"title": "New Task", "description": "Desc", "priority": "high"},
    )

    assert response.status_code == 201
    assert response.json()["title"] == "New Task"
    assert response.json()["priority"] == "high"


def test_missing_title_returns_validation_error(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")

    response = client.post("/api/v1/tasks", json={"description": "Desc"})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_user_can_list_own_tasks(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    client.post("/api/v1/tasks", json={"title": "First Task"})
    client.post("/api/v1/tasks", json={"title": "Second Task"})

    response = client.get("/api/v1/tasks")

    assert response.status_code == 200
    assert len(response.json()["tasks"]) == 2
    assert response.json()["meta"]["total"] == 2


def test_user_cannot_fetch_another_users_task(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    created = client.post("/api/v1/tasks", json={"title": "Owner Task"}).json()
    client.post("/api/v1/auth/logout")
    signup_and_login(client, email="other@example.com")

    response = client.get(f"/api/v1/tasks/{created['id']}")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_user_cannot_update_another_users_task(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    created = client.post("/api/v1/tasks", json={"title": "Owner Task"}).json()
    client.post("/api/v1/auth/logout")
    signup_and_login(client, email="other@example.com")

    response = client.patch(f"/api/v1/tasks/{created['id']}", json={"title": "Changed"})

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_user_cannot_delete_another_users_task(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    created = client.post("/api/v1/tasks", json={"title": "Owner Task"}).json()
    client.post("/api/v1/auth/logout")
    signup_and_login(client, email="other@example.com")

    response = client.delete(f"/api/v1/tasks/{created['id']}")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_status_filter_works(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    client.post("/api/v1/tasks", json={"title": "Pending Task", "status": "pending"})
    client.post("/api/v1/tasks", json={"title": "Done Task", "status": "completed"})

    response = client.get("/api/v1/tasks", params={"status": "completed"})

    assert response.status_code == 200
    assert [task["title"] for task in response.json()["tasks"]] == ["Done Task"]


def test_search_works(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    client.post("/api/v1/tasks", json={"title": "Buy groceries"})
    client.post("/api/v1/tasks", json={"title": "Plan sprint"})

    response = client.get("/api/v1/tasks", params={"search": "grocer"})

    assert response.status_code == 200
    assert [task["title"] for task in response.json()["tasks"]] == ["Buy groceries"]


def test_pagination_works(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    for index in range(3):
        client.post("/api/v1/tasks", json={"title": f"Task {index}"})

    response = client.get("/api/v1/tasks", params={"page": 2, "limit": 2, "sortBy": "created_at", "sortOrder": "asc"})

    assert response.status_code == 200
    assert len(response.json()["tasks"]) == 1
    assert response.json()["meta"] == {
        "page": 2,
        "limit": 2,
        "total": 3,
        "total_pages": 2,
    }


def test_invalid_query_params_return_400(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")

    response = client.get("/api/v1/tasks", params={"page": "abc"})

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_QUERY_PARAMS"


def test_priority_sorting_works(client: TestClient) -> None:
    signup_and_login(client, email="owner@example.com")
    client.post("/api/v1/tasks", json={"title": "Low Task", "priority": "low"})
    client.post("/api/v1/tasks", json={"title": "High Task", "priority": "high"})
    client.post("/api/v1/tasks", json={"title": "Medium Task", "priority": "medium"})

    response = client.get("/api/v1/tasks", params={"sortBy": "priority", "sortOrder": "desc"})

    assert response.status_code == 200
    assert [task["title"] for task in response.json()["tasks"]] == [
        "High Task",
        "Medium Task",
        "Low Task",
    ]
