"""
Organization and Membership models.
Supports multi-tenant architecture where users belong to organizations.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class MemberRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"


class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    currency = Column(String(10), default="PKR")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    memberships = relationship("Membership", back_populates="organization", cascade="all, delete-orphan")
    bank_accounts = relationship("BankAccount", back_populates="organization", cascade="all, delete-orphan")


class Membership(Base):
    """
    Junction table linking users to organizations with roles.
    A user can belong to multiple organizations.
    """
    __tablename__ = "memberships"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(MemberRole), default=MemberRole.MEMBER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="memberships")
    organization = relationship("Organization", back_populates="memberships")
