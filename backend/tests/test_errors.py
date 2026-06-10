from fastapi.testclient import TestClient

from app.main import app


def test_custom_api_exception_response() -> None:
    client = TestClient(app)

    response = client.get("/errors/custom")

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "BAD_REQUEST",
            "message": "Custom error triggered",
            "details": {},
        }
    }


def test_validation_error_response() -> None:
    client = TestClient(app)

    response = client.get("/errors/validation", params={"limit": 0})
    payload = response.json()

    assert response.status_code == 422
    assert payload["error"]["code"] == "VALIDATION_ERROR"
    assert payload["error"]["message"] == "Request validation failed"
    assert "errors" in payload["error"]["details"]


def test_unexpected_error_response_hides_stack_trace() -> None:
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/errors/unexpected")

    assert response.status_code == 500
    assert response.json() == {
        "error": {
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
            "details": {},
        }
    }
