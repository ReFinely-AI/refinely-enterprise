"""
Database connection and session management.
Uses SQLAlchemy with async support.
"""

import ssl as _ssl_module
import asyncpg as _asyncpg
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Safety net: asyncpg.connect() does not accept 'channel_binding' but
# SQLAlchemy 2.0.35+ may pass it. Strip it before it reaches asyncpg.
_orig_connect = _asyncpg.connect

async def _safe_connect(*args, **kwargs):
    kwargs.pop("channel_binding", None)
    return await _orig_connect(*args, **kwargs)

_asyncpg.connect = _safe_connect


engine = create_engine(settings.SYNC_DB_URL, echo=settings.DEBUG)

# ASYNC_DATABASE_URL has no query params (stripped in config.py).
# SSL is passed as a proper SSLContext object via connect_args.
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    connect_args={"ssl": _ssl_module.create_default_context()} if settings.needs_ssl else {},
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
