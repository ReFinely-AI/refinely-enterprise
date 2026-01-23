"""
Pydantic schemas for Organization-related requests and responses.
"""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class OrganizationCreate(BaseModel):
    """Schema for creating an organization."""
    name: str
    currency: Optional[str] = "PKR"


class OrganizationResponse(BaseModel):
    """Schema for organization data in responses."""
    id: int
    name: str
    currency: str
    created_at: datetime
    
    class Config:
        from_attributes = True
