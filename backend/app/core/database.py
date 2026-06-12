"""
Database connection and session management.
Uses SQLAlchemy with async support.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.SYNC_DB_URL, echo=settings.DEBUG)

async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    future=True
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
