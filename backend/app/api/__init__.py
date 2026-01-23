from fastapi import APIRouter
from app.api.routes import auth, organizations, reconciliations

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
api_router.include_router(reconciliations.router, prefix="/reconciliations", tags=["Reconciliations"])
