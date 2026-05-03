import { apiClient } from '../contexts/AuthContext';
import {
  Organization,
  BankAccount,
  Reconciliation,
  ReconciliationTransactionsResponse,
  RunMatchResponse,
  Match,
  Anomaly,
  ResolveAction,
  CopilotResponse,
} from '../types/reconciliation';

// ── Organizations ─────────────────────────────────────────────────────────

const getOrganizations = async (): Promise<Organization[]> => {
  const res = await apiClient.get('/organizations/');
  return res.data;
};

const createOrganization = async (data: {
  name: string;
  currency?: string;
}): Promise<Organization> => {
  const res = await apiClient.post('/organizations/', data);
  return res.data;
};

const getOrganization = async (orgId: number): Promise<Organization> => {
  const res = await apiClient.get(`/organizations/${orgId}`);
  return res.data;
};

// ── Bank Accounts ─────────────────────────────────────────────────────────

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
  const res = await apiClient.post(
    `/reconciliations/bank-accounts?org_id=${orgId}`,
    data,
  );
  return res.data;
};

// ── Reconciliations ───────────────────────────────────────────────────────

const createReconciliation = async (data: {
  bank_account_id: number;
  period_start: string;
  period_end: string;
}): Promise<Reconciliation> => {
  const res = await apiClient.post('/reconciliations/', data);
  return res.data;
};

const getReconciliation = async (id: number): Promise<Reconciliation> => {
  const res = await apiClient.get(`/reconciliations/${id}`);
  return res.data;
};

const listReconciliations = async (params?: {
  org_id?: number;
  bank_account_id?: number;
  status?: string;
}): Promise<Reconciliation[]> => {
  const query = new URLSearchParams();
  if (params?.org_id) query.set('org_id', String(params.org_id));
  if (params?.bank_account_id) query.set('bank_account_id', String(params.bank_account_id));
  if (params?.status) query.set('status', params.status);
  const res = await apiClient.get(`/reconciliations/?${query.toString()}`);
  return res.data;
};

const getReconciliationTransactions = async (
  reconciliationId: number,
): Promise<ReconciliationTransactionsResponse> => {
  const res = await apiClient.get(`/reconciliations/${reconciliationId}/transactions`);
  return res.data;
};

const runMatching = async (reconciliationId: number): Promise<RunMatchResponse> => {
  const res = await apiClient.post(`/reconciliations/${reconciliationId}/match`);
  return res.data;
};

const getMatches = async (reconciliationId: number): Promise<Match[]> => {
  const res = await apiClient.get(`/reconciliations/${reconciliationId}/matches`);
  return res.data;
};

// ── Anomalies ─────────────────────────────────────────────────────────────

const getAnomalies = async (reconciliationId: number): Promise<Anomaly[]> => {
  const res = await apiClient.get(`/reconciliations/${reconciliationId}/anomalies`);
  return res.data;
};

const resolveAnomaly = async (data: {
  anomaly_id: number;
  action: ResolveAction;
  note?: string;
}): Promise<Anomaly> => {
  const res = await apiClient.post('/reconciliations/resolve-anomaly', data);
  return res.data;
};

// ── AI Copilot ────────────────────────────────────────────────────────────

const copilotChat = async (data: {
  reconciliation_id: number;
  message: string;
}): Promise<CopilotResponse> => {
  const res = await apiClient.post('/copilot/chat', data);
  return res.data;
};

// ── Export ────────────────────────────────────────────────────────────────

const exportReport = async (reconciliationId: number): Promise<Blob> => {
  const res = await apiClient.get(`/reconciliations/${reconciliationId}/export`, {
    responseType: 'blob',
  });
  return res.data;
};

// ── File Uploads ──────────────────────────────────────────────────────────

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
  getOrganization,
  getBankAccounts,
  createBankAccount,
  createReconciliation,
  listReconciliations,
  getReconciliation,
  getReconciliationTransactions,
  runMatching,
  getMatches,
  getAnomalies,
  resolveAnomaly,
  copilotChat,
  exportReport,
  uploadBankFile,
  uploadLedgerFile,
};
