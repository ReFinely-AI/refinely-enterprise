from fastapi import APIRouter

from app.api.routes import auth, organizations, reconciliations as api_reconciliations
from app.api.routes import copilot
api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])


api_router.include_router(
    api_reconciliations.router,
    prefix="/reconciliations",
    tags=["Reconciliations"],
)
api_router.include_router(copilot.router, prefix="/copilot", tags=["AI Copilot"])
