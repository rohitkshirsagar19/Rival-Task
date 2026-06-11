from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.constants import (
    DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES,
    DEFAULT_AUTH_ALGORITHM,
    DEFAULT_AUTH_COOKIE_NAME,
    DEFAULT_AUTH_COOKIE_SAMESITE,
    DEFAULT_AUTH_COOKIE_SECURE,
    DEFAULT_AUTH_SECRET_KEY,
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
    auth_secret_key: str = DEFAULT_AUTH_SECRET_KEY
    auth_algorithm: str = DEFAULT_AUTH_ALGORITHM
    access_token_expire_minutes: int = DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES
    auth_cookie_name: str = DEFAULT_AUTH_COOKIE_NAME
    auth_cookie_secure: bool = DEFAULT_AUTH_COOKIE_SECURE
    auth_cookie_samesite: str = DEFAULT_AUTH_COOKIE_SAMESITE


settings = Settings()
