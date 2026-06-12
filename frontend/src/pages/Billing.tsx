import React, { useState } from 'react';
import {
  CreditCard, CheckCircle2, Zap, Building2, Crown,
  Download, Plus, Trash2, AlertCircle, ArrowRight,
  Calendar, Receipt, TrendingUp, Users, RefreshCcw,
  Shield, Star,
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { cn } from '../utils';

/* ─── Types ────────────────────────────────────────────────────────────── */
type PlanKey = 'starter' | 'professional' | 'enterprise';
type BillingCycle = 'monthly' | 'annual';

interface Plan {
  key: PlanKey;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  desc: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  limits: { orgs: string; transactions: string; users: string };
  badge?: string;
}

interface PaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    desc: 'Perfect for individuals getting started with reconciliation.',
    icon: <Zap size={20} />,
    color: 'text-surface-600',
    features: [
      '1 organization',
      '100 transactions/month',
      '3-phase matching',
      'Basic anomaly detection',
      'Email support',
    ],
    limits: { orgs: '1', transactions: '100/mo', users: '1' },
  },
  {
    key: 'professional',
    name: 'Professional',
    monthlyPrice: 49,
    annualPrice: 39,
    desc: 'For growing finance teams that need power and intelligence.',
    icon: <TrendingUp size={20} />,
    color: 'text-brand-600',
    badge: 'Most Popular',
    features: [
      '5 organizations',
      '10,000 transactions/month',
      'ML anomaly detection',
      'AI Copilot (unlimited)',
      'Color-coded audit exports',
      'Priority support',
      'API access',
    ],
    limits: { orgs: '5', transactions: '10K/mo', users: '10' },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 199,
    annualPrice: 159,
    desc: 'Unlimited scale with SLA, SSO, and a dedicated success manager.',
    icon: <Crown size={20} />,
    color: 'text-ai-600',
    features: [
      'Unlimited organizations',
      'Unlimited transactions',
      'All Professional features',
      'Role-based access control',
      'SSO / SAML integration',
      'Dedicated CSM',
      '99.9% uptime SLA',
      'Custom integrations',
    ],
    limits: { orgs: 'Unlimited', transactions: 'Unlimited', users: 'Unlimited' },
  },
];

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2027, isDefault: true },
  { id: 'pm_2', brand: 'mastercard', last4: '5555', expMonth: 8, expYear: 2026, isDefault: false },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2025-006', date: 'Jun 1, 2025', description: 'Professional Plan — June 2025', amount: 49, status: 'paid' },
  { id: 'INV-2025-005', date: 'May 1, 2025', description: 'Professional Plan — May 2025', amount: 49, status: 'paid' },
  { id: 'INV-2025-004', date: 'Apr 1, 2025', description: 'Professional Plan — April 2025', amount: 49, status: 'paid' },
  { id: 'INV-2025-003', date: 'Mar 1, 2025', description: 'Professional Plan — March 2025', amount: 49, status: 'paid' },
  { id: 'INV-2025-002', date: 'Feb 1, 2025', description: 'Starter Plan — February 2025', amount: 0, status: 'paid' },
  { id: 'INV-2025-001', date: 'Jan 1, 2025', description: 'Starter Plan — January 2025', amount: 0, status: 'paid' },
];

/* ─── Card brand SVGs ────────────────────────────────────────────────────── */
const CardBrand: React.FC<{ brand: PaymentMethod['brand'] }> = ({ brand }) => {
  if (brand === 'visa') {
    return (
      <svg width="38" height="24" viewBox="0 0 38 24" fill="none" className="flex-shrink-0">
        <rect width="38" height="24" rx="4" fill="#1A1F71"/>
        <path d="M15.7 16H13.5l1.4-8.5h2.2L15.7 16zm7.1-8.3c-.4-.2-1.1-.3-1.9-.3-2.1 0-3.6 1.1-3.6 2.7 0 1.2 1.1 1.8 1.9 2.2.8.4 1.1.7 1.1 1.1 0 .6-.7.9-1.3.9-.9 0-1.3-.1-2-.4l-.3-.1-.3 1.8c.5.2 1.4.4 2.3.4 2.2 0 3.7-1.1 3.7-2.8 0-.9-.6-1.6-1.8-2.2-.8-.4-1.2-.6-1.2-1 0-.3.4-.7 1.2-.7.7 0 1.2.1 1.6.3l.2.1.3-1.8zm5.5-.2h-1.6c-.5 0-.9.1-1.1.6l-3.1 7.9h2.2l.4-1.2h2.7l.2 1.2H29l-1.7-8.5zm-2.6 5.5l.8-2.2.2-.6.1.6.4 2.2h-1.5zm-12.5-5.5h-2.1l-2.1 5.8-.2-1.1c-.4-1.2-1.6-2.6-2.9-3.2l1.9 7h2.2l3.4-8.5h-2.2z" fill="white"/>
      </svg>
    );
  }
  if (brand === 'mastercard') {
    return (
      <svg width="38" height="24" viewBox="0 0 38 24" fill="none" className="flex-shrink-0">
        <rect width="38" height="24" rx="4" fill="#252525"/>
        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path d="M19 6.8A7 7 0 0122.2 12 7 7 0 0119 17.2 7 7 0 0115.8 12 7 7 0 0119 6.8z" fill="#FF5F00"/>
      </svg>
    );
  }
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" className="flex-shrink-0">
      <rect width="38" height="24" rx="4" fill="#2E77BC"/>
      <text x="19" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AMEX</text>
    </svg>
  );
};

/* ─── Components ─────────────────────────────────────────────────────────── */
const AddCardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0,2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => { setSaving(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[460px] animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <CreditCard size={16} className="text-brand-600" />
            </div>
            <h2 className="text-base font-bold text-surface-900">Add Payment Method</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Card preview */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1A3FCC, #2D60FF, #818CF8)' }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
              style={{ background: 'white' }} />
            <div className="flex items-start justify-between mb-8">
              <div className="w-10 h-7 rounded-md bg-warning-400/80 border border-warning-300/50" />
              <svg width="36" height="22" viewBox="0 0 36 22" fill="none">
                <circle cx="12" cy="11" r="10" fill="rgba(255,255,255,0.4)"/>
                <circle cx="24" cy="11" r="10" fill="rgba(255,255,255,0.25)"/>
              </svg>
            </div>
            <p className="text-white/90 font-mono text-base tracking-[0.2em] mb-4">
              {cardNumber || '•••• •••• •••• ••••'}
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Card Holder</p>
                <p className="text-sm font-semibold text-white">{name || 'Your Name'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Expires</p>
                <p className="text-sm font-semibold text-white">{expiry || 'MM/YY'}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Cardholder Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Muhammad Nabeel" required
              className="w-full h-10 px-3.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all" />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Card Number</label>
            <div className="relative">
              <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456" required maxLength={19}
                className="w-full h-10 pl-3.5 pr-12 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all" />
              <CreditCard size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Expiry Date</label>
              <input type="text" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY" required maxLength={5}
                className="w-full h-10 px-3.5 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">CVV</label>
              <input type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                placeholder="•••" required maxLength={4}
                className="w-full h-10 px-3.5 rounded-xl border border-surface-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 border border-surface-200">
            <Shield size={14} className="text-success-500 flex-shrink-0" />
            <p className="text-xs text-surface-500">Your card details are encrypted and stored securely via Stripe.</p>
          </div>

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20">
              {saving ? 'Saving...' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Billing Page ──────────────────────────────────────────────────── */
const BillingPage: React.FC = () => {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [currentPlan] = useState<PlanKey>('professional');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [showAddCard, setShowAddCard] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  const currentPlanData = PLANS.find(p => p.key === currentPlan)!;

  const handleUpgrade = (planKey: PlanKey) => {
    if (planKey === currentPlan) return;
    setUpgradeSuccess(`Successfully switched to ${PLANS.find(p => p.key === planKey)?.name} plan!`);
    setTimeout(() => setUpgradeSuccess(''), 4000);
  };

  const handleRemoveCard = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your plan, payment methods, and billing history"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-surface-700 rounded-xl border border-surface-200 hover:bg-white hover:shadow-xs transition-all">
            <Download size={14} /> Download All Invoices
          </button>
        }
      />

      <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-5xl">

        {/* ── Success Toast ────────────────────────────────────────── */}
        {upgradeSuccess && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-success-50 border border-success-200 animate-slide-up">
            <CheckCircle2 size={18} className="text-success-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-success-700">{upgradeSuccess}</p>
          </div>
        )}

        {/* ── Current Plan Card ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-xs overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                {currentPlanData.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-surface-900">{currentPlanData.name} Plan</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Active</span>
                </div>
                <p className="text-xs text-surface-500 mt-0.5">
                  ${currentPlanData.monthlyPrice}/month · Next billing date: Jul 1, 2025
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-xl border border-brand-200 transition-colors">
              Manage Plan <ArrowRight size={14} />
            </button>
          </div>

          {/* Usage stats */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Organizations', used: 2, limit: 5, icon: <Building2 size={15} />, color: 'bg-brand-500' },
              { label: 'Transactions this month', used: 3847, limit: 10000, icon: <RefreshCcw size={15} />, color: 'bg-success-500' },
              { label: 'Team Members', used: 3, limit: 10, icon: <Users size={15} />, color: 'bg-ai-500' },
            ].map((s) => {
              const pct = Math.round((s.used / s.limit) * 100);
              const isHigh = pct >= 80;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-600">
                      <span className="text-surface-400">{s.icon}</span>
                      {s.label}
                    </div>
                    <span className={cn('text-xs font-bold', isHigh ? 'text-warning-600' : 'text-surface-500')}>
                      {typeof s.used === 'number' && s.used > 999
                        ? `${(s.used/1000).toFixed(1)}K` : s.used} / {s.limit >= 10000 ? `${s.limit/1000}K` : s.limit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', isHigh ? 'bg-warning-500' : s.color)}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-surface-400 mt-1">{pct}% of limit used</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Plans ──────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-surface-900">Subscription Plans</h3>
              <p className="text-sm text-surface-500 mt-0.5">Upgrade or downgrade your plan at any time</p>
            </div>
            {/* Billing toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-0.5 bg-surface-100 rounded-xl border border-surface-200">
                {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
                  <button key={c} onClick={() => setCycle(c)}
                    className={cn(
                      'px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize',
                      cycle === c ? 'bg-white text-surface-900 shadow-xs' : 'text-surface-500',
                    )}>
                    {c}
                  </button>
                ))}
              </div>
              {cycle === 'annual' && (
                <span className="text-xs font-bold text-success-600 bg-success-50 px-2.5 py-1 rounded-full border border-success-200">
                  Save 20%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const price = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              const isActive = plan.key === currentPlan;

              return (
                <div key={plan.key}
                  className={cn(
                    'relative rounded-2xl p-6 border transition-all',
                    isActive
                      ? 'border-brand-500 shadow-lg shadow-brand-500/10 bg-gradient-to-br from-brand-50 to-white'
                      : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-md',
                  )}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white shadow-lg">
                        <Star size={10} fill="white" /> {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', {
                    'bg-surface-100 text-surface-600': plan.key === 'starter',
                    'bg-brand-100 text-brand-600': plan.key === 'professional',
                    'bg-ai-100 text-ai-600': plan.key === 'enterprise',
                  })}>
                    {plan.icon}
                  </div>

                  <p className="text-sm font-bold text-surface-600 mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-extrabold text-surface-900">
                      {price === 0 ? 'Free' : `$${price}`}
                    </span>
                    {price > 0 && <span className="text-sm text-surface-400">/mo</span>}
                  </div>
                  <p className="text-xs text-surface-500 mb-5 leading-relaxed">{plan.desc}</p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5">
                        <CheckCircle2 size={13} className="text-success-500 flex-shrink-0" />
                        <span className="text-xs text-surface-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={isActive}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-sm font-bold transition-all',
                      isActive
                        ? 'bg-brand-500 text-white cursor-default shadow-md shadow-brand-500/20'
                        : 'border border-surface-200 text-surface-700 hover:bg-surface-50 hover:border-surface-300 hover:-translate-y-0.5',
                    )}
                  >
                    {isActive ? '✓ Current Plan' : plan.key === 'enterprise' ? 'Contact Sales' : 'Switch Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Payment Methods ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-xs">
          <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">Payment Methods</h3>
              <p className="text-xs text-surface-500 mt-0.5">Manage your saved cards and billing details</p>
            </div>
            <button onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-all shadow-md shadow-brand-500/20 hover:-translate-y-0.5">
              <Plus size={14} /> Add Card
            </button>
          </div>

          <div className="p-6 space-y-3">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-10">
                <CreditCard size={32} className="mx-auto text-surface-300 mb-3" />
                <p className="text-sm font-semibold text-surface-500 mb-1">No payment methods</p>
                <p className="text-xs text-surface-400">Add a card to enable paid features</p>
              </div>
            ) : (
              paymentMethods.map((pm) => (
                <div key={pm.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-surface-200 hover:border-surface-300 transition-all bg-surface-50/30">
                  <CardBrand brand={pm.brand} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-surface-800 capitalize">
                        {pm.brand} ending in {pm.last4}
                      </p>
                      {pm.isDefault && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">
                      Expires {pm.expMonth.toString().padStart(2, '0')}/{pm.expYear}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <button onClick={() => handleSetDefault(pm.id)}
                        className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                        Set default
                      </button>
                    )}
                    <button onClick={() => handleRemoveCard(pm.id)}
                      className="p-2 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="flex items-center gap-2 pt-2">
              <Shield size={13} className="text-surface-400" />
              <p className="text-xs text-surface-400">
                Card details are encrypted and processed securely. We never store full card numbers.
              </p>
            </div>
          </div>
        </div>

        {/* ── Billing History ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-xs">
          <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100">
            <div>
              <h3 className="text-base font-bold text-surface-900">Billing History</h3>
              <p className="text-xs text-surface-500 mt-0.5">View and download past invoices</p>
            </div>
          </div>

          <div className="divide-y divide-surface-100">
            {MOCK_INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-50/50 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <Receipt size={15} className="text-surface-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 truncate">{inv.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar size={11} className="text-surface-400" />
                    <span className="text-xs text-surface-400">{inv.date}</span>
                    <span className="text-surface-300">·</span>
                    <span className="text-xs font-mono text-surface-400">{inv.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-surface-800">
                    {inv.amount === 0 ? 'Free' : `$${inv.amount}`}
                  </span>
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full',
                    inv.status === 'paid' ? 'bg-success-100 text-success-700' :
                    inv.status === 'pending' ? 'bg-warning-100 text-warning-700' : 'bg-danger-100 text-danger-700',
                  )}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </span>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-surface-400 hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Download size={12} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-surface-100 bg-surface-50/30">
            <p className="text-xs text-surface-400 flex items-center gap-1.5">
              <AlertCircle size={12} />
              Invoices are also sent automatically to your registered email address.
            </p>
          </div>
        </div>

        {/* ── Danger Zone ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-danger-200 shadow-xs">
          <div className="px-6 py-5 border-b border-danger-100">
            <h3 className="text-base font-bold text-danger-700">Danger Zone</h3>
            <p className="text-xs text-danger-500 mt-0.5">Irreversible billing actions</p>
          </div>
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-surface-800">Cancel Subscription</p>
              <p className="text-xs text-surface-500 mt-0.5">
                Your account will be downgraded to the Starter plan at the end of the billing period.
              </p>
            </div>
            <button className="px-4 py-2 border border-danger-300 text-danger-600 hover:bg-danger-50 text-sm font-semibold rounded-xl transition-colors">
              Cancel Plan
            </button>
          </div>
        </div>
      </div>

      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}
    </div>
  );
};

export default BillingPage;
