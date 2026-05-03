import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Download, Upload, Play, AlertTriangle, CheckCircle2,
  Sparkles, Send, X, RefreshCcw, FileText, ChevronRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { reconciliationService } from '../services/reconciliation';
import { Anomaly, AnomalySeverity, ResolveAction } from '../types/reconciliation';
import { cn } from '../utils';
import FileUploadDialog from '../components/FileUploadDialog';

type Tab = 'summary' | 'matches' | 'anomalies' | 'copilot';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-surface-100 text-surface-600' },
  in_progress: { label: 'In Progress', cls: 'bg-[#EFF6FF] text-[#2563EB]' },
  completed: { label: 'Completed', cls: 'bg-success-50 text-success-600' },
  failed: { label: 'Failed', cls: 'bg-danger-50 text-danger-600' },
};

const SEVERITY_CLS: Record<AnomalySeverity, string> = {
  HIGH: 'border-l-danger-500 bg-danger-50/30',
  MEDIUM: 'border-l-warning-500 bg-warning-50/30',
  LOW: 'border-l-[#3B82F6] bg-[#EFF6FF]/30',
};

const SEVERITY_DOT: Record<AnomalySeverity, string> = {
  HIGH: 'bg-danger-500', MEDIUM: 'bg-warning-500', LOW: 'bg-[#3B82F6]',
};

const ReconciliationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('summary');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'bank' | 'ledger'>('bank');
  const [resolveModal, setResolveModal] = useState<Anomaly | null>(null);
  const [resolveAction, setResolveAction] = useState<ResolveAction>('manual_review');
  const [resolveNote, setResolveNote] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; action?: any }>>([
    {
      role: 'ai',
      text: "Hello! I'm your Refinely AI Copilot. I've analyzed this reconciliation and can help you understand anomalies, suggest resolutions, and explain unusual patterns. What would you like to explore?",
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const reconId = Number(id);

  const { data: recon, isLoading: reconLoading } = useQuery({
    queryKey: ['reconciliation', reconId],
    queryFn: () => reconciliationService.getReconciliation(reconId),
    enabled: !!reconId,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', reconId],
    queryFn: () => reconciliationService.getReconciliationTransactions(reconId),
    enabled: !!reconId && recon?.total_bank_transactions !== undefined && recon.total_bank_transactions > 0,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches', reconId],
    queryFn: () => reconciliationService.getMatches(reconId),
    enabled: !!reconId && (recon?.matched_count ?? 0) > 0,
  });

  const { data: anomalies = [], refetch: refetchAnomalies } = useQuery({
    queryKey: ['anomalies', reconId],
    queryFn: () => reconciliationService.getAnomalies(reconId),
    enabled: !!reconId,
  });

  const matchMutation = useMutation({
    mutationFn: () => reconciliationService.runMatching(reconId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reconciliation', reconId] });
      qc.invalidateQueries({ queryKey: ['matches', reconId] });
      qc.invalidateQueries({ queryKey: ['anomalies', reconId] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (data: { anomaly_id: number; action: ResolveAction; note?: string }) =>
      reconciliationService.resolveAnomaly(data),
    onSuccess: () => {
      refetchAnomalies();
      setResolveModal(null);
      setResolveNote('');
    },
  });

  const exportReport = async () => {
    const blob = await reconciliationService.exportReport(reconId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation-${reconId}-report.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setAiLoading(true);
    try {
      const res = await reconciliationService.copilotChat({ reconciliation_id: reconId, message: msg });
      setChatMessages((prev) => [...prev, { role: 'ai', text: res.message, action: res.suggested_action }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setAiLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const matchRate = recon && recon.total_bank_transactions > 0
    ? Math.round((recon.matched_count / recon.total_bank_transactions) * 100)
    : 0;

  const status = recon ? (STATUS_BADGE[recon.status] ?? { label: recon.status, cls: 'bg-surface-100 text-surface-600' }) : null;

  const unresolvedAnomalies = anomalies.filter((a) => !a.is_resolved);
  const highCount = unresolvedAnomalies.filter((a) => a.severity === 'HIGH').length;
  const medCount = unresolvedAnomalies.filter((a) => a.severity === 'MEDIUM').length;

  if (reconLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-50">
        <RefreshCcw size={24} className="text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!recon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50">
        <p className="text-surface-600 mb-4">Reconciliation not found</p>
        <button onClick={() => navigate('/reconciliations')} className="text-brand-500 hover:underline text-sm">← Back to list</button>
      </div>
    );
  }

  const hasFiles = recon.total_bank_transactions > 0 && recon.total_ledger_transactions > 0;
  const hasMatched = recon.matched_count > 0;

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      {/* ── Page Header ────────────────────────────────── */}
      <div className="bg-white border-b border-surface-200 px-8 py-5">
        <button
          onClick={() => navigate('/reconciliations')}
          className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-800 mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Reconciliations
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-900">Reconciliation #{recon.id}</h1>
              {status && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
                  {status.label}
                </span>
              )}
            </div>
            <p className="text-sm text-surface-500 mt-0.5">
              {format(parseISO(recon.period_start), 'dd MMM')} – {format(parseISO(recon.period_end), 'dd MMM yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportReport}
              disabled={recon.status !== 'completed'}
              className="flex items-center gap-2 px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 disabled:opacity-40 transition-colors"
            >
              <Download size={15} /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <div className="bg-white border-b border-surface-200">
        <div className="grid grid-cols-5 divide-x divide-surface-200">
          {[
            { label: 'Bank Transactions', value: recon.total_bank_transactions, color: 'text-surface-900' },
            { label: 'Ledger Transactions', value: recon.total_ledger_transactions, color: 'text-surface-900' },
            { label: 'Matched', value: recon.matched_count, color: 'text-success-600' },
            { label: 'Unmatched', value: recon.unmatched_bank_count, color: 'text-warning-600' },
            { label: 'Anomalies', value: recon.anomaly_count, color: recon.anomaly_count > 0 ? 'text-danger-600' : 'text-surface-400' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center py-4">
              <p className="text-[11px] uppercase tracking-widest text-surface-400 font-semibold mb-1">{s.label}</p>
              <p className={`text-[22px] font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Workflow Steps ─────────────────────────────── */}
      <div className="bg-white border-b border-surface-200 px-8 py-4">
        <div className="flex items-center gap-6">
          {/* Step 1 */}
          <div className={cn('flex items-center gap-2', hasFiles ? 'opacity-60' : '')}>
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', hasFiles ? 'bg-success-500 text-white' : 'bg-brand-500 text-white')}>
              {hasFiles ? <CheckCircle2 size={14} /> : '1'}
            </div>
            <span className="text-sm font-medium text-surface-700">Upload Files</span>
            <div className="flex gap-2 ml-2">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', recon.total_bank_transactions > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                Bank {recon.total_bank_transactions > 0 ? '✓' : '✗'}
              </span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', recon.total_ledger_transactions > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                Ledger {recon.total_ledger_transactions > 0 ? '✓' : '✗'}
              </span>
            </div>
          </div>

          <ChevronRight size={14} className="text-surface-300" />

          {/* Step 2 */}
          <div className={cn('flex items-center gap-2', !hasFiles ? 'opacity-40' : '')}>
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', hasMatched ? 'bg-success-500 text-white' : 'bg-surface-200 text-surface-600')}>
              {hasMatched ? <CheckCircle2 size={14} /> : '2'}
            </div>
            <span className="text-sm font-medium text-surface-700">Run Matching</span>
          </div>

          <ChevronRight size={14} className="text-surface-300" />

          {/* Step 3 */}
          <div className={cn('flex items-center gap-2', !hasMatched ? 'opacity-40' : '')}>
            <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', recon.anomaly_count === 0 && hasMatched ? 'bg-success-500 text-white' : 'bg-surface-200 text-surface-600')}>
              3
            </div>
            <span className="text-sm font-medium text-surface-700">Review Results</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!hasFiles && (
              <button
                onClick={() => { setUploadType('bank'); setUploadOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-colors"
              >
                <Upload size={14} /> Upload Files
              </button>
            )}
            {hasFiles && !hasMatched && (
              <button
                onClick={() => matchMutation.mutate()}
                disabled={matchMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-md transition-colors animate-pulse-soft"
              >
                <Play size={14} fill="currentColor" />
                {matchMutation.isPending ? 'Running...' : 'Run Matching Engine ▶'}
              </button>
            )}
            {hasMatched && unresolvedAnomalies.length > 0 && (
              <button
                onClick={() => setTab('anomalies')}
                className="flex items-center gap-2 px-4 py-2 bg-warning-500 hover:bg-warning-600 text-white text-sm font-semibold rounded-md transition-colors"
              >
                <AlertTriangle size={14} /> Review Anomalies ({unresolvedAnomalies.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="bg-white border-b border-surface-200 px-8">
        <div className="flex gap-1">
          {([
            { key: 'summary', label: 'Summary & Transactions' },
            { key: 'matches', label: `Matches (${recon.matched_count})` },
            { key: 'anomalies', label: `Anomalies (${recon.anomaly_count})` },
            { key: 'copilot', label: 'AI Copilot' },
          ] as Array<{ key: Tab; label: string }>).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3.5 text-sm font-medium border-b-[3px] transition-colors',
                tab === t.key
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700',
                t.key === 'copilot' && tab !== 'copilot' && 'text-ai-500 hover:text-ai-600',
              )}
            >
              {t.key === 'copilot' && <Sparkles size={13} className="inline mr-1.5 mb-0.5" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      <div className="flex-1 p-8">
        {/* TAB 1: Summary */}
        {tab === 'summary' && (
          <div className="grid grid-cols-2 gap-5 h-[600px]">
            <div className="card flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-surface-800">
                  Bank Statement · {recon.total_bank_transactions} transactions
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {!transactions?.bank_transactions?.length ? (
                  <EmptyFileState type="bank" onUpload={() => { setUploadType('bank'); setUploadOpen(true); }} />
                ) : (
                  transactions.bank_transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={cn(
                        'flex items-center justify-between px-5 py-3 border-b border-surface-100 border-l-[3px] hover:bg-surface-50 transition-colors',
                        tx.is_matched ? 'border-l-success-500 bg-[#FAFFFE]' : 'border-l-warning-500 bg-[#FFFDF5]',
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-surface-800">{tx.description || 'No description'}</p>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {format(parseISO(tx.transaction_date), 'dd MMM yyyy')}
                          {tx.reference && ` · Ref: ${tx.reference}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-sm font-semibold', tx.amount < 0 ? 'text-danger-600' : 'text-success-600')}>
                          {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount).toLocaleString()}
                        </p>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', tx.is_matched ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600')}>
                          {tx.is_matched ? 'Matched' : 'Unmatched'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card flex flex-col overflow-hidden">
              <div className="px-5 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-800">
                  General Ledger · {recon.total_ledger_transactions} transactions
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {!transactions?.ledger_transactions?.length ? (
                  <EmptyFileState type="ledger" onUpload={() => { setUploadType('ledger'); setUploadOpen(true); }} />
                ) : (
                  transactions.ledger_transactions.map((tx) => {
                    const amount = tx.debit || tx.credit;
                    const isDebit = tx.debit > 0;
                    return (
                      <div
                        key={tx.id}
                        className={cn(
                          'flex items-center justify-between px-5 py-3 border-b border-surface-100 border-l-[3px] hover:bg-surface-50 transition-colors',
                          tx.is_matched ? 'border-l-success-500 bg-[#FAFFFE]' : 'border-l-warning-500 bg-[#FFFDF5]',
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium text-surface-800">{tx.description || 'No description'}</p>
                          <p className="text-xs text-surface-400 mt-0.5">
                            {format(parseISO(tx.transaction_date), 'dd MMM yyyy')}
                            {tx.account_code && ` · ${tx.account_code}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn('text-sm font-semibold', isDebit ? 'text-danger-600' : 'text-success-600')}>
                            {isDebit ? '-' : '+'}{amount.toLocaleString()}
                          </p>
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', tx.is_matched ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600')}>
                            {tx.is_matched ? 'Matched' : 'Unmatched'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Matches */}
        {tab === 'matches' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100">
              <h3 className="text-base font-semibold text-surface-800">{matches.length} matches found</h3>
            </div>
            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCcw size={40} className="text-surface-300 mb-3" />
                <p className="text-sm font-semibold text-surface-700">No matches yet</p>
                <p className="text-xs text-surface-400 mt-1">Run the matching engine to see results.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                      {['Bank Transaction', 'Ledger Transaction', 'Match Type', 'Confidence', 'Date Diff'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-surface-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {matches.map((m) => {
                      const conf = Math.round(m.confidence * 100);
                      const confCls = conf >= 95 ? 'bg-success-50 text-success-600' : conf >= 80 ? 'bg-warning-50 text-warning-600' : 'bg-danger-50 text-danger-600';
                      const matchLabel = m.match_type === 'exact' ? 'Exact' : m.match_type === 'fuzzy_amount' ? 'Fuzzy Amount' : 'Fuzzy Description';
                      return (
                        <tr key={m.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-5 py-3 text-sm text-surface-700 font-mono">#{m.bank_transaction_id}</td>
                          <td className="px-5 py-3 text-sm text-surface-700 font-mono">#{m.ledger_transaction_id}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB]">
                              {matchLabel}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${confCls}`}>{conf}%</span>
                          </td>
                          <td className="px-5 py-3 text-sm text-surface-500">
                            {m.audit_trail?.date_diff_days !== undefined ? `${m.audit_trail.date_diff_days} days` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Anomalies */}
        {tab === 'anomalies' && (
          <div className="space-y-4">
            {/* Summary chips */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-danger-50 text-danger-600 border border-danger-100">
                {highCount} HIGH
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-50 text-warning-600 border border-warning-100">
                {medCount} MEDIUM
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                {unresolvedAnomalies.filter((a) => a.severity === 'LOW').length} LOW
              </span>
            </div>

            {anomalies.length === 0 ? (
              <div className="card flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 size={40} className="text-success-400 mb-3" />
                <p className="text-base font-semibold text-surface-700 mb-1">No anomalies detected</p>
                <p className="text-sm text-surface-400">All transactions look normal.</p>
              </div>
            ) : (
              anomalies.map((a) => (
                <AnomalyCard
                  key={a.id}
                  anomaly={a}
                  onResolve={() => setResolveModal(a)}
                  onAskAI={() => {
                    setTab('copilot');
                    setChatInput(`Tell me about the ${a.anomaly_type.toLowerCase()} anomaly (ID ${a.id})`);
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* TAB 4: AI Copilot */}
        {tab === 'copilot' && (
          <div className="grid grid-cols-5 gap-5 h-[600px]">
            {/* Chat */}
            <div className="col-span-3 card flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ai-500 to-[#6366F1] flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-800">AI Copilot</p>
                    <p className="text-[11px] text-surface-400">Powered by Llama 3.1 via Groq</p>
                  </div>
                </div>
                <button
                  onClick={() => setChatMessages([{ role: 'ai', text: "Hello! How can I help you with this reconciliation?" }])}
                  className="text-xs text-surface-400 hover:text-surface-600 transition-colors"
                >
                  Clear conversation
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className="max-w-[72%] space-y-2">
                      <div
                        className={cn(
                          'px-4 py-3 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-brand-500 text-white rounded-[16px_16px_4px_16px]'
                            : 'bg-white border border-surface-200 text-surface-700 rounded-[16px_16px_16px_4px] border-l-[3px] border-l-ai-500',
                        )}
                      >
                        {msg.text}
                      </div>
                      {msg.action && (
                        <div className="bg-ai-50 border border-ai-200 rounded-md p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles size={13} className="text-ai-600" />
                            <span className="text-xs font-bold text-ai-700">Suggested Action</span>
                          </div>
                          <div className="space-y-1 text-xs text-surface-700 mb-3">
                            <p><span className="font-medium">Action:</span> {msg.action.action?.replace(/_/g, ' ')}</p>
                            {msg.action.amount && <p><span className="font-medium">Amount:</span> PKR {msg.action.amount.toLocaleString()}</p>}
                            {msg.action.description && <p><span className="font-medium">Note:</span> {msg.action.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors">
                              Apply Action
                            </button>
                            <button className="px-3 py-1.5 border border-surface-200 text-surface-600 text-xs font-medium rounded-md hover:bg-surface-50 transition-colors">
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-surface-400">
                    <div className="flex gap-1">
                      {[0,1,2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-ai-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-5 pt-3 border-t border-surface-100 flex gap-2 flex-wrap">
                {['Show all anomalies', "What's unmatched?", 'Help me export'].map((p) => (
                  <button
                    key={p}
                    onClick={() => { setChatInput(p); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-surface-200 text-surface-600 hover:bg-surface-50 hover:border-brand-300 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 flex items-end gap-2">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Ask about this reconciliation..."
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-md border border-surface-200 text-sm resize-none focus:outline-none focus:border-ai-500 focus:ring-2 focus:ring-ai-500/20 transition-all"
                />
                <button
                  onClick={sendChat}
                  disabled={!chatInput.trim() || aiLoading}
                  className="w-9 h-9 flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-md transition-colors flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="px-5 pb-3 text-[11px] text-surface-400">
                AI may make mistakes. Always verify before applying actions.
              </p>
            </div>

            {/* Context panel */}
            <div className="col-span-2 space-y-4">
              <div className="card p-5">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-surface-400 mb-3">Context</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Period</span>
                    <span className="text-surface-800 font-medium">
                      {format(parseISO(recon.period_start), 'dd MMM')} – {format(parseISO(recon.period_end), 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Status</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status?.cls}`}>{status?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Match Rate</span>
                    <span className="font-semibold text-success-600">{matchRate}%</span>
                  </div>
                </div>
              </div>

              {unresolvedAnomalies.length > 0 && (
                <div className="card p-5">
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-surface-400 mb-3">Unresolved Anomalies</p>
                  <div className="space-y-2">
                    {unresolvedAnomalies.slice(0, 4).map((a) => (
                      <div key={a.id} className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${SEVERITY_DOT[a.severity]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-surface-700 truncate">{a.anomaly_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-surface-400 truncate">{a.description}</p>
                        </div>
                        <button
                          onClick={() => { setTab('anomalies'); }}
                          className="text-xs text-brand-500 hover:text-brand-600 flex-shrink-0"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── File Upload Dialog ────────────────────────── */}
      <FileUploadDialog
        open={uploadOpen}
        type={uploadType}
        reconciliationId={reconId}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          setUploadOpen(false);
          qc.invalidateQueries({ queryKey: ['reconciliation', reconId] });
          qc.invalidateQueries({ queryKey: ['transactions', reconId] });
        }}
      />

      {/* ── Resolve Modal ─────────────────────────────── */}
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
              {/* Summary box */}
              <div className="p-4 bg-surface-50 rounded-lg border border-surface-200 text-sm space-y-1">
                <p><span className="text-surface-500">Type:</span> <span className="font-semibold">{resolveModal.anomaly_type.replace(/_/g, ' ')}</span></p>
                <p><span className="text-surface-500">Severity:</span> <span className={cn('font-semibold', resolveModal.severity === 'HIGH' ? 'text-danger-600' : resolveModal.severity === 'MEDIUM' ? 'text-warning-600' : 'text-[#2563EB]')}>{resolveModal.severity}</span></p>
                <p className="text-surface-600">{resolveModal.description}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {([
                  { value: 'create_journal_entry', label: 'Create Journal Entry', desc: 'Post a compensating entry to the ledger to correct the balance' },
                  { value: 'delete_duplicate', label: 'Delete Duplicate', desc: 'Remove the duplicate ledger transaction (soft delete)' },
                  { value: 'manual_review', label: 'Flag for Manual Review', desc: 'Mark as reviewed and leave for the accounting team' },
                  { value: 'reverse_transaction', label: 'Reverse Transaction', desc: 'Flag this transaction for reversal' },
                ] as Array<{ value: ResolveAction; label: string; desc: string }>).map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      resolveAction === opt.value ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:bg-surface-50',
                    )}
                  >
                    <input
                      type="radio"
                      name="resolve"
                      value={opt.value}
                      checked={resolveAction === opt.value}
                      onChange={() => setResolveAction(opt.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-surface-800">{opt.label}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Notes (optional)</label>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Add a note for audit trail..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-surface-200 text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface-200">
              <button
                onClick={() => setResolveModal(null)}
                className="px-4 py-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveMutation.mutate({ anomaly_id: resolveModal.id, action: resolveAction, note: resolveNote || undefined })}
                disabled={resolveMutation.isPending}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold rounded-md transition-colors"
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

/* ── Sub-components ───────────────────────────────────────────────── */

const AnomalyCard: React.FC<{
  anomaly: Anomaly;
  onResolve: () => void;
  onAskAI: () => void;
}> = ({ anomaly, onResolve, onAskAI }) => {
  const resolved = anomaly.is_resolved;
  const borderCls = SEVERITY_CLS[anomaly.severity] ?? '';

  return (
    <div className={cn('card border-l-4 p-5 transition-opacity', borderCls, resolved && 'opacity-60')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', SEVERITY_DOT[anomaly.severity])} />
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            anomaly.severity === 'HIGH' ? 'bg-danger-50 text-danger-600' :
            anomaly.severity === 'MEDIUM' ? 'bg-warning-50 text-warning-600' :
            'bg-[#EFF6FF] text-[#2563EB]',
          )}>{anomaly.severity}</span>
          <span className="text-xs font-semibold text-surface-600 bg-surface-100 px-2 py-0.5 rounded-full">
            {anomaly.anomaly_type.replace(/_/g, ' ')}
          </span>
        </div>
        <span className={cn(
          'text-xs font-medium px-2.5 py-1 rounded-full',
          resolved ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600',
        )}>
          {resolved ? 'Resolved' : 'Unresolved'}
        </span>
      </div>

      <p className="text-sm text-surface-800 mb-1 font-medium">{anomaly.description}</p>

      {(anomaly.bank_transaction_id || anomaly.ledger_transaction_id) && (
        <div className="text-xs text-surface-400 mb-3">
          {anomaly.bank_transaction_id && <span>Bank Txn #{anomaly.bank_transaction_id} · </span>}
          {anomaly.ledger_transaction_id && <span>Ledger Txn #{anomaly.ledger_transaction_id}</span>}
        </div>
      )}

      {!resolved && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={onAskAI}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ai-50 hover:bg-ai-100 text-ai-600 text-xs font-semibold rounded-md transition-colors border border-ai-200"
          >
            <Sparkles size={12} /> Ask AI Copilot
          </button>
          <button
            onClick={onResolve}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Resolve →
          </button>
        </div>
      )}

      {resolved && anomaly.resolution_action && (
        <p className="text-xs text-surface-400 mt-2">
          Resolved via: <span className="font-medium">{anomaly.resolution_action.replace(/_/g, ' ')}</span>
          {anomaly.resolution_note && ` · "${anomaly.resolution_note}"`}
        </p>
      )}
    </div>
  );
};

const EmptyFileState: React.FC<{ type: 'bank' | 'ledger'; onUpload: () => void }> = ({ type, onUpload }) => (
  <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
    <FileText size={32} className="text-surface-300 mb-3" />
    <p className="text-sm font-medium text-surface-600 mb-1">
      No {type === 'bank' ? 'bank statement' : 'ledger file'} uploaded
    </p>
    <button
      onClick={onUpload}
      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md"
    >
      <Upload size={12} /> Upload {type === 'bank' ? 'Bank Statement' : 'Ledger File'}
    </button>
  </div>
);

export default ReconciliationDetail;
