# backend/app/schemas/match.py
from pydantic import BaseModel
from typing import Any


class MatchBase(BaseModel):
    reconciliation_id: int
    bank_transaction_id: int
    ledger_transaction_id: int
    match_type: str
    confidence: float
    audit_trail: Any


class MatchCreate(MatchBase):
    pass


class MatchRead(MatchBase):
    id: int

    class Config:
        from_attributes = True
