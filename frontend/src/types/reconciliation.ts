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
  period_start: string; // date
  period_end: string;   // date
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
  transaction_date: string; // date
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
  transaction_date: string; // date
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
  confidence: number; // 0.0–1.0
  audit_trail: any; // JSON
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
