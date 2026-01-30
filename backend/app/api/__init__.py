from fastapi import APIRouter

from app.api.routes import auth, organizations, reconciliations as api_reconciliations

api_router = APIRouter()

# Authentication and orgs
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])

# Existing reconciliation routes (bank-accounts, uploads, create/get)
api_router.include_router(
    api_reconciliations.router,
    prefix="/reconciliations",
    tags=["Reconciliations"],
)

