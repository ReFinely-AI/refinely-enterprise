# backend/app/services/anomaly_agent.py
import numpy as np
from typing import List, Dict, Any
from sklearn.ensemble import IsolationForest

from app.models.transaction import BankTransaction, LedgerTransaction
from app.models.reconciliation import AnomalyType, AnomalySeverity

# --- CONFIGURATION THRESHOLDS ---
TIMING_TOLERANCE_DAYS = 5        
HIGH_VALUE_THRESHOLD = 5000.00   
MIN_TRANSACTIONS_FOR_ML = 50     # Guardrail: Prevent Cold Start


def run_anomaly_detection(
    reconciliation_id: int,
    bank_transactions: List[BankTransaction],
    ledger_transactions: List[LedgerTransaction],
    matches: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Hybrid Anomaly Detection: Runs deterministic rules first, 
    followed by an Isolation Forest ML model for statistical outliers.
    """
    anomalies: List[Dict[str, Any]] = []

    # =========================================================
    # PHASE 1: DETERMINISTIC RULES (Fast & Exact)
    # =========================================================
    
    # 1. Detect Duplicates in Ledger
    seen_ledger = {}
    for l in ledger_transactions:
        amount = float(getattr(l, "amount", (l.credit or 0) - (l.debit or 0)))
        desc = (l.description or "").lower().strip()
        key = (amount, l.transaction_date, desc)
        
        if key in seen_ledger:
            orig_tx = seen_ledger[key]
            anomalies.append({
                "reconciliation_id": reconciliation_id,
                "anomaly_type": AnomalyType.DUPLICATE,
                "severity": AnomalySeverity.MEDIUM,
                "ledger_transaction_id": l.id,
                "title": "Possible Duplicate Ledger Entry",
                "description": f"Matches entry #{orig_tx.id} exactly: Amount {amount} on {l.transaction_date}.",
                "suggested_action": "Verify if this was accidentally entered twice.",
            })
        else:
            seen_ledger[key] = l

    # 2. Detect Timing Differences
    bank_map = {b.id: b for b in bank_transactions}
    ledger_map = {l.id: l for l in ledger_transactions}

    for match in matches:
        b_tx = bank_map.get(match["bank_transaction_id"])
        l_tx = ledger_map.get(match["ledger_transaction_id"])
        
        if b_tx and l_tx:
            day_diff = abs((b_tx.transaction_date - l_tx.transaction_date).days)
            if day_diff > TIMING_TOLERANCE_DAYS:
                severity = AnomalySeverity.HIGH if day_diff > 14 else AnomalySeverity.MEDIUM
                anomalies.append({
                    "reconciliation_id": reconciliation_id,
                    "anomaly_type": AnomalyType.TIMING_DIFFERENCE,
                    "severity": severity,
                    "bank_transaction_id": b_tx.id,
                    "ledger_transaction_id": l_tx.id,
                    "title": f"Timing Gap of {day_diff} Days",
                    "description": f"Bank: {b_tx.transaction_date} | Ledger: {l_tx.transaction_date}.",
                    "suggested_action": "Ensure the transaction wasn't posted to the wrong financial period.",
                })

    # 3. Detect Missing High-Value Transactions
    matched_bank_ids = {m["bank_transaction_id"] for m in matches}
    high_value_flagged_ids = set()
    
    for b in bank_transactions:
        if b.id not in matched_bank_ids and abs(float(b.amount)) > HIGH_VALUE_THRESHOLD:
            high_value_flagged_ids.add(b.id)
            anomalies.append({
                "reconciliation_id": reconciliation_id,
                "anomaly_type": AnomalyType.MISSING,
                "severity": AnomalySeverity.HIGH,
                "bank_transaction_id": b.id,
                "title": "Unmatched High-Value Transaction",
                "description": f"A large bank movement of {float(b.amount)} is missing from the ledger.",
                "suggested_action": "Investigate immediately for unrecorded withdrawals or potential fraud.",
            })

    # =========================================================
    # PHASE 2: MACHINE LEARNING (Isolation Forest)
    # =========================================================
    
    # Guardrail: Only run ML if we have enough data to establish a baseline
    if len(bank_transactions) >= MIN_TRANSACTIONS_FOR_ML:
        
        features = []
        ml_tx_mapping = []
        
        # Extract features
        for b in bank_transactions:
            # Skip transactions already flagged as high-value missing to avoid duplicate alerts
            if b.id in high_value_flagged_ids:
                continue
                
            features.append([abs(float(b.amount)), b.transaction_date.day])
            ml_tx_mapping.append(b)
            
        if len(features) > 10:
            # Convert to fast numpy array
            X = np.array(features)
            
            # Initialize Model: Assume max 2% of data is anomalous
            # n_jobs=-1 uses all CPU cores for speed
            model = IsolationForest(contamination=0.02, random_state=42, n_jobs=-1)
            
            # Fit and Predict (-1 for anomalies, 1 for normal points)
            preds = model.fit_predict(X)
            scores = model.decision_function(X) # Lower score = more anomalous
            
            # Map anomalies back to database models
            for i, pred in enumerate(preds):
                if pred == -1:
                    b_tx = ml_tx_mapping[i]
                    anomalies.append({
                        "reconciliation_id": reconciliation_id,
                        "anomaly_type": AnomalyType.AMOUNT_OUTLIER,
                        "severity": AnomalySeverity.MEDIUM,
                        "bank_transaction_id": b_tx.id,
                        "title": "Statistical Anomaly Detected (AI)",
                        "description": f"Transaction of {float(b_tx.amount)} on day {b_tx.transaction_date.day} deviates from historical patterns. (Score: {scores[i]:.2f})",
                        "suggested_action": "Verify if this expense is legitimate or an authorized unusual purchase.",
                    })

    return anomalies