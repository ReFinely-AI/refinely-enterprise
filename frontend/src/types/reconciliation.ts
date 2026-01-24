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
  bank_name?: string;
  currency: string;
  date_tolerance_days: number;
  created_at: string;
}

export interface Reconciliation {
  id: number;
  bank_account_id: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  total_bank_transactions: number;
  total_ledger_transactions: number;
  matched_count: number;
  unmatched_bank_count: number;
  unmatched_ledger_count: number;
  anomaly_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface Transaction {
  id: number;
  date: string;
  amount?: number;
  debit?: number;
  credit?: number;
  description?: string;
  is_matched: boolean;
}
