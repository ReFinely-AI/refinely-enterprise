from pydantic import BaseModel
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    reconciliation_id: int
    message: str

class ChatResponse(BaseModel):
    message: str
    suggested_action: Optional[Dict[str, Any]] = None