import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, CreditCard, RefreshCcw, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils';
import PageHeader from '../components/layout/PageHeader';

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR'];

const OrganizationsPage: React.FC = () => {
  const { activeOrgId, setActiveOrgId } = useAuth();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('PKR');
  const [error, setError] = useState('');

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => reconciliationService.getOrganizations(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; currency: string }) =>
      reconciliationService.createOrganization(data),
    onSuccess: (org) => {
      qc.invalidateQueries({ queryKey: ['organizations'] });
      setActiveOrgId(org.id);
      setModalOpen(false);
      setName('');
      setCurrency('PKR');
      setError('');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || 'Failed to create organization');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Organization name is required'); return; }
    setError('');
    createMutation.mutate({ name: name.trim(), currency });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Organizations"
        subtitle="Manage your companies and entities"
        actions={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-all"
          >
            <Plus size={15} /> New Organization
          </button>
        }
      />

      <div className="flex-1 p-8">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6 space-y-3">
                <div className="skeleton h-10 w-10 rounded-xl" />
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 size={56} className="text-surface-300 mb-4" />
            <p className="text-lg font-semibold text-surface-700 mb-2">No organizations yet</p>
            <p className="text-sm text-surface-400 mb-6">Create your first organization to start reconciling.</p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md"
            >
              <Plus size={15} /> New Organization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {organizations.map((org) => {
              const isActive = org.id === activeOrgId;
              return (
                <div
                  key={org.id}
                  className={cn(
                    'card card-hover flex flex-col relative',
                    isActive && 'border-l-4 border-l-brand-500',
                  )}
                >
                  {isActive && (
                    <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success-50 text-success-600">
                      Active
                    </span>
                  )}
                  <div className="p-6 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                      <Building2 size={18} className="text-brand-600" />
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 mb-1">{org.name}</h3>
                    <p className="text-sm text-surface-400 mb-1">
                      Created {format(parseISO(org.created_at), 'MMM yyyy')}
                    </p>
                    <p className="text-sm text-surface-600">
                      Currency: <span className="font-medium">{org.currency}</span>
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100">
                      <div className="flex items-center gap-1.5 text-sm text-surface-500">
                        <CreditCard size={14} />
                        <span>Bank Accounts</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-surface-500">
                        <RefreshCcw size={14} />
                        <span>Reconciliations</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-5 flex gap-2">
                    {!isActive && (
                      <button
                        onClick={() => setActiveOrgId(org.id)}
                        className="flex-1 h-8 border border-surface-200 rounded-md text-xs font-medium text-surface-700 hover:bg-surface-50 hover:border-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => setActiveOrgId(org.id)}
                      className="flex-1 h-8 bg-brand-500 hover:bg-brand-600 rounded-md text-xs font-semibold text-white transition-colors"
                    >
                      Open →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── New Org Modal ───────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-[480px] animate-slide-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
              <h2 className="text-lg font-bold text-surface-900">New Organization</h2>
              <button onClick={() => setModalOpen(false)} className="text-surface-400 hover:text-surface-700 p-1 rounded-md hover:bg-surface-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-surface-600 mb-1.5">
                  Organization name <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ACME Corp Ltd."
                  required
                  className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-600 mb-1.5">
                  Default currency <span className="text-danger-500">*</span>
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm text-surface-800 bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                >
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-xs text-surface-400 mt-1.5">Used as the default for bank accounts and reports</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-md transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
