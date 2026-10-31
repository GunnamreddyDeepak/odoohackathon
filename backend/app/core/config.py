from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    APP_NAME: str = "Brightloop Subscription Management System"
    APP_ENV: str = "development"
    DEBUG: bool = True

    DB_USER: str = "postgres.ecjvmxaoyknzxqpzmzab"
    DB_PASSWORD: str = ""
    DB_HOST: str = "aws-0-ap-northeast-2.pooler.supabase.com"
    DB_PORT: int = 5432
    DB_NAME: str = "postgres"

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore",
    )


settings = Settings()