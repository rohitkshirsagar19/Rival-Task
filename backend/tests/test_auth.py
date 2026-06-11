from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db
from app.db.base import Base
from app.main import app
from app.models.user import User


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_signup_creates_user_and_hashes_password(
    client: TestClient, db_session: Session
) -> None:
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Riku",
            "email": "riku@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 201
    assert "password_hash" not in response.text

    user = db_session.scalar(select(User).where(User.email == "riku@example.com"))
    assert user is not None
    assert user.password_hash != "password123"
    assert user.role == "user"


def test_duplicate_email_returns_409(client: TestClient) -> None:
    payload = {
        "name": "Riku",
        "email": "riku@example.com",
        "password": "password123",
    }

    first_response = client.post("/api/v1/auth/signup", json=payload)
    second_response = client.post("/api/v1/auth/signup", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json()["error"]["code"] == "DUPLICATE_EMAIL"


def test_login_works_with_valid_credentials(client: TestClient) -> None:
    signup_payload = {
        "name": "Riku",
        "email": "riku@example.com",
        "password": "password123",
    }
    client.post("/api/v1/auth/signup", json=signup_payload)

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "riku@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    assert "taskflow_access_token" in response.cookies
    assert response.json()["user"]["email"] == "riku@example.com"


def test_login_fails_with_invalid_password(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Riku",
            "email": "riku@example.com",
            "password": "password123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "riku@example.com", "password": "wrongpass123"},
    )

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_me_returns_user_when_authenticated(client: TestClient) -> None:
    client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Riku",
            "email": "riku@example.com",
            "password": "password123",
        },
    )
    client.post(
        "/api/v1/auth/login",
        json={"email": "riku@example.com", "password": "password123"},
    )

    response = client.get("/api/v1/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "riku@example.com"


def test_me_returns_401_when_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"
