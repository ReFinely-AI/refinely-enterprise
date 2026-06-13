"""
Database connection and session management.
Uses SQLAlchemy with async support.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.SYNC_DB_URL, echo=settings.DEBUG)

# Pass SSL via connect_args rather than the URL query string — asyncpg
# doesn't accept ssl as a URL param reliably across SQLAlchemy versions.
_cloud_hosts = ("neon.tech", ".render.com", "railway.app", "fly.dev")
_needs_ssl = any(h in settings.ASYNC_DATABASE_URL for h in _cloud_hosts)
_connect_args = {"ssl": "require"} if _needs_ssl else {}

# Strip ssl/sslmode params from the URL itself to avoid double-handling
_async_url = settings.ASYNC_DATABASE_URL
for _param in ("?ssl=require", "&ssl=require", "?sslmode=require", "&sslmode=require"):
    _async_url = _async_url.replace(_param, "")

async_engine = create_async_engine(
    _async_url,
    echo=settings.DEBUG,
    future=True,
    connect_args=_connect_args,
)


AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency that provides a database session.
    Used in FastAPI routes with Depends(get_db).
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
