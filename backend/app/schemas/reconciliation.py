"""
Pydantic schemas for Reconciliation-related requests and responses.
"""

from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List
from app.models.reconciliation import ReconciliationStatus, AnomalySeverity, AnomalyType


class BankAccountCreate(BaseModel):
    account_name: str
    account_number: Optional[str] = None
    bank_name: Optional[str] = None
    currency: Optional[str] = "PKR"
    date_tolerance_days: Optional[int] = 3


class BankAccountResponse(BaseModel):
    id: int
    organization_id: int
    account_name: str
    account_number: Optional[str]
    bank_name: Optional[str]
    currency: str
    date_tolerance_days: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReconciliationCreate(BaseModel):
    bank_account_id: int
    period_start: date
    period_end: date


class ReconciliationSummary(BaseModel):
    total_bank_transactions: int
    total_ledger_transactions: int
    matched_count: int
    unmatched_bank_count: int
    unmatched_ledger_count: int
    anomaly_count: int


class ReconciliationResponse(BaseModel):
    id: int
    bank_account_id: int
    period_start: date
    period_end: date
    status: ReconciliationStatus
    total_bank_transactions: int
    total_ledger_transactions: int
    matched_count: int
    unmatched_bank_count: int
    unmatched_ledger_count: int
    anomaly_count: int
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    message: str
    rows_parsed: int
    file_type: str  # "bank" or "ledger"


class ColumnMapping(BaseModel):
    """Schema for mapping CSV/Excel columns to expected fields."""
    date_column: str
    amount_column: str
    description_column: Optional[str] = None
    reference_column: Optional[str] = None
    balance_column: Optional[str] = None
    # For ledger files
    debit_column: Optional[str] = None
    credit_column: Optional[str] = None
    account_code_column: Optional[str] = None
