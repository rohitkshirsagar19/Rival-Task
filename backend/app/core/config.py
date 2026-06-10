from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.constants import DEFAULT_FRONTEND_ORIGIN, SERVICE_NAME


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = SERVICE_NAME
    frontend_origin: str = DEFAULT_FRONTEND_ORIGIN


settings = Settings()

