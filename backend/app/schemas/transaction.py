
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from decimal import Decimal

class BankTransactionRead(BaseModel):
    id: int
    reconciliation_id: int
    transaction_date: date
    description: Optional[str]
    reference: Optional[str]
    amount: Decimal
    balance: Optional[Decimal]
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
    debit: Decimal
    credit: Decimal
    is_matched: bool
    created_at: datetime

    class Config:
        from_attributes = True
