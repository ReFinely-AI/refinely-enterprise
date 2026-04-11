from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.copilot import ChatRequest, ChatResponse
from app.services.copilot_agent import get_copilot_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Chat with the ReFinely LLM Copilot about a specific reconciliation."""
    try:
        response = await get_copilot_response(
            db=db, 
            reconciliation_id=request.reconciliation_id, 
            user_message=request.message
        )
        return ChatResponse(**response)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Copilot engine failed: {str(e)}"
        )