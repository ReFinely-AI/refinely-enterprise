# backend/app/routers/reconciliations.py
from typing import List, Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.transaction import (
    Reconciliation,
    BankAccount,
    BankTransaction,
    LedgerTransaction,
    Match,
)
from app.schemas.reconciliation import (
    ReconciliationCreate,
    ReconciliationResponse,
)
from app.schemas.transaction import (
    BankTransactionRead,
    LedgerTransactionRead,
)
from app.schemas.match import MatchRead
from app.services.matching_engine import run_matching


router = APIRouter(
    prefix="/reconciliations",
    tags=["reconciliations"],
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_reconciliation_or_404(
    db: Session,
    reconciliation_id: int,
    user_id: int,
) -> Reconciliation:
    rec = (
        db.query(Reconciliation)
        .join(BankAccount, BankAccount.id == Reconciliation.bank_account_id)
        .filter(
            Reconciliation.id == reconciliation_id,
            Reconciliation.created_by_id == user_id,
        )
        .first()
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reconciliation not found",
        )
    return rec


# ---------------------------------------------------------------------------
# CRUD: list, get, create
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[ReconciliationResponse])
def list_reconciliations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[Reconciliation]:
    recs = (
        db.query(Reconciliation)
        .filter(Reconciliation.created_by_id == current_user.id)
        .order_by(Reconciliation.created_at.desc())
        .all()
    )
    return recs


@router.get("/{reconciliation_id}", response_model=ReconciliationResponse)
def get_reconciliation(
    reconciliation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> Reconciliation:
    rec = _get_reconciliation_or_404(db, reconciliation_id, current_user.id)
    return rec


@router.post(
    "/",
    response_model=ReconciliationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reconciliation(
    payload: ReconciliationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> Reconciliation:
    bank_account = (
        db.query(BankAccount)
        .filter(
            BankAccount.id == payload.bank_account_id,
            BankAccount.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not bank_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bank account not found or not accessible",
        )

    rec = Reconciliation(
        bank_account_id=payload.bank_account_id,
        created_by_id=current_user.id,
        period_start=payload.period_start,
        period_end=payload.period_end,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# ---------------------------------------------------------------------------
# Transactions for a reconciliation (for frontend detail view)
# ---------------------------------------------------------------------------

@router.get("/{reconciliation_id}/transactions", response_model=Dict[str, List[Any]])
def get_reconciliation_transactions(
    reconciliation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> Dict[str, List[Any]]:
    rec = _get_reconciliation_or_404(db, reconciliation_id, current_user.id)

    bank_txs = (
        db.query(BankTransaction)
        .filter(BankTransaction.reconciliation_id == rec.id)
        .order_by(BankTransaction.transaction_date.asc())
        .all()
    )
    ledger_txs = (
        db.query(LedgerTransaction)
        .filter(LedgerTransaction.reconciliation_id == rec.id)
        .order_by(LedgerTransaction.transaction_date.asc())
        .all()
    )

    return {
        "reconciliation_id": rec.id,
        "bank_transactions": [BankTransactionRead.from_orm(tx) for tx in bank_txs],
        "ledger_transactions": [LedgerTransactionRead.from_orm(tx) for tx in ledger_txs],
    }


# ---------------------------------------------------------------------------
# MATCHING ENGINE – CORE ENDPOINT
# ---------------------------------------------------------------------------

@router.post("/{reconciliation_id}/match", response_model=Dict[str, Any])
def run_reconciliation_matching(
    reconciliation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> Dict[str, Any]:
    rec = _get_reconciliation_or_404(db, reconciliation_id, current_user.id)

    bank_txs: List[BankTransaction] = (
        db.query(BankTransaction)
        .filter(BankTransaction.reconciliation_id == rec.id)
        .all()
    )
    ledger_txs: List[LedgerTransaction] = (
        db.query(LedgerTransaction)
        .filter(LedgerTransaction.reconciliation_id == rec.id)
        .all()
    )

    if not bank_txs or not ledger_txs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both bank and ledger transactions are required to run matching.",
        )

    rec.total_bank_transactions = len(bank_txs)
    rec.total_ledger_transactions = len(ledger_txs)

    # Clear old matches
    db.query(Match).filter(Match.reconciliation_id == rec.id).delete()

    # Run engine
    match_dicts, unmatched_bank_ids, unmatched_ledger_ids = run_matching(
        reconciliation_id=rec.id,
        bank_transactions=bank_txs,
        ledger_transactions=ledger_txs,
    )

    match_models: List[Match] = []
    for m in match_dicts:
        match_models.append(
            Match(
                reconciliation_id=rec.id,
                bank_transaction_id=m["bank_transaction_id"],
                ledger_transaction_id=m["ledger_transaction_id"],
                match_type=m["match_type"],
                confidence_score=m["confidence"],
                audit_trail=m["audit_trail"],
            )
        )

    db.add_all(match_models)

    rec.matched_count = len(match_models)
    rec.unmatched_bank_count = len(unmatched_bank_ids)
    rec.unmatched_ledger_count = len(unmatched_ledger_ids)

    db.commit()
    db.refresh(rec)

    return {
        "reconciliation_id": rec.id,
        "matched_count": rec.matched_count,
        "unmatched_bank_count": rec.unmatched_bank_count,
        "unmatched_ledger_count": rec.unmatched_ledger_count,
        "matches": [MatchRead.from_orm(m) for m in match_models],
        "unmatched_bank_ids": unmatched_bank_ids,
        "unmatched_ledger_ids": unmatched_ledger_ids,
    }


# ---------------------------------------------------------------------------
# Get matches for a reconciliation
# ---------------------------------------------------------------------------

@router.get("/{reconciliation_id}/matches", response_model=List[MatchRead])
def get_reconciliation_matches(
    reconciliation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> List[Match]:
    rec = _get_reconciliation_or_404(db, reconciliation_id, current_user.id)
    matches = (
        db.query(Match)
        .filter(Match.reconciliation_id == rec.id)
        .order_by(Match.created_at.asc())
        .all()
    )
    return matches
