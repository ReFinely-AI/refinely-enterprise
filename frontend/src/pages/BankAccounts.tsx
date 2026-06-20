import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, X, RefreshCcw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../hooks/useOrganizations';
import PageHeader from '../components/layout/PageHeader';

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR'];

const BankAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useAuth();
  const { organizations } = useOrganizations();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [tolerance, setTolerance] = useState(3);

  const activeOrg = organizations.find((o) => o.id === activeOrgId);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bankAccounts', activeOrgId],
    queryFn: () => reconciliationService.getBankAccounts(activeOrgId!),
    enabled: !!activeOrgId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof reconciliationService.createBankAccount>[1]) =>
      reconciliationService.createBankAccount(activeOrgId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bankAccounts', activeOrgId] });
      setModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || 'Failed to create bank account');
    },
  });

  const resetForm = () => {
    setAccountName(''); setAccountNumber(''); setBankName('');
    setCurrency('PKR'); setTolerance(3); setError('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) { setError('Account name is required'); return; }
    if (!activeOrgId) { setError('Select an organization first'); return; }
    setError('');
    createMutation.mutate({
      account_name: accountName.trim(),
      account_number: accountNumber.trim() || null,
      bank_name: bankName.trim() || null,
      currency,
      date_tolerance_days: tolerance,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Bank Accounts"
        subtitle={activeOrg ? `Accounts for ${activeOrg.name}` : 'Select an organization first'}
        actions={
          activeOrgId ? (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-all"
            >
              <Plus size={15} /> Add Bank Account
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 p-8">
        {!activeOrgId ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard size={48} className="text-surface-300 mb-4" />
            <p className="text-base font-semibold text-surface-700 mb-2">No organization selected</p>
            <p className="text-sm text-surface-400 mb-5">Select or create an organization first.</p>
            <button
              onClick={() => navigate('/organizations')}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md"
            >
              Go to Organizations
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 space-y-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="skeleton h-5 w-36" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard size={48} className="text-surface-300 mb-4" />
            <p className="text-base font-semibold text-surface-700 mb-2">No bank accounts yet</p>
            <p className="text-sm text-surface-400 mb-5">Add your first bank account to start reconciling.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md"
            >
              <Plus size={14} /> Add Bank Account
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {accounts.map((acc) => (
              <div key={acc.id} className="card card-hover flex flex-col">
                <div className="p-6 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                    <CreditCard size={18} className="text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-surface-900 mb-1">{acc.account_name}</h3>
                  {acc.bank_name && (
                    <p className="text-sm text-surface-600 mb-0.5">{acc.bank_name}</p>
                  )}
                  {acc.account_number && (
                    <p className="text-sm text-surface-400 font-mono mb-3">
                      •••• {acc.account_number.slice(-4)}
                    </p>
                  )}
                  <div className="space-y-1.5 pt-3 border-t border-surface-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Currency</span>
                      <span className="font-medium text-surface-700">{acc.currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Date Tolerance</span>
                      <span className="font-medium text-surface-700">±{acc.date_tolerance_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-500">Added</span>
                      <span className="text-surface-400">{format(parseISO(acc.created_at), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <button
                    onClick={() => navigate('/reconciliations')}
                    className="w-full h-8 bg-brand-500 hover:bg-brand-600 rounded-md text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <RefreshCcw size={12} /> New Reconciliation →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Bank Account Modal ─────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setModalOpen(false); resetForm(); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px] max-h-[90vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
              <h2 className="text-lg font-bold text-surface-900">Add Bank Account</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="text-surface-400 hover:text-surface-700 p-1 rounded-md hover:bg-surface-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="overflow-y-auto p-6 space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
                  {error}
                </div>
              )}

              <fieldset className="space-y-4">
                <legend className="text-sm font-semibold text-surface-700 mb-3">Account details</legend>
                <div>
                  <label className="block text-[13px] font-medium text-surface-600 mb-1.5">
                    Account Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Main Operations Account"
                    required
                    className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-surface-600 mb-1.5">
                    Bank Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Habib Bank Limited"
                    className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    >
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Date Tolerance (days)</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-surface-400 -mt-2">
                  Date tolerance: how many days apart two transactions can be to still match
                </p>
                <div>
                  <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Organization</label>
                  <div className="h-10 px-3 flex items-center rounded-md border border-surface-100 bg-surface-50 text-sm text-surface-600">
                    {activeOrg?.name ?? 'No organization'}
                  </div>
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-md transition-colors"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountsPage;