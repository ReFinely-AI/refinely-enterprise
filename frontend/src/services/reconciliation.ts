import { apiClient } from '../contexts/AuthContext';
import { Organization, BankAccount, Reconciliation } from '../types/reconciliation';

// Organizations
const getOrganizations = async (): Promise<Organization[]> => {
  const res = await apiClient.get('/organizations/');
  return res.data;
};

// Bank accounts
const getBankAccounts = async (orgId: number): Promise<BankAccount[]> => {
  const res = await apiClient.get(`/reconciliations/bank-accounts?org_id=${orgId}`);
  return res.data;
};

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

const uploadBankFile = async (
  reconciliationId: number,
  file: File,
  mapping: { date_column: string; amount_column: string; description_column?: string }
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
  }
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
  getBankAccounts,
  createReconciliation,
  getReconciliation,
  uploadBankFile,
  uploadLedgerFile,
};
