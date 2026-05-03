import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, Plus, MoreHorizontal, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../hooks/useOrganizations';
import { Reconciliation } from '../types/reconciliation';
import PageHeader from '../components/layout/PageHeader';
import NewReconciliationDialog from '../components/NewReconciliationDialog';
import { cn } from '../utils';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-surface-100 text-surface-600' },
  in_progress: { label: 'In Progress', cls: 'bg-[#EFF6FF] text-[#2563EB]' },
  completed: { label: 'Completed', cls: 'bg-success-50 text-success-600' },
  failed: { label: 'Failed', cls: 'bg-danger-50 text-danger-600' },
};

const ReconciliationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useAuth();
  const { organizations } = useOrganizations();
  const [openNew, setOpenNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeOrg = organizations.find((o) => o.id === activeOrgId);

  const { data: reconciliations = [], isLoading } = useQuery({
    queryKey: ['reconciliations', activeOrgId],
    queryFn: () => reconciliationService.listReconciliations({ org_id: activeOrgId ?? undefined }),
    enabled: !!activeOrgId,
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts', activeOrgId],
    queryFn: () => reconciliationService.getBankAccounts(activeOrgId!),
    enabled: !!activeOrgId,
  });

  const filtered = useMemo(() => {
    return reconciliations.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return String(r.id).includes(q) || r.period_start.includes(q) || r.period_end.includes(q);
      }
      return true;
    });
  }, [reconciliations, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Reconciliations"
        subtitle={activeOrg ? `All sessions for ${activeOrg.name}` : 'Select an organization'}
        actions={
          <button
            onClick={() => setOpenNew(true)}
            disabled={bankAccounts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-md transition-all"
          >
            <Plus size={15} /> New Reconciliation
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="px-8 py-4 bg-white border-b border-surface-200 flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="h-9 pl-8 pr-4 w-52 rounded-md border border-surface-200 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-surface-100 rounded-md">
          {(['all', 'pending', 'in_progress', 'completed', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                statusFilter === s ? 'bg-white text-surface-800 shadow-xs' : 'text-surface-500 hover:text-surface-700',
              )}
            >
              {s === 'all' ? 'All' : STATUS_MAP[s]?.label ?? s}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-surface-500">{filtered.length} results</span>
      </div>

      <div className="flex-1 p-8">
        {isLoading ? (
          <div className="card">
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCcw size={48} className="text-surface-300 mb-4" />
            <p className="text-base font-semibold text-surface-700 mb-2">No reconciliations found</p>
            <p className="text-sm text-surface-400 mb-5">
              {reconciliations.length === 0
                ? 'Create your first reconciliation to get started.'
                : 'Try changing your filters.'}
            </p>
            {reconciliations.length === 0 && (
              <button
                onClick={() => setOpenNew(true)}
                disabled={bankAccounts.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-md"
              >
                <Plus size={14} /> New Reconciliation
              </button>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  {['#ID', 'Period', 'Status', 'Bank Txns', 'Matched', 'Match Rate', 'Anomalies', 'Created', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((r) => <ReconRow key={r.id} r={r} onClick={() => navigate(`/reconciliations/${r.id}`)} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewReconciliationDialog
        open={openNew}
        bankAccounts={bankAccounts}
        onClose={() => setOpenNew(false)}
        onCreated={(r) => { setOpenNew(false); navigate(`/reconciliations/${r.id}`); }}
      />
    </div>
  );
};

const ReconRow: React.FC<{ r: Reconciliation; onClick: () => void }> = ({ r, onClick }) => {
  const rate = r.total_bank_transactions > 0
    ? Math.round((r.matched_count / r.total_bank_transactions) * 100)
    : 0;
  const status = STATUS_MAP[r.status] ?? { label: r.status, cls: 'bg-surface-100 text-surface-600' };

  return (
    <tr className="hover:bg-surface-50 cursor-pointer transition-colors" onClick={onClick}>
      <td className="px-5 py-4 text-sm font-mono font-semibold text-brand-600">#{r.id}</td>
      <td className="px-5 py-4 text-sm text-surface-700">
        {format(parseISO(r.period_start), 'dd MMM')} – {format(parseISO(r.period_end), 'dd MMM yyyy')}
      </td>
      <td className="px-5 py-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
          {status.label}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-surface-600">{r.total_bank_transactions}</td>
      <td className="px-5 py-4 text-sm text-surface-600">{r.matched_count}</td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-success-500 transition-all" style={{ width: `${rate}%` }} />
          </div>
          <span className="text-sm font-medium text-surface-700">{rate}%</span>
        </div>
      </td>
      <td className="px-5 py-4">
        {r.anomaly_count > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-semibold bg-danger-50 text-danger-600 rounded-full">
            {r.anomaly_count}
          </span>
        ) : <span className="text-surface-400">—</span>}
      </td>
      <td className="px-5 py-4 text-sm text-surface-400">
        {format(parseISO(r.created_at), 'dd MMM yyyy')}
      </td>
      <td className="px-5 py-4">
        <button className="text-surface-400 hover:text-surface-600 p-1 rounded hover:bg-surface-100">
          <MoreHorizontal size={15} />
        </button>
      </td>
    </tr>
  );
};

export default ReconciliationsPage;
