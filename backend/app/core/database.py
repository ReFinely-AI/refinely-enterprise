"""
Database connection and session management.
Uses SQLAlchemy with async support.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Sync engine (for Alembic migrations)
engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)

# Async engine (for FastAPI endpoints)
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Async session factory
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for all models
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
