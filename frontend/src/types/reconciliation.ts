export interface Organization {
  id: number;
  name: string;
  currency: string;
  created_at: string;
}

export interface BankAccount {
  id: number;
  organization_id: number;
  account_name: string;
  account_number?: string | null;
  bank_name?: string | null;
  currency: string;
  date_tolerance_days: number;
  created_at: string;
}

export type ReconciliationStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Reconciliation {
  id: number;
  bank_account_id: number;
  created_by_id: number;
  period_start: string;
  period_end: string;
  status: ReconciliationStatus;
  total_bank_transactions: number;
  total_ledger_transactions: number;
  matched_count: number;
  unmatched_bank_count: number;
  unmatched_ledger_count: number;
  anomaly_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface BankTransaction {
  id: number;
  reconciliation_id: number;
  transaction_date: string;
  description?: string | null;
  reference?: string | null;
  amount: number;
  balance?: number | null;
  is_matched: boolean;
  raw_data?: string | null;
  created_at: string;
}

export interface LedgerTransaction {
  id: number;
  reconciliation_id: number;
  transaction_date: string;
  description?: string | null;
  reference?: string | null;
  account_code?: string | null;
  debit: number;
  credit: number;
  is_matched: boolean;
  raw_data?: string | null;
  created_at: string;
}

export type MatchType = 'exact' | 'fuzzy_amount' | 'fuzzy_desc' | string;

export interface Match {
  id: number;
  reconciliation_id: number;
  bank_transaction_id: number;
  ledger_transaction_id: number;
  match_type: MatchType;
  confidence: number;
  audit_trail: any;
  created_at: string;
}

export interface ReconciliationTransactionsResponse {
  reconciliation_id: number;
  bank_transactions: BankTransaction[];
  ledger_transactions: LedgerTransaction[];
}

export interface RunMatchResponse {
  reconciliation_id: number;
  matched_count: number;
  unmatched_bank_count: number;
  unmatched_ledger_count: number;
  matches: Match[];
  unmatched_bank_ids: number[];
  unmatched_ledger_ids: number[];
}

export type AnomalyType =
  | 'DUPLICATE'
  | 'MISSING'
  | 'TIMING_DIFFERENCE'
  | 'AMOUNT_OUTLIER'
  | 'SUSPICIOUS_PATTERN';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Anomaly {
  id: number;
  reconciliation_id: number;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  bank_transaction_id?: number | null;
  ledger_transaction_id?: number | null;
  is_resolved: boolean;
  resolution_action?: string | null;
  resolution_note?: string | null;
  created_at: string;
}

export type ResolveAction =
  | 'create_journal_entry'
  | 'delete_duplicate'
  | 'reverse_transaction'
  | 'manual_review';

export interface CopilotSuggestedAction {
  action: ResolveAction;
  anomaly_id?: number;
  amount?: number;
  description?: string;
}

export interface CopilotResponse {
  message: string;
  suggested_action: CopilotSuggestedAction | null;
}
