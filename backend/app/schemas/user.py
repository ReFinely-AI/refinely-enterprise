"""
Pydantic schemas for User-related requests and responses.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows ORM model → Pydantic conversion


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for decoded JWT payload."""
    sub: int  # User ID
    exp: datetime
