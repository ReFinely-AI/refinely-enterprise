from datetime import date
from typing import List, Dict, Any, Tuple
from difflib import SequenceMatcher

from app.models.transaction import BankTransaction, LedgerTransaction


AMOUNT_TOLERANCE_PERCENT = 0.01      # 1%
DATE_TOLERANCE_DAYS = 3
DESC_FUZZY_THRESHOLD = 0.90          # high precision for finance


def _amount_close(a: float, b: float) -> bool:
    if b == 0:
        return False
    return abs(float(a) - float(b)) / abs(float(b)) <= AMOUNT_TOLERANCE_PERCENT


def _date_close(a: date, b: date) -> bool:
    return abs((a - b).days) <= DATE_TOLERANCE_DAYS


def _desc_similarity(a: str | None, b: str | None) -> float:
    a = (a or "").lower().strip()
    b = (b or "").lower().strip()
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()  # 0–1


def run_matching(
    reconciliation_id: int,
    bank_transactions: List[BankTransaction],
    ledger_transactions: List[LedgerTransaction],
) -> Tuple[List[Dict[str, Any]], List[int], List[int]]:
    """
    Returns:
      matches: list of dicts with fields for MatchCreate
      unmatched_bank_ids: ids of bank tx with no match
      unmatched_ledger_ids: ids of ledger tx never used
    """

    used_ledger_ids = set()
    used_bank_ids = set() 
    matches: List[Dict[str, Any]] = []

    
    # 1. Build the lookup dictionary from ledger transactions
    ledger_map = {}
    for l in ledger_transactions:
        l_amount = getattr(l, "amount", (l.debit or 0) - (l.credit or 0))
        key = (l_amount, l.transaction_date)
        if key not in ledger_map:
            ledger_map[key] = []
        ledger_map[key].append(l)

    # 2. Fast single loop through bank transactions
    for b in bank_transactions:
        key = (b.amount, b.transaction_date)
        
        # Instant dictionary lookup
        if key in ledger_map and ledger_map[key]:
            l = ledger_map[key].pop(0) # Take the first matching ledger item
            
            matches.append(
                {
                    "reconciliation_id": reconciliation_id,
                    "bank_transaction_id": b.id,
                    "ledger_transaction_id": l.id,
                    "match_type": "exact",
                    "confidence": 1.0,
                    "audit_trail": {
                        "rule": "exact_amount_date",
                        "bank_amount": float(b.amount),
                        "ledger_amount": float(key[0]),
                        "bank_date": b.transaction_date.isoformat(),
                        "ledger_date": l.transaction_date.isoformat(),
                    },
                }
            )
            used_ledger_ids.add(l.id)
            used_bank_ids.add(b.id)

    # Phase 2: FUZZY AMOUNT + DATE 
    for b in bank_transactions:
        # INSTANT check instead of slow inner loop
        if b.id in used_bank_ids: 
            continue
            
        for l in ledger_transactions:
            if l.id in used_ledger_ids:
                continue
                
            ledger_amount = getattr(l, "amount", (l.debit or 0) - (l.credit or 0))
            if _amount_close(b.amount, ledger_amount) and _date_close(b.transaction_date, l.transaction_date):
                matches.append(
                    {
                        "reconciliation_id": reconciliation_id,
                        "bank_transaction_id": b.id,
                        "ledger_transaction_id": l.id,
                        "match_type": "fuzzy_amount",
                        "confidence": 0.95,
                        "audit_trail": {
                            "rule": "fuzzy_amount_date",
                            "amount_tolerance_percent": AMOUNT_TOLERANCE_PERCENT,
                            "bank_amount": float(b.amount),
                            "ledger_amount": float(ledger_amount),
                            "bank_date": b.transaction_date.isoformat(),
                            "ledger_date": l.transaction_date.isoformat(),
                        },
                    }
                )
                used_ledger_ids.add(l.id)
                used_bank_ids.add(b.id)
                break

    # Phase 3: FUZZY DESCRIPTION

    for b in bank_transactions:
        if b.id in used_bank_ids:
            continue

        best_l = None
        best_score = 0.0

        for l in ledger_transactions:
            if l.id in used_ledger_ids:
                continue
            score = _desc_similarity(b.description, l.description)
            if score > best_score:
                best_score = score
                best_l = l

        if best_l and best_score >= DESC_FUZZY_THRESHOLD:
            ledger_amount = getattr(best_l, "amount", (best_l.debit or 0) - (best_l.credit or 0))
            matches.append(
                {
                    "reconciliation_id": reconciliation_id,
                    "bank_transaction_id": b.id,
                    "ledger_transaction_id": best_l.id,
                    "match_type": "fuzzy_desc",
                    "confidence": float(best_score),
                    "audit_trail": {
                        "rule": "fuzzy_description",
                        "threshold": DESC_FUZZY_THRESHOLD,
                        "similarity": best_score,
                        "bank_description": b.description,
                        "ledger_description": best_l.description,
                        "bank_amount": float(b.amount),
                        "ledger_amount": float(ledger_amount),
                    },
                }
            )
            used_ledger_ids.add(best_l.id)
            used_bank_ids.add(b.id)

    bank_ids = {b.id for b in bank_transactions}
    ledger_ids = {l.id for l in ledger_transactions}

    unmatched_bank_ids = list(bank_ids - used_bank_ids)
    unmatched_ledger_ids = list(ledger_ids - used_ledger_ids)

    return matches, unmatched_bank_ids, unmatched_ledger_ids