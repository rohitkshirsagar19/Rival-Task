from app.core.config import Settings, settings
from app.core.constants import DEFAULT_DATABASE_URL
from app.db.base import Base
from app.db.session import SessionLocal, engine


def test_database_url_loads_from_settings() -> None:
    assert settings.database_url == DEFAULT_DATABASE_URL


def test_database_url_can_be_overridden() -> None:
    custom_settings = Settings(database_url="postgresql+psycopg2://custom")

    assert custom_settings.database_url == "postgresql+psycopg2://custom"


def test_sqlalchemy_session_is_configured() -> None:
    session = SessionLocal()

    try:
        assert session.bind is engine
    finally:
        session.close()


def test_sqlalchemy_base_metadata_exists() -> None:
    assert Base.metadata is not None
