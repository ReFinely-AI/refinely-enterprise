from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
from urllib.parse import urlparse, urlunparse


_CLOUD_HOSTS = ("neon.tech", ".render.com", "railway.app", "fly.dev")


class Settings(BaseSettings):

    APP_NAME: str = "ReFinely API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Individual DB fields (local dev)
    DB_USER: str = "refinely_user"
    DB_PASSWORD: str = "refinely_secret"
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "refinely_db"

    # Full URL override — set by cloud platforms (Neon/Railway/Render)
    DATABASE_URL: Optional[str] = None

    @property
    def SYNC_DB_URL(self) -> str:
        url = self.DATABASE_URL or (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )
        # Normalize scheme
        url = url.replace("postgres://", "postgresql://", 1)
        url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
        return url

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        # Switch to asyncpg driver and STRIP ALL query params.
        # SSL and auth params are handled via connect_args in database.py
        # so they never get mixed into the database name (Neon includes
        # channel_binding=require in its URL which confuses asyncpg).
        url = self.SYNC_DB_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        parsed = urlparse(url)
        return urlunparse(parsed._replace(query=""))

    @property
    def needs_ssl(self) -> bool:
        raw = self.DATABASE_URL or self.SYNC_DB_URL
        return any(h in raw for h in _CLOUD_HOSTS)

    # CORS — comma-separated; extend via ALLOWED_ORIGINS env var in production
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"

    @property
    def cors_origins(self) -> list:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
