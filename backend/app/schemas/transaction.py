# backend/app/schemas/transaction.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class BankTransactionRead(BaseModel):
    id: int
    reconciliation_id: int
    transaction_date: date
    description: Optional[str]
    reference: Optional[str]
    amount: float
    balance: Optional[float]
    is_matched: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LedgerTransactionRead(BaseModel):
    id: int
    reconciliation_id: int
    transaction_date: date
    description: Optional[str]
    reference: Optional[str]
    account_code: Optional[str]
    debit: float
    credit: float
    is_matched: bool
    created_at: datetime

    class Config:
        from_attributes = True
