import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RefreshCcw, DollarSign, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Plus, ExternalLink, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { reconciliationService } from '../services/reconciliation';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../hooks/useOrganizations';
import { format, parseISO } from 'date-fns';
import PageHeader from '../components/layout/PageHeader';
import NewReconciliationDialog from '../components/NewReconciliationDialog';
import { cn } from '../utils';

const CHART_DATA = [
  { month: 'Oct', bank: 820000, ledger: 800000 },
  { month: 'Nov', bank: 950000, ledger: 930000 },
  { month: 'Dec', bank: 1100000, ledger: 1080000 },
  { month: 'Jan', bank: 880000, ledger: 860000 },
  { month: 'Feb', bank: 1050000, ledger: 1020000 },
  { month: 'Mar', bank: 1200000, ledger: 1170000 },
  { month: 'Apr', bank: 1380000, ledger: 1350000 },
];

const ANOMALY_DATA = [
  { name: 'Duplicate', value: 32, color: '#EF4444' },
  { name: 'Missing', value: 25, color: '#F59E0B' },
  { name: 'Timing', value: 21, color: '#3B82F6' },
  { name: 'Outlier', value: 14, color: '#8B5CF6' },
  { name: 'Suspicious', value: 8, color: '#10B981' },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-surface-100 text-surface-600' },
  in_progress: { label: 'In Progress', cls: 'bg-[#EFF6FF] text-[#2563EB]' },
  completed: { label: 'Completed', cls: 'bg-success-50 text-success-600' },
  failed: { label: 'Failed', cls: 'bg-danger-50 text-danger-600' },
};

const PKR = (n: number) =>
  new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(n);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useAuth();
  useOrganizations();
  const [openNewRecon, setOpenNewRecon] = useState(false);
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');

  const { data: reconciliations = [], isLoading: reconLoading } = useQuery({
    queryKey: ['reconciliations', activeOrgId],
    queryFn: () => reconciliationService.listReconciliations({ org_id: activeOrgId ?? undefined }),
    enabled: !!activeOrgId,
  });

  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bankAccounts', activeOrgId],
    queryFn: () => reconciliationService.getBankAccounts(activeOrgId!),
    enabled: !!activeOrgId,
  });

  const totalRecons = reconciliations.length;
  const activeAnomalies = reconciliations.reduce((s, r) => s + (r.anomaly_count || 0), 0);
  const totalUnmatched = reconciliations.reduce((s, r) => s + r.unmatched_bank_count, 0);
  const avgMatchRate =
    reconciliations.length > 0
      ? Math.round(
          reconciliations.reduce((s, r) => {
            const total = r.total_bank_transactions;
            return s + (total > 0 ? (r.matched_count / total) * 100 : 0);
          }, 0) / reconciliations.length,
        )
      : 0;

  const today = new Date();
  const dateLabel = format(today, 'EEE, dd MMM yyyy');

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Dashboard"
        subtitle={dateLabel}
        actions={
          <button
            onClick={() => setOpenNewRecon(true)}
            disabled={bankAccounts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-md transition-all"
          >
            <Plus size={15} /> New Reconciliation
          </button>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* ── KPI Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-5">
          <KpiCard
            label="Total Reconciliations"
            value={totalRecons.toString()}
            trend="+3 this month"
            trendUp
            icon={<RefreshCcw size={20} />}
            iconBg="bg-brand-50"
            iconColor="text-brand-600"
            loading={reconLoading}
          />
          <KpiCard
            label="Unmatched Transactions"
            value={PKR(totalUnmatched)}
            trend="-8.2% from last month"
            trendUp
            icon={<DollarSign size={20} />}
            iconBg="bg-warning-50"
            iconColor="text-warning-600"
            loading={reconLoading}
          />
          <KpiCard
            label="Active Anomalies"
            value={activeAnomalies.toString()}
            trend="2 High, 1 Medium"
            trendUp={false}
            valueColor={activeAnomalies > 0 ? 'text-danger-600' : undefined}
            icon={<AlertTriangle size={20} />}
            iconBg="bg-danger-50"
            iconColor="text-danger-600"
            loading={reconLoading}
          />
          <KpiCard
            label="Avg Match Rate"
            value={`${avgMatchRate}%`}
            trend="+4.2% from last month"
            trendUp
            valueColor={avgMatchRate > 0 ? 'text-success-600' : undefined}
            icon={<TrendingUp size={20} />}
            iconBg="bg-success-50"
            iconColor="text-success-600"
            loading={reconLoading}
          />
        </div>

        {/* ── Charts Row ────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-5">
          {/* Area Chart */}
          <div className="col-span-8 card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-surface-800">Cash Balance Over Time</h2>
              <div className="flex gap-1 bg-surface-100 p-0.5 rounded-md">
                {(['7D','30D','90D','1Y'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded transition-colors',
                      period === p ? 'bg-white text-surface-800 shadow-xs' : 'text-surface-500 hover:text-surface-700',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bankGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D60FF" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2D60FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ledgerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13 }}
                  formatter={(v: any) => [`PKR ${PKR(Number(v))}`]}
                />
                <Area type="monotone" dataKey="bank" stroke="#2D60FF" strokeWidth={2} fill="url(#bankGrad)" name="Bank Balance" />
                <Area type="monotone" dataKey="ledger" stroke="#10B981" strokeWidth={2} fill="url(#ledgerGrad)" name="Ledger Balance" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart */}
          <div className="col-span-4 card p-6">
            <h2 className="text-base font-semibold text-surface-800 mb-4">Anomalies by Type</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ANOMALY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ANOMALY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {ANOMALY_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-surface-600">{d.name}</span>
                  </div>
                  <span className="text-surface-800 font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Reconciliations ─────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-100">
            <h2 className="text-base font-semibold text-surface-800">Recent Reconciliations</h2>
            <button
              onClick={() => navigate('/reconciliations')}
              className="flex items-center gap-1 text-sm text-brand-500 hover:text-brand-600 font-medium"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {reconLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : reconciliations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCcw size={40} className="text-surface-300 mb-3" />
              <p className="text-base font-semibold text-surface-700 mb-1">No reconciliations yet</p>
              <p className="text-sm text-surface-400 mb-5">Create your first reconciliation to get started.</p>
              <button
                onClick={() => setOpenNewRecon(true)}
                disabled={bankAccounts.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-semibold rounded-md"
              >
                <Plus size={14} /> New Reconciliation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200">
                    {['#ID', 'Period', 'Transactions', 'Matched', 'Match Rate', 'Anomalies', 'Status', ''].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {reconciliations.slice(0, 5).map((r) => {
                    const rate = r.total_bank_transactions > 0
                      ? Math.round((r.matched_count / r.total_bank_transactions) * 100)
                      : 0;
                    const status = STATUS_MAP[r.status] ?? { label: r.status, cls: 'bg-surface-100 text-surface-600' };
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-surface-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/reconciliations/${r.id}`)}
                      >
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-brand-600">#{r.id}</td>
                        <td className="px-6 py-4 text-sm text-surface-700">
                          {format(parseISO(r.period_start), 'dd MMM')} – {format(parseISO(r.period_end), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-700">
                          {r.total_bank_transactions} / {r.total_ledger_transactions}
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-700">{r.matched_count}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                              <div className="h-full bg-success-500 rounded-full" style={{ width: `${rate}%` }} />
                            </div>
                            <span className="text-sm text-surface-700 font-medium">{rate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {r.anomaly_count > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-semibold bg-danger-50 text-danger-600 rounded-full">
                              {r.anomaly_count}
                            </span>
                          ) : (
                            <span className="text-surface-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/reconciliations/${r.id}`); }}
                            className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 font-medium"
                          >
                            View <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <NewReconciliationDialog
        open={openNewRecon}
        bankAccounts={bankAccounts}
        onClose={() => setOpenNewRecon(false)}
        onCreated={(r) => { setOpenNewRecon(false); navigate(`/reconciliations/${r.id}`); }}
      />
    </div>
  );
};

/* ── KPI Card ──────────────────────────────────────────────────────── */
interface KpiCardProps {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  loading?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, trend, trendUp, icon, iconBg, iconColor, valueColor, loading }) => (
  <div className="card card-hover p-5">
    {loading ? (
      <div className="space-y-3">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-16" />
        <div className="skeleton h-3 w-20" />
      </div>
    ) : (
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-surface-500 font-medium mb-1.5">{label}</p>
          <p className={cn('text-[28px] font-bold leading-none mb-2', valueColor ?? 'text-surface-900')}>
            {value}
          </p>
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendUp ? 'text-success-600' : 'text-surface-400')}>
            {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend}
          </div>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', iconBg, iconColor)}>
          {icon}
        </div>
      </div>
    )}
  </div>
);

export default Dashboard;
