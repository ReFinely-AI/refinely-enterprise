import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { BankAccount, Reconciliation } from '../types/reconciliation';
import { reconciliationService } from '../services/reconciliation';
import { cn } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  onCreated: (recon: Reconciliation) => void;
}

const NewReconciliationDialog: React.FC<Props> = ({ open, onClose, bankAccounts, onCreated }) => {
  const [step, setStep] = useState(0);
  const [bankAccountId, setBankAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedAccount = bankAccounts.find((a) => a.id === Number(bankAccountId));

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(0); setBankAccountId(''); setStartDate(''); setEndDate(''); setError(''); }, 200);
  };

  const goNext = () => {
    if (step === 0 && !bankAccountId) { setError('Select a bank account'); return; }
    if (step === 1 && (!startDate || !endDate)) { setError('Select both start and end dates'); return; }
    if (step === 1 && startDate > endDate) { setError('Start date must be before end date'); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const recon = await reconciliationService.createReconciliation({
        bank_account_id: Number(bankAccountId),
        period_start: startDate,
        period_end: endDate,
      });
      onCreated(recon);
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create reconciliation');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[520px] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
          <h2 className="text-lg font-bold text-surface-900">New Reconciliation</h2>
          <button onClick={handleClose} className="text-surface-400 hover:text-surface-700 p-1 rounded-md hover:bg-surface-100">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 py-4 border-b border-surface-100">
          {['Configure', 'Date Range', 'Review'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  step === i ? 'bg-brand-500 text-white' : step > i ? 'bg-success-500 text-white' : 'bg-surface-200 text-surface-500',
                )}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span className={cn('text-sm font-medium', step === i ? 'text-brand-600' : step > i ? 'text-success-600' : 'text-surface-400')}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={cn('flex-1 h-px mx-3', step > i ? 'bg-success-300' : 'bg-surface-200')} />}
            </React.Fragment>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
              {error}
            </div>
          )}

          {/* Step 0: Bank Account */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-surface-600 mb-1.5">
                  Bank Account <span className="text-danger-500">*</span>
                </label>
                {bankAccounts.length === 0 ? (
                  <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 text-sm text-warning-700">
                    No bank accounts found. Create one first.
                  </div>
                ) : (
                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    <option value="">Select a bank account...</option>
                    {bankAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.account_name}{a.bank_name ? ` — ${a.bank_name}` : ''} ({a.currency})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Dates */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-surface-600 mb-3">Reconciliation Period</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Period Start <span className="text-danger-500">*</span></label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Period End <span className="text-danger-500">*</span></label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-surface-400">
                The dates should match your bank statement period.
              </p>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-surface-700 mb-3">Review your reconciliation</p>
              <div className="space-y-2 p-4 bg-surface-50 rounded-lg border border-surface-200 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Bank Account</span>
                  <span className="font-medium text-surface-800">
                    {selectedAccount?.account_name}{selectedAccount?.bank_name ? ` — ${selectedAccount.bank_name}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Period</span>
                  <span className="font-medium text-surface-800">
                    {startDate && format(new Date(startDate), 'dd MMM yyyy')} – {endDate && format(new Date(endDate), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Initial Status</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-200 text-surface-600">Pending</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200">
          <button
            onClick={step === 0 ? handleClose : () => setStep((s) => s - 1)}
            disabled={loading}
            className="flex items-center gap-1 px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-50 transition-colors"
          >
            {step === 0 ? 'Cancel' : <><ChevronLeft size={14} /> Back</>}
          </button>
          {step < 2 ? (
            <button
              onClick={goNext}
              disabled={bankAccounts.length === 0}
              className="flex items-center gap-1 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-md transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-md transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : 'Create Reconciliation →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewReconciliationDialog;
