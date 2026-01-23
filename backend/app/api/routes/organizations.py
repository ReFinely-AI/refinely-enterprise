"""
Organization management routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.organization import Organization, Membership, MemberRole
from app.schemas.organization import OrganizationCreate, OrganizationResponse
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new organization. Creator becomes admin."""
    
    # Create organization
    new_org = Organization(
        name=org_data.name,
        currency=org_data.currency
    )
    db.add(new_org)
    await db.flush()  # Get the ID before committing
    
    # Add creator as admin member
    membership = Membership(
        user_id=current_user.id,
        organization_id=new_org.id,
        role=MemberRole.ADMIN
    )
    db.add(membership)
    
    await db.commit()
    await db.refresh(new_org)
    
    return new_org


@router.get("/", response_model=List[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all organizations the current user belongs to."""
    
    result = await db.execute(
        select(Organization)
        .join(Membership)
        .where(Membership.user_id == current_user.id)
    )
    organizations = result.scalars().all()
    
    return organizations


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific organization (must be a member)."""
    
    # Check membership
    result = await db.execute(
        select(Membership)
        .where(Membership.user_id == current_user.id)
        .where(Membership.organization_id == org_id)
    )
    membership = result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization"
        )
    
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return org
