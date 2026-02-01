import { apiClient } from '../contexts/AuthContext';
import {
  Organization,
  BankAccount,
  Reconciliation,
  ReconciliationTransactionsResponse,
  RunMatchResponse,
  Match,
} from '../types/reconciliation';

// Organizations
const getOrganizations = async (): Promise<Organization[]> => {
  const res = await apiClient.get('/organizations/');
  return res.data;
};

const createOrganization = async (data: {
  name: string;
  currency?: string;
}): Promise<Organization> => {
  // Backend OrganizationCreate: { name: string, currency: string | null, default "PKR" }
  const res = await apiClient.post('/organizations/', data);
  return res.data;
};

// Bank accounts
const getBankAccounts = async (orgId: number): Promise<BankAccount[]> => {
  const res = await apiClient.get(`/reconciliations/bank-accounts?org_id=${orgId}`);
  return res.data;
};

const createBankAccount = async (
  orgId: number,
  data: {
    account_name: string;
    account_number: string | null;
    bank_name: string | null;
    currency?: string | null;
    date_tolerance_days?: number | null;
  },
): Promise<BankAccount> => {
  // Backend BankAccountCreate: fields match these keys
  const res = await apiClient.post(
    `/reconciliations/bank-accounts?org_id=${orgId}`,
    data,
  );
  return res.data;
};

const createReconciliation = async (data: {
  bank_account_id: number;
  period_start: string; // "YYYY-MM-DD"
  period_end: string;   // "YYYY-MM-DD"
}): Promise<Reconciliation> => {
  // Backend ReconciliationCreate: { bank_account_id, period_start, period_end }
  const res = await apiClient.post('/reconciliations/', data);
  return res.data;
};

const getReconciliation = async (id: number): Promise<Reconciliation> => {
  const res = await apiClient.get(`/reconciliations/${id}`);
  return res.data;
};

// Transactions for a reconciliation
const getReconciliationTransactions = async (
  reconciliationId: number,
): Promise<ReconciliationTransactionsResponse> => {
  const res = await apiClient.get(`/reconciliations/${reconciliationId}/transactions`);
  return res.data;
};

// Run matching
const runMatching = async (reconciliationId: number): Promise<RunMatchResponse> => {
  const res = await apiClient.post(`/reconciliations/${reconciliationId}/match`);
  return res.data;
};

// Get all matches
const getMatches = async (reconciliationId: number): Promise<Match[]> => {
  const res = await apiClient.get(`/reconciliations/${reconciliationId}/matches`);
  return res.data;
};

const uploadBankFile = async (
  reconciliationId: number,
  file: File,
  mapping: { date_column: string; amount_column: string; description_column?: string },
) => {
  const formData = new FormData();
  formData.append('reconciliation_id', reconciliationId.toString());
  formData.append('file', file);
  formData.append('date_column', mapping.date_column);
  formData.append('amount_column', mapping.amount_column);
  if (mapping.description_column) {
    formData.append('description_column', mapping.description_column);
  }

  const res = await apiClient.post('/reconciliations/upload/bank', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

const uploadLedgerFile = async (
  reconciliationId: number,
  file: File,
  mapping: {
    date_column: string;
    debit_column: string;
    credit_column: string;
    description_column?: string;
  },
) => {
  const formData = new FormData();
  formData.append('reconciliation_id', reconciliationId.toString());
  formData.append('file', file);
  formData.append('date_column', mapping.date_column);
  formData.append('debit_column', mapping.debit_column);
  formData.append('credit_column', mapping.credit_column);
  if (mapping.description_column) {
    formData.append('description_column', mapping.description_column);
  }

  const res = await apiClient.post('/reconciliations/upload/ledger', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const reconciliationService = {
  getOrganizations,
  createOrganization,
  getBankAccounts,
  createBankAccount,
  createReconciliation,
  getReconciliation,
  getReconciliationTransactions,
  runMatching,
  getMatches,
  uploadBankFile,
  uploadLedgerFile,
};
