import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  AlertTriangle, Sparkles, CheckCircle2, X, Search,
  ChevronDown, ChevronRight, ExternalLink, Filter,
  Clock, TrendingDown, ShieldAlert, CheckSquare,
} from 'lucide-react';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import { Anomaly, AnomalySeverity, ResolveAction } from '../types/reconciliation';
import PageHeader from '../components/layout/PageHeader';
import { cn } from '../utils';

const SEVERITY_CONFIG: Record<AnomalySeverity, {
  border: string; bg: string; badge: string; dot: string; label: string; icon: string;
}> = {
  HIGH:   { border: 'border-l-danger-500',  bg: 'bg-danger-50/60',   badge: 'bg-danger-100 text-danger-700',   dot: 'bg-danger-500',  label: 'High',   icon: '🔴' },
  MEDIUM: { border: 'border-l-warning-500', bg: 'bg-warning-50/60',  badge: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500', label: 'Medium', icon: '🟡' },
  LOW:    { border: 'border-l-[#3B82F6]',   bg: 'bg-blue-50/60',     badge: 'bg-blue-100 text-blue-700',       dot: 'bg-[#3B82F6]',   label: 'Low',    icon: '🔵' },
};

const RESOLVE_OPTIONS: Array<{ value: ResolveAction; label: string; desc: string; icon: React.ReactNode }> = [
  { value: 'create_journal_entry', label: 'Create Journal Entry',   desc: 'Post a compensating entry to the ledger', icon: <CheckSquare size={16} /> },
  { value: 'delete_duplicate',     label: 'Delete Duplicate',       desc: 'Remove the duplicate transaction',        icon: <X size={16} /> },
  { value: 'manual_review',        label: 'Flag for Manual Review', desc: 'Escalate to the accounting team',         icon: <AlertTriangle size={16} /> },
  { value: 'reverse_transaction',  label: 'Reverse Transaction',    desc: 'Flag this transaction for reversal',      icon: <TrendingDown size={16} /> },
];

type TabFilter = 'all' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'all' | 'unresolved' | 'resolved';

const AnomalyCard: React.FC<{
  anomaly: Anomaly & { reconciliation?: any };
  onResolve: (a: Anomaly) => void;
}> = ({ anomaly: a, onResolve }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[a.severity];

  const formattedDate = new Date(a.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const formattedTime = new Date(a.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={cn(
      'bg-white rounded-xl border-l-4 border border-surface-200 shadow-xs transition-all duration-200 overflow-hidden',
      cfg.border,
      a.is_resolved && 'opacity-70',
      expanded && 'shadow-md',
    )}>
      {/* Main row */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">

          {/* Severity dot */}
          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={cn('text-xs font-bold px-2.5 py-0.5 rounded-full', cfg.badge)}>
                  {cfg.label} Severity
                </span>
                <span className="text-xs font-semibold text-surface-600 bg-surface-100 px-2.5 py-0.5 rounded-full">
                  {a.anomaly_type.replace(/_/g, ' ')}
                </span>
                {a.is_resolved && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-success-100 text-success-700 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Resolved
                  </span>
                )}
              </div>

              {/* Meta & expand */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:flex items-center gap-1 text-xs text-surface-400">
                  <Clock size={11} /> {formattedDate}
                </span>
                <button
                  onClick={() => setExpanded(p => !p)}
                  className="p-1 rounded-md text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
              </div>
            </div>

            <p className="text-sm text-surface-800 font-medium leading-snug line-clamp-2">{a.description}</p>

            {/* Quick actions row */}
            {!a.is_resolved && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => navigate(`/copilot`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-ai-50 hover:bg-ai-100 text-ai-700 text-xs font-semibold rounded-lg border border-ai-200 transition-colors"
                >
                  <Sparkles size={12} /> Ask AI Copilot
                </button>
                <button
                  onClick={() => onResolve(a)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-brand-500/20"
                >
                  Resolve →
                </button>
                <button
                  onClick={() => navigate(`/reconciliations/${a.reconciliation_id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-surface-500 hover:text-brand-500 font-medium transition-colors"
                >
                  <ExternalLink size={11} /> View reconciliation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className={cn('border-t border-surface-100 px-5 py-4 animate-fade-in', cfg.bg)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Anomaly ID</p>
              <p className="text-sm font-mono font-bold text-surface-800">#{a.id}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Reconciliation</p>
              <button
                onClick={() => navigate(`/reconciliations/${a.reconciliation_id}`)}
                className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
              >
                #{a.reconciliation_id} →
              </button>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Detected</p>
              <p className="text-sm text-surface-700">{formattedDate} at {formattedTime}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Status</p>
              <p className={cn(
                'text-sm font-semibold',
                a.is_resolved ? 'text-success-600' : 'text-warning-600',
              )}>
                {a.is_resolved ? '✓ Resolved' : '⏳ Pending'}
              </p>
            </div>
            {a.bank_transaction_id && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Bank Txn ID</p>
                <p className="text-sm font-mono text-surface-700">#{a.bank_transaction_id}</p>
              </div>
            )}
            {a.ledger_transaction_id && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Ledger Txn ID</p>
                <p className="text-sm font-mono text-surface-700">#{a.ledger_transaction_id}</p>
              </div>
            )}
            {a.is_resolved && a.resolution_action && (
              <div className="col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-1">Resolution</p>
                <p className="text-sm text-surface-700 font-medium">{a.resolution_action.replace(/_/g, ' ')}</p>
                {a.resolution_note && (
                  <p className="text-xs text-surface-500 mt-1 italic">"{a.resolution_note}"</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AnomaliesPage: React.FC = () => {
  const { activeOrgId } = useAuth();
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('unresolved');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolveModal, setResolveModal] = useState<Anomaly | null>(null);
  const [resolveAction, setResolveAction] = useState<ResolveAction>('manual_review');
  const [resolveNote, setResolveNote] = useState('');

  const { data: reconciliations = [] } = useQuery({
    queryKey: ['reconciliations', activeOrgId],
    queryFn: () => reconciliationService.listReconciliations({ org_id: activeOrgId ?? undefined }),
    enabled: !!activeOrgId,
  });

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
      if (tabFilter !== 'all' && a.severity !== tabFilter) return false;
      if (statusFilter === 'unresolved' && a.is_resolved) return false;
      if (statusFilter === 'resolved' && !a.is_resolved) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.description.toLowerCase().includes(q) || a.anomaly_type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allAnomalies, tabFilter, statusFilter, searchQuery]);

  const resolveMutation = useMutation({
    mutationFn: (data: { anomaly_id: number; action: ResolveAction; note?: string }) =>
      reconciliationService.resolveAnomaly(data),
    onSuccess: () => {
      anomalyQueries.refetch();
      setResolveModal(null);
      setResolveNote('');
    },
  });

  const unresolved = allAnomalies.filter((a) => !a.is_resolved);
  const highCount  = unresolved.filter((a) => a.severity === 'HIGH').length;
  const medCount   = unresolved.filter((a) => a.severity === 'MEDIUM').length;
  const resolvedToday = allAnomalies.filter((a) => {
    if (!a.is_resolved) return false;
    return new Date(a.created_at).toDateString() === new Date().toDateString();
  }).length;

  const severityRate = allAnomalies.length > 0
    ? Math.round((unresolved.length / allAnomalies.length) * 100)
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Anomalies"
        subtitle={`${unresolved.length} unresolved anomalies require your attention`}
        actions={
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-ai-500 to-[#6366F1] hover:from-ai-600 hover:to-[#4F46E5] transition-all shadow-lg shadow-ai-500/20 hover:-translate-y-0.5"
          >
            <Sparkles size={14} /> Ask AI to resolve all
          </button>
        }
      />

      <div className="flex-1 p-6 lg:p-8 space-y-6">

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'High Severity',
              value: highCount,
              icon: <ShieldAlert size={18} />,
              iconBg: 'bg-danger-100',
              iconColor: 'text-danger-600',
              border: 'border-l-4 border-l-danger-500',
              trend: 'Needs immediate attention',
              trendColor: 'text-danger-500',
            },
            {
              label: 'Medium Severity',
              value: medCount,
              icon: <AlertTriangle size={18} />,
              iconBg: 'bg-warning-100',
              iconColor: 'text-warning-600',
              border: 'border-l-4 border-l-warning-500',
              trend: 'Review recommended',
              trendColor: 'text-warning-500',
            },
            {
              label: 'Resolved Today',
              value: resolvedToday,
              icon: <CheckCircle2 size={18} />,
              iconBg: 'bg-success-100',
              iconColor: 'text-success-600',
              border: 'border-l-4 border-l-success-500',
              trend: 'Great progress!',
              trendColor: 'text-success-600',
            },
            {
              label: 'Unresolved Rate',
              value: `${severityRate}%`,
              icon: <TrendingDown size={18} />,
              iconBg: 'bg-brand-100',
              iconColor: 'text-brand-600',
              border: 'border-l-4 border-l-brand-500',
              trend: `${allAnomalies.length} total detected`,
              trendColor: 'text-surface-400',
            },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-5 border border-surface-200 shadow-xs ${s.border}`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">{s.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.iconBg} ${s.iconColor}`}>
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-surface-900 mb-1">{s.value}</p>
              <p className={`text-xs font-medium ${s.trendColor}`}>{s.trend}</p>
            </div>
          ))}
        </div>

        {/* ── Severity Tabs + Filter Bar ─────────────────────────────── */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-xs overflow-hidden">

          {/* Severity tabs */}
          <div className="flex border-b border-surface-100">
            {([
              { key: 'all',    label: 'All',    count: allAnomalies.filter(a => statusFilter === 'unresolved' ? !a.is_resolved : statusFilter === 'resolved' ? a.is_resolved : true).length },
              { key: 'HIGH',   label: 'High',   count: allAnomalies.filter(a => a.severity === 'HIGH' && (statusFilter === 'unresolved' ? !a.is_resolved : statusFilter === 'resolved' ? a.is_resolved : true)).length },
              { key: 'MEDIUM', label: 'Medium', count: allAnomalies.filter(a => a.severity === 'MEDIUM' && (statusFilter === 'unresolved' ? !a.is_resolved : statusFilter === 'resolved' ? a.is_resolved : true)).length },
              { key: 'LOW',    label: 'Low',    count: allAnomalies.filter(a => a.severity === 'LOW' && (statusFilter === 'unresolved' ? !a.is_resolved : statusFilter === 'resolved' ? a.is_resolved : true)).length },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTabFilter(t.key)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px',
                  tabFilter === t.key
                    ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                    : 'border-transparent text-surface-500 hover:text-surface-700 hover:bg-surface-50',
                )}
              >
                {t.key !== 'all' && (
                  <span className={`w-2 h-2 rounded-full ${
                    t.key === 'HIGH' ? 'bg-danger-500' :
                    t.key === 'MEDIUM' ? 'bg-warning-500' : 'bg-[#3B82F6]'
                  }`} />
                )}
                {t.label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-bold',
                  tabFilter === t.key ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-500',
                )}>
                  {t.count}
                </span>
              </button>
            ))}

            {/* Right side: status filter */}
            <div className="ml-auto flex items-center gap-2 pr-4">
              <Filter size={13} className="text-surface-400" />
              <div className="flex items-center gap-0.5 p-0.5 bg-surface-100 rounded-lg">
                {(['all', 'unresolved', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize',
                      statusFilter === f ? 'bg-white text-surface-800 shadow-xs' : 'text-surface-500 hover:text-surface-700',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-50/50 border-b border-surface-100">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anomalies by description or type..."
                className="w-full h-9 pl-8 pr-4 rounded-lg border border-surface-200 bg-white text-sm placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
            </div>
            <span className="text-sm text-surface-400 font-medium">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          </div>
        </div>

        {/* ── Anomaly List ───────────────────────────────────────────── */}
        {anomalyQueries.isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-surface-200 p-5">
                <div className="skeleton h-4 w-1/4 rounded mb-3" />
                <div className="skeleton h-3 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-surface-200">
            <div className="w-16 h-16 rounded-2xl bg-success-50 flex items-center justify-center mb-5">
              <CheckCircle2 size={32} className="text-success-500" />
            </div>
            <p className="text-lg font-bold text-surface-800 mb-2">
              {allAnomalies.length === 0 ? 'No anomalies detected yet' : 'All clear!'}
            </p>
            <p className="text-sm text-surface-400 max-w-xs">
              {allAnomalies.length === 0
                ? 'Run a reconciliation to start detecting anomalies automatically.'
                : 'No anomalies match your current filters. Try adjusting the search or status filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Group by severity if on "all" tab */}
            {tabFilter === 'all' ? (
              <>
                {(['HIGH', 'MEDIUM', 'LOW'] as AnomalySeverity[]).map((sev) => {
                  const group = filtered.filter(a => a.severity === sev);
                  if (group.length === 0) return null;
                  const cfg = SEVERITY_CONFIG[sev];
                  return (
                    <div key={sev}>
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-surface-400">
                          {cfg.label} Severity
                        </span>
                        <span className="text-xs text-surface-400">({group.length})</span>
                      </div>
                      <div className="space-y-2">
                        {group.map((a) => (
                          <AnomalyCard key={a.id} anomaly={a} onResolve={(an) => { setResolveModal(an); setResolveAction('manual_review'); }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              filtered.map((a) => (
                <AnomalyCard key={a.id} anomaly={a} onResolve={(an) => { setResolveModal(an); setResolveAction('manual_review'); }} />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Resolve Modal ──────────────────────────────────────────────── */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={() => setResolveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] animate-slide-up overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-brand-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-surface-900">Resolve Anomaly</h2>
                  <p className="text-xs text-surface-400">Anomaly #{resolveModal.id}</p>
                </div>
              </div>
              <button onClick={() => setResolveModal(null)}
                className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Anomaly summary */}
              <div className="rounded-xl border border-surface-200 p-4 bg-surface-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-0.5 rounded-full',
                    SEVERITY_CONFIG[resolveModal.severity].badge,
                  )}>
                    {SEVERITY_CONFIG[resolveModal.severity].label} Severity
                  </span>
                  <span className="text-xs font-semibold text-surface-500 bg-white px-2.5 py-0.5 rounded-full border border-surface-200">
                    {resolveModal.anomaly_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-surface-700 leading-relaxed">{resolveModal.description}</p>
              </div>

              {/* Resolution actions */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-3">Choose Resolution Action</p>
                <div className="space-y-2">
                  {RESOLVE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                        resolveAction === opt.value
                          ? 'border-brand-500 bg-brand-50 shadow-sm'
                          : 'border-surface-200 hover:bg-surface-50 hover:border-surface-300',
                      )}
                    >
                      <input
                        type="radio"
                        name="resolve"
                        value={opt.value}
                        checked={resolveAction === opt.value}
                        onChange={() => setResolveAction(opt.value)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all',
                        resolveAction === opt.value ? 'border-brand-500 bg-brand-500' : 'border-surface-300',
                      )}>
                        {resolveAction === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className={cn('mt-0.5', resolveAction === opt.value ? 'text-brand-600' : 'text-surface-400')}>
                          {opt.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-surface-800">{opt.label}</p>
                          <p className="text-xs text-surface-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">
                  Resolution Notes <span className="normal-case font-normal text-surface-400">(optional)</span>
                </label>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  rows={3}
                  placeholder="Add context for the audit trail..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all placeholder-surface-400"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-surface-100 bg-surface-50/50">
              <p className="text-xs text-surface-400">This action will be logged in the audit trail</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setResolveModal(null)}
                  className="px-4 py-2 border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 hover:bg-white hover:shadow-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resolveMutation.mutate({
                    anomaly_id: resolveModal.id,
                    action: resolveAction,
                    note: resolveNote || undefined,
                  })}
                  disabled={resolveMutation.isPending}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20"
                >
                  {resolveMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Resolving...
                    </span>
                  ) : 'Confirm Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomaliesPage;
