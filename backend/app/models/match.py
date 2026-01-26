# backend/app/models/match.py
from sqlalchemy import Column, Integer, Float, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import Base  # adjust import to your project (maybe from ..database import Base)

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    reconciliation_id = Column(Integer, ForeignKey("reconciliations.id", ondelete="CASCADE"), index=True)

    bank_transaction_id = Column(Integer, ForeignKey("bank_transactions.id", ondelete="CASCADE"), index=True)
    ledger_transaction_id = Column(Integer, ForeignKey("ledger_transactions.id", ondelete="CASCADE"), index=True)

    match_type = Column(String, nullable=False)          # "exact", "fuzzy_amount", "fuzzy_desc"
    confidence = Column(Float, nullable=False)           # 0.0–1.0
    audit_trail = Column(JSON, nullable=False)           # rule details, thresholds used

    bank_transaction = relationship("BankTransaction", back_populates="matches_as_bank")
    ledger_transaction = relationship("LedgerTransaction", back_populates="matches_as_ledger")
    reconciliation = relationship("Reconciliation", back_populates="matches")
