"""
Authentication routes: register, login, google-oauth, me.
"""

import secrets
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, GoogleAuthRequest
from app.api.deps import get_current_user

router = APIRouter()

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and receive JWT token."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Google-only accounts have no password
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google Sign-In. Please continue with Google."
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.post("/google", response_model=Token)
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate or register a user via Google OAuth access token."""

    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured on this server."
        )

    # Verify the access token with Google and fetch user info
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {body.access_token}"},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token."
        )

    userinfo = response.json()
    google_id: str = userinfo.get("id", "")
    email: str = userinfo.get("email", "")
    full_name: str = userinfo.get("name", "")
    avatar_url: str = userinfo.get("picture", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not have a verified email."
        )

    # Try to find user by google_id first, then fall back to email
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if user:
        # Link Google account to existing user if not already linked
        needs_update = False
        if not user.google_id:
            user.google_id = google_id
            needs_update = True
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url
            needs_update = True
        if needs_update:
            await db.commit()
            await db.refresh(user)
    else:
        # Create a new user from Google account
        user = User(
            email=email,
            full_name=full_name,
            google_id=google_id,
            avatar_url=avatar_url,
            hashed_password=None,  # Google-only account, no password
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive."
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current logged-in user's profile."""
    return current_user
