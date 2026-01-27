# backend/app/models/match.py
from sqlalchemy import Column, Integer, Float, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base  # adjust if your Base is elsewhere


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    reconciliation_id = Column(
        Integer,
        ForeignKey("reconciliations.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    bank_transaction_id = Column(
        Integer,
        ForeignKey("bank_transactions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    ledger_transaction_id = Column(
        Integer,
        ForeignKey("ledger_transactions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    match_type = Column(String, nullable=False)          # "exact", "fuzzy_amount", "fuzzy_desc"
    confidence = Column(Float, nullable=False)           # 0.0–1.0
    audit_trail = Column(JSON, nullable=False)           # rule details, thresholds used

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bank_transaction = relationship("BankTransaction", back_populates="matches_as_bank")
    ledger_transaction = relationship("LedgerTransaction", back_populates="matches_as_ledger")
    reconciliation = relationship("Reconciliation", back_populates="matches")
