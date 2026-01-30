"""
Core reconciliation models: BankAccount, Reconciliation, Transactions, Anomalies.
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Date,
    Enum,
    Text,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ReconciliationStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class AnomalySeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class AnomalyType(str, enum.Enum):
    DUPLICATE = "duplicate"
    MISSING = "missing"
    TIMING_DIFFERENCE = "timing_difference"
    AMOUNT_OUTLIER = "amount_outlier"
    SUSPICIOUS_PATTERN = "suspicious_pattern"


class BankAccount(Base):
    """Represents a bank account being reconciled."""
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(
        Integer,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    account_name = Column(String(255), nullable=False)
    account_number = Column(String(50), nullable=True)
    bank_name = Column(String(255), nullable=True)
    currency = Column(String(10), default="PKR")
    date_tolerance_days = Column(Integer, default=3)  # For fuzzy date matching
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organization = relationship("Organization", back_populates="bank_accounts")
    reconciliations = relationship(
        "Reconciliation",
        back_populates="bank_account",
        cascade="all, delete-orphan",
    )


class Reconciliation(Base):
    """A reconciliation session for a specific period."""
    __tablename__ = "reconciliations"

    id = Column(Integer, primary_key=True, index=True)
    bank_account_id = Column(
        Integer,
        ForeignKey("bank_accounts.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    status = Column(Enum(ReconciliationStatus), default=ReconciliationStatus.PENDING)

    # Summary stats (populated after processing)
    total_bank_transactions = Column(Integer, default=0)
    total_ledger_transactions = Column(Integer, default=0)
    matched_count = Column(Integer, default=0)
    unmatched_bank_count = Column(Integer, default=0)
    unmatched_ledger_count = Column(Integer, default=0)
    anomaly_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    bank_account = relationship("BankAccount", back_populates="reconciliations")
    created_by = relationship("User")
    bank_transactions = relationship(
        "BankTransaction",
        back_populates="reconciliation",
        cascade="all, delete-orphan",
    )
    ledger_transactions = relationship(
        "LedgerTransaction",
        back_populates="reconciliation",
        cascade="all, delete-orphan",
    )
    matches = relationship(
        "Match",
        back_populates="reconciliation",
        cascade="all, delete-orphan",
    )
    anomalies = relationship(
        "Anomaly",
        back_populates="reconciliation",
        cascade="all, delete-orphan",
    )


class BankTransaction(Base):
    """A single transaction from the bank statement."""
    __tablename__ = "bank_transactions"

    id = Column(Integer, primary_key=True, index=True)
    reconciliation_id = Column(
        Integer,
        ForeignKey("reconciliations.id", ondelete="CASCADE"),
        nullable=False,
    )

    transaction_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    reference = Column(String(100), nullable=True)
    amount = Column(Float, nullable=False)  # Positive = credit, Negative = debit
    balance = Column(Float, nullable=True)

    # Matching status
    is_matched = Column(Boolean, default=False)

    # Original row data (for debugging)
    raw_data = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reconciliation = relationship("Reconciliation", back_populates="bank_transactions")
    matches_as_bank = relationship(
        "Match",
        back_populates="bank_transaction",
        cascade="all, delete-orphan",
    )


class LedgerTransaction(Base):
    """A single transaction from the internal ledger/accounting system."""
    __tablename__ = "ledger_transactions"

    id = Column(Integer, primary_key=True, index=True)
    reconciliation_id = Column(
        Integer,
        ForeignKey("reconciliations.id", ondelete="CASCADE"),
        nullable=False,
    )

    transaction_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    reference = Column(String(100), nullable=True)
    account_code = Column(String(50), nullable=True)
    debit = Column(Float, default=0)
    credit = Column(Float, default=0)

    @property
    def amount(self) -> float:
        """Net amount (credit - debit for cash account perspective)."""
        return self.credit - self.debit

    # Matching status
    is_matched = Column(Boolean, default=False)

    # Original row data
    raw_data = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reconciliation = relationship("Reconciliation", back_populates="ledger_transactions")
    matches_as_ledger = relationship(
        "Match",
        back_populates="ledger_transaction",
        cascade="all, delete-orphan",
    )



class Anomaly(Base):
    """Records detected anomalies or suspicious patterns."""
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    reconciliation_id = Column(
        Integer,
        ForeignKey("reconciliations.id", ondelete="CASCADE"),
        nullable=False,
    )

    anomaly_type = Column(Enum(AnomalyType), nullable=False)
    severity = Column(Enum(AnomalySeverity), default=AnomalySeverity.MEDIUM)

    # Reference to affected transaction(s)
    bank_transaction_id = Column(Integer, ForeignKey("bank_transactions.id"), nullable=True)
    ledger_transaction_id = Column(Integer, ForeignKey("ledger_transactions.id"), nullable=True)

    # Explanation
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)

    # Resolution
    is_resolved = Column(Boolean, default=False)
    resolved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolution_note = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    reconciliation = relationship("Reconciliation", back_populates="anomalies")
    bank_transaction = relationship("BankTransaction")
    ledger_transaction = relationship("LedgerTransaction")
