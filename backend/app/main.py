"""
ReFinely API - Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import async_engine, Base
from app.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager.
    Runs on startup and shutdown.
    """
    # Startup: Create database tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Shutdown: Close connections
    await async_engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Agentic AI Financial Reconciliation Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": settings.APP_NAME}
