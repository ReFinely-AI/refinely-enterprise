import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertTriangle, Sparkles, CheckCircle2, X, Search } from 'lucide-react';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import { Anomaly, AnomalySeverity, ResolveAction } from '../types/reconciliation';
import PageHeader from '../components/layout/PageHeader';
import { cn } from '../utils';

const SEVERITY_BORDER: Record<AnomalySeverity, string> = {
  HIGH: 'border-l-danger-500',
  MEDIUM: 'border-l-warning-500',
  LOW: 'border-l-[#3B82F6]',
};

const SEVERITY_DOT: Record<AnomalySeverity, string> = {
  HIGH: 'bg-danger-500', MEDIUM: 'bg-warning-500', LOW: 'bg-[#3B82F6]',
};

const AnomaliesPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useAuth();
  const [severityFilter, setSeverityFilter] = useState<'all' | AnomalySeverity>('all');
  const [resolvedFilter, setResolvedFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolveModal, setResolveModal] = useState<Anomaly | null>(null);
  const [resolveAction, setResolveAction] = useState<ResolveAction>('manual_review');
  const [resolveNote, setResolveNote] = useState('');

  const { data: reconciliations = [] } = useQuery({
    queryKey: ['reconciliations', activeOrgId],
    queryFn: () => reconciliationService.listReconciliations({ org_id: activeOrgId ?? undefined }),
    enabled: !!activeOrgId,
  });

  // Fetch anomalies for all reconciliations
  const anomalyQueries = useQuery({
    queryKey: ['allAnomalies', reconciliations.map((r) => r.id)],
    queryFn: async () => {
      const results = await Promise.all(
        reconciliations.map(async (r) => {
          const anomalies = await reconciliationService.getAnomalies(r.id);
          return anomalies.map((a) => ({ ...a, reconciliation: r }));
        }),
      );
      return results.flat();
    },
    enabled: reconciliations.length > 0,
  });

  const allAnomalies = anomalyQueries.data ?? [];

  const filtered = useMemo(() => {
    return allAnomalies.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (resolvedFilter === 'unresolved' && a.is_resolved) return false;
      if (resolvedFilter === 'resolved' && !a.is_resolved) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.description.toLowerCase().includes(q) || a.anomaly_type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allAnomalies, severityFilter, resolvedFilter, searchQuery]);

  const resolveMutation = useMutation({
    mutationFn: (data: { anomaly_id: number; action: ResolveAction; note?: string }) =>
      reconciliationService.resolveAnomaly(data),
    onSuccess: () => {
      anomalyQueries.refetch();
      setResolveModal(null);
      setResolveNote('');
    },
  });

  const highCount = allAnomalies.filter((a) => !a.is_resolved && a.severity === 'HIGH').length;
  const medCount = allAnomalies.filter((a) => !a.is_resolved && a.severity === 'MEDIUM').length;
  const resolvedToday = allAnomalies.filter((a) => {
    if (!a.is_resolved) return false;
    const today = new Date().toDateString();
    return new Date(a.created_at).toDateString() === today;
  }).length;
  const totalThisMonth = allAnomalies.filter((a) => {
    const now = new Date();
    const d = new Date(a.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Anomalies"
        subtitle={`${allAnomalies.filter((a) => !a.is_resolved).length} unresolved anomalies across all reconciliations`}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-md bg-gradient-to-r from-ai-500 to-[#6366F1] hover:from-ai-600 hover:to-[#4F46E5] transition-all">
            <Sparkles size={14} /> Ask AI to resolve all
          </button>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-5">
          {[
            { label: 'High Severity', value: highCount, bg: 'bg-danger-50', icon: 'bg-danger-100 text-danger-600' },
            { label: 'Medium Severity', value: medCount, bg: 'bg-warning-50', icon: 'bg-warning-100 text-warning-600' },
            { label: 'Resolved Today', value: resolvedToday, bg: 'bg-success-50', icon: 'bg-success-100 text-success-600' },
            { label: 'Total This Month', value: totalThisMonth, bg: 'bg-brand-50', icon: 'bg-brand-100 text-brand-600' },
          ].map((s) => (
            <div key={s.label} className={`card p-5 ${s.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-surface-500 font-medium mb-1">{s.label}</p>
                  <p className="text-[28px] font-bold text-surface-900">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.icon}`}>
                  <AlertTriangle size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-surface-200">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anomalies..."
              className="h-9 pl-8 pr-4 w-52 rounded-md border border-surface-200 text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-surface-100 rounded-md">
            {(['all', 'unresolved', 'resolved'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setResolvedFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize',
                  resolvedFilter === f ? 'bg-white text-surface-800 shadow-xs' : 'text-surface-500 hover:text-surface-700',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-surface-100 rounded-md">
            {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  severityFilter === f ? 'bg-white text-surface-800 shadow-xs' : 'text-surface-500 hover:text-surface-700',
                )}
              >
                {f === 'all' ? 'All Severities' : f}
              </button>
            ))}
          </div>

          <span className="ml-auto text-sm text-surface-500">{filtered.length} results</span>
        </div>

        {/* Anomaly List */}
        {anomalyQueries.isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 size={48} className="text-success-400 mb-4" />
            <p className="text-base font-semibold text-surface-700 mb-2">No anomalies found</p>
            <p className="text-sm text-surface-400">
              {allAnomalies.length === 0 ? 'Run matching to detect anomalies.' : 'All anomalies have been resolved!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                className={cn('card border-l-4 p-5', SEVERITY_BORDER[a.severity], a.is_resolved && 'opacity-60')}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[a.severity]}`} />
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full',
                      a.severity === 'HIGH' ? 'bg-danger-50 text-danger-600' :
                      a.severity === 'MEDIUM' ? 'bg-warning-50 text-warning-600' : 'bg-[#EFF6FF] text-[#2563EB]',
                    )}>{a.severity}</span>
                    <span className="text-xs font-semibold text-surface-600 bg-surface-100 px-2 py-0.5 rounded-full">
                      {a.anomaly_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-surface-400">
                      Reconciliation #{(a as any).reconciliation?.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-full',
                      a.is_resolved ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600',
                    )}>
                      {a.is_resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                    <button
                      onClick={() => navigate(`/reconciliations/${a.reconciliation_id}`)}
                      className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                    >
                      View reconciliation →
                    </button>
                  </div>
                </div>

                <p className="text-sm text-surface-800">{a.description}</p>

                {!a.is_resolved && (
                  <div className="flex items-center gap-2 mt-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-ai-50 hover:bg-ai-100 text-ai-600 text-xs font-semibold rounded-md border border-ai-200 transition-colors">
                      <Sparkles size={12} /> Ask AI Copilot
                    </button>
                    <button
                      onClick={() => { setResolveModal(a); setResolveAction('manual_review'); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors"
                    >
                      Resolve →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setResolveModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-[560px] animate-slide-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Resolve Anomaly</h2>
                <p className="text-sm text-surface-500">Choose how to resolve this anomaly</p>
              </div>
              <button onClick={() => setResolveModal(null)} className="text-surface-400 hover:text-surface-700 p-1 rounded-md hover:bg-surface-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 text-sm space-y-1">
                <p><span className="text-surface-500">Type:</span> <span className="font-semibold">{resolveModal.anomaly_type.replace(/_/g, ' ')}</span></p>
                <p><span className="text-surface-500">Severity:</span> <span className={cn('font-semibold', resolveModal.severity === 'HIGH' ? 'text-danger-600' : resolveModal.severity === 'MEDIUM' ? 'text-warning-600' : 'text-[#2563EB]')}>{resolveModal.severity}</span></p>
                <p className="text-surface-600">{resolveModal.description}</p>
              </div>
              <div className="space-y-3">
                {([
                  { value: 'create_journal_entry', label: 'Create Journal Entry', desc: 'Post a compensating entry to the ledger' },
                  { value: 'delete_duplicate', label: 'Delete Duplicate', desc: 'Remove the duplicate ledger transaction' },
                  { value: 'manual_review', label: 'Flag for Manual Review', desc: 'Leave for the accounting team' },
                  { value: 'reverse_transaction', label: 'Reverse Transaction', desc: 'Flag this transaction for reversal' },
                ] as Array<{ value: ResolveAction; label: string; desc: string }>).map((opt) => (
                  <label key={opt.value} className={cn('flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors', resolveAction === opt.value ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:bg-surface-50')}>
                    <input type="radio" name="resolve" value={opt.value} checked={resolveAction === opt.value} onChange={() => setResolveAction(opt.value)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-surface-800">{opt.label}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Notes (optional)</label>
                <textarea value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} rows={2} placeholder="Add a note for audit trail..." className="w-full px-3 py-2 rounded-md border border-surface-200 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-200">
              <button onClick={() => setResolveModal(null)} className="px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50">Cancel</button>
              <button
                onClick={() => resolveMutation.mutate({ anomaly_id: resolveModal.id, action: resolveAction, note: resolveNote || undefined })}
                disabled={resolveMutation.isPending}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-md"
              >
                {resolveMutation.isPending ? 'Resolving...' : 'Resolve Anomaly'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomaliesPage;
