from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.constants import (
    DEFAULT_DATABASE_URL,
    DEFAULT_FRONTEND_ORIGIN,
    SERVICE_NAME,
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = SERVICE_NAME
    frontend_origin: str = DEFAULT_FRONTEND_ORIGIN
    database_url: str = DEFAULT_DATABASE_URL


settings = Settings()
