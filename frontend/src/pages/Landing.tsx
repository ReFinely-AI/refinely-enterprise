import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Brain, Bot, FileDown, ArrowRight, Play,
  Sparkles, ChevronRight, Star, Upload, RefreshCcw,
  Shield, Zap, BarChart3, CheckCircle2, TrendingUp,
  Clock, Users, Award, Menu, X,
} from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for individuals and small teams getting started.',
    features: ['1 organization', '100 transactions/month', 'Basic 3-phase matching', 'Email support'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    desc: 'For growing finance teams that need power and scale.',
    features: ['5 organizations', '10,000 transactions/month', 'ML anomaly detection', 'AI Copilot', 'Excel audit export', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/mo',
    desc: 'Unlimited scale with dedicated support and SLA.',
    features: ['Unlimited organizations', 'Unlimited transactions', 'All Pro features', 'Role-based access', 'SSO / SAML', 'Dedicated CSM', '99.9% SLA'],
    cta: 'Contact sales',
    highlight: false,
  },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050B18] text-white font-sans overflow-x-hidden">

      {/* ── Sticky Nav ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/[0.06]"
        style={{ background: 'rgba(5,11,24,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Refinely" className="h-8 w-auto" />
          <span className="text-lg font-bold tracking-tight">Refinely</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}
            className="hidden md:block px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
            Sign In
          </button>
          <button onClick={() => navigate('/signup')}
            className="px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-500/20">
            Get Started →
          </button>
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(p => !p)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-16" style={{ background: 'rgba(5,11,24,0.97)' }}>
          <div className="flex flex-col gap-4 p-8 text-lg">
            {['Features', 'How it works', 'Pricing'].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                className="text-white/70 hover:text-white transition-colors py-2 border-b border-white/10"
                onClick={() => setMobileMenuOpen(false)}>
                {l}
              </a>
            ))}
            <button onClick={() => navigate('/login')} className="mt-4 text-left text-white/70">Sign In</button>
            <button onClick={() => navigate('/signup')}
              className="mt-2 px-6 py-3 bg-brand-500 rounded-lg font-semibold w-fit">
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative flex items-center min-h-screen pt-20 px-6 max-w-7xl mx-auto gap-12">

        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.12] blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2D60FF, transparent 70%)' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Left */}
        <div className="relative flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ai-500/30 bg-ai-500/10 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-ai-400 animate-pulse" />
            <span className="text-xs font-semibold text-ai-300 tracking-wide">AI-Powered Financial Reconciliation Platform</span>
          </div>

          <h1 className="text-[58px] font-extrabold leading-[1.08] mb-6 tracking-tight">
            Close your books<br />
            faster with{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-brand-400 via-ai-400 to-brand-300 bg-clip-text text-transparent">
                AI precision.
              </span>
            </span>
          </h1>

          <p className="text-lg text-white/55 leading-relaxed mb-9 max-w-xl">
            Automated 3-phase transaction matching, ML anomaly detection, and an AI
            copilot that resolves discrepancies before your auditors do.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-7 py-3.5 bg-brand-500 hover:bg-brand-600 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-xl shadow-brand-500/30">
              Get started free <ArrowRight size={16} />
            </button>
            <button className="flex items-center gap-2 px-7 py-3.5 border border-white/15 rounded-xl font-medium text-sm text-white/75 hover:bg-white/5 hover:border-white/25 transition-all">
              <Play size={14} fill="currentColor" className="text-white/60" /> Watch demo
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {['#2D60FF','#10B981','#F59E0B','#EF4444','#8B5CF6'].map((c, i) => (
                <div key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#050B18] flex items-center justify-center text-xs font-bold text-white shadow-md"
                  style={{ backgroundColor: c }}>
                  {['S','A','M','J','K'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#F59E0B" className="text-warning-500" />)}
              </div>
              <span className="text-sm text-white/45">Trusted by 50+ finance teams worldwide</span>
            </div>
          </div>
        </div>

        {/* Right — product mockup */}
        <div className="relative hidden lg:flex flex-1 justify-center items-center">
          <div className="relative w-full max-w-[560px]">
            {/* Glow behind mockup */}
            <div className="absolute inset-0 -m-6 rounded-3xl opacity-20 blur-2xl"
              style={{ background: 'linear-gradient(135deg, #2D60FF, #8B5CF6)' }} />

            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(20px)' }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="mx-auto w-48 h-5 rounded-md bg-white/8 flex items-center justify-center gap-1.5 px-2">
                    <Shield size={9} className="text-success-500" />
                    <span className="text-[10px] text-white/40 font-mono">app.refinely.io</span>
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* KPI row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Reconciliations', val: '24', color: 'from-brand-500/20 to-brand-500/5', dot: '#2D60FF' },
                    { label: 'Match Rate', val: '94.2%', color: 'from-success-500/20 to-success-500/5', dot: '#10B981' },
                    { label: 'Anomalies', val: '3', color: 'from-danger-500/20 to-danger-500/5', dot: '#EF4444' },
                    { label: 'Time Saved', val: '8 hrs', color: 'from-ai-500/20 to-ai-500/5', dot: '#8B5CF6' },
                  ].map((c) => (
                    <div key={c.label} className={`rounded-xl p-3 bg-gradient-to-br ${c.color} border border-white/5`}>
                      <div className="flex items-center gap-1 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
                        <p className="text-[9px] text-white/40 uppercase tracking-wider">{c.label}</p>
                      </div>
                      <p className="text-base font-bold text-white">{c.val}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="rounded-xl border border-white/8 p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/40 font-medium">Match Rate Trend</span>
                    <span className="text-[9px] text-success-400 font-semibold">↑ 6.2% this month</span>
                  </div>
                  <div className="h-20 flex items-end gap-1 px-1">
                    {[52,61,48,73,64,82,69,88,74,91,78,94].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: i === 11
                            ? 'linear-gradient(to top, #2D60FF, #818CF8)'
                            : 'rgba(45,96,255,0.35)',
                        }} />
                    ))}
                  </div>
                </div>

                {/* Transaction list */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Recent Transactions</span>
                  </div>
                  {[
                    { ref: 'TXN-2891', amt: 'PKR 48,000', status: 'Matched', type: 'exact' },
                    { ref: 'TXN-2892', amt: 'PKR 12,500', status: 'Matched', type: 'fuzzy' },
                    { ref: 'TXN-2893', amt: 'PKR 93,200', status: 'Anomaly', type: 'anomaly' },
                    { ref: 'TXN-2894', amt: 'PKR 5,750', status: 'Matched', type: 'exact' },
                  ].map((t) => (
                    <div key={t.ref} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          t.type === 'anomaly' ? 'bg-danger-500' : 'bg-success-500'
                        }`} />
                        <span className="text-[11px] text-white/50 font-mono">{t.ref}</span>
                      </div>
                      <span className="text-[11px] font-medium text-white/70">{t.amt}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.status === 'Matched' ? 'bg-success-500/15 text-success-400' : 'bg-danger-500/15 text-danger-400'
                      }`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge cards */}
            <div className="absolute -top-4 -right-8 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-surface-200 animate-slide-up">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-success-50 flex items-center justify-center">
                  <TrendingUp size={14} className="text-success-600" />
                </div>
                <div>
                  <p className="text-[11px] text-surface-400 leading-none">Match Rate</p>
                  <p className="text-sm font-bold text-surface-900 leading-tight">94.2% ↑</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-surface-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-ai-50 flex items-center justify-center">
                  <Sparkles size={14} className="text-ai-600" />
                </div>
                <div>
                  <p className="text-[11px] text-surface-400 leading-none">AI resolved</p>
                  <p className="text-sm font-bold text-surface-900 leading-tight">3 anomalies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '94.2%', label: 'Average Match Rate', icon: <BarChart3 size={18} /> },
              { value: '< 4 hrs', label: 'Month-End Close Time', icon: <Clock size={18} /> },
              { value: '50+', label: 'Finance Teams', icon: <Users size={18} /> },
              { value: '₨ 2.4M', label: 'Avg. Anomalies Caught', icon: <Award size={18} /> },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-1">
                  {s.icon}
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{s.value}</p>
                <p className="text-xs text-white/40 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 mb-5">
            <Zap size={12} className="text-brand-400" />
            <span className="text-xs font-semibold text-brand-300">Enterprise-Grade Features</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Everything your finance team needs
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            From exact matching to AI-powered resolution — built for the modern enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: <Layers size={24} />,
              gradient: 'from-brand-500/20 to-brand-500/5',
              border: 'border-brand-500/20',
              iconColor: 'text-brand-400',
              title: '3-Phase Matching',
              desc: 'Exact, fuzzy amount, and fuzzy description matching in a single automated pass.',
              tag: 'Core',
            },
            {
              icon: <Brain size={24} />,
              gradient: 'from-ai-500/20 to-ai-500/5',
              border: 'border-ai-500/20',
              iconColor: 'text-ai-400',
              title: 'ML Anomaly Detection',
              desc: 'Isolation Forest algorithm detects statistical outliers and suspicious patterns automatically.',
              tag: 'AI/ML',
            },
            {
              icon: <Bot size={24} />,
              gradient: 'from-[#6366F1]/20 to-[#6366F1]/5',
              border: 'border-[#6366F1]/20',
              iconColor: 'text-[#818CF8]',
              title: 'AI Copilot',
              desc: 'LLM-powered suggestions to resolve anomalies and explain every discrepancy in plain English.',
              tag: 'Intelligent',
            },
            {
              icon: <FileDown size={24} />,
              gradient: 'from-success-500/20 to-success-500/5',
              border: 'border-success-500/20',
              iconColor: 'text-success-400',
              title: 'Audit Export',
              desc: 'Color-coded Excel reports — green matched, red anomaly, yellow resolved — ready for auditors.',
              tag: 'Compliance',
            },
            {
              icon: <Shield size={24} />,
              gradient: 'from-warning-500/20 to-warning-500/5',
              border: 'border-warning-500/20',
              iconColor: 'text-warning-400',
              title: 'Enterprise Security',
              desc: 'Role-based access control, SSO, and full audit trails for every action taken.',
              tag: 'Security',
            },
            {
              icon: <RefreshCcw size={24} />,
              gradient: 'from-brand-500/20 to-ai-500/10',
              border: 'border-brand-500/20',
              iconColor: 'text-brand-400',
              title: 'Multi-Organization',
              desc: 'Manage multiple entities, subsidiaries, or clients from one unified dashboard.',
              tag: 'Scale',
            },
            {
              icon: <BarChart3 size={24} />,
              gradient: 'from-ai-500/20 to-brand-500/10',
              border: 'border-ai-500/20',
              iconColor: 'text-ai-400',
              title: 'Advanced Analytics',
              desc: 'Track match rates, anomaly trends, and reconciliation performance over time.',
              tag: 'Insights',
            },
            {
              icon: <Zap size={24} />,
              gradient: 'from-success-500/20 to-brand-500/10',
              border: 'border-success-500/20',
              iconColor: 'text-success-400',
              title: 'O(n) Performance',
              desc: 'Optimized matching engine that handles enterprise-scale transaction volumes with ease.',
              tag: 'Performance',
            },
          ].map((f) => (
            <div key={f.title}
              className={`relative group rounded-2xl p-5 border bg-gradient-to-br ${f.gradient} ${f.border} hover:border-opacity-60 transition-all duration-300 cursor-default`}>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{f.tag}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center mb-4 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-8" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">How Refinely Works</h2>
            <p className="text-white/50 text-lg">From raw files to reconciled books in three steps.</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-[52px] left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-brand-500/30 via-brand-500/60 to-brand-500/30" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Upload size={26} />,
                  step: '01',
                  title: 'Upload Your Files',
                  desc: 'Upload bank statement and ledger CSV or Excel files. We support all major formats.',
                  color: 'bg-brand-500',
                },
                {
                  icon: <RefreshCcw size={26} />,
                  step: '02',
                  title: 'Run Matching Engine',
                  desc: 'Our O(n) 3-phase engine matches transactions in seconds, even at enterprise scale.',
                  color: 'bg-ai-500',
                },
                {
                  icon: <Sparkles size={26} />,
                  step: '03',
                  title: 'AI Resolves Anomalies',
                  desc: 'AI Copilot analyses unmatched items, suggests resolutions, and generates audit reports.',
                  color: 'bg-success-500',
                },
              ].map((s, i) => (
                <div key={s.step} className="flex flex-col items-center text-center relative">
                  <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mb-5 shadow-xl relative z-10`}>
                    <span className="text-white">{s.icon}</span>
                  </div>
                  <div className="mb-1">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{s.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-3">{s.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed max-w-xs">{s.desc}</p>
                  {i < 2 && (
                    <ChevronRight size={18} className="hidden md:block absolute top-4 -right-5 text-brand-500/50 z-20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Loved by finance teams</h2>
          <p className="text-white/50">See what teams are saying about Refinely.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Refinely cut our month-end close from 3 days to 4 hours. The anomaly detection alone caught a PKR 2.4M discrepancy that would have gone unnoticed.",
              name: "Sarah K.", role: "Head of Finance, TechCorp", rating: 5,
            },
            {
              quote: "The AI Copilot is a game changer. It explains every anomaly in plain English and suggests the exact resolution. Our junior team now handles what used to require senior accountants.",
              name: "Ahmed R.", role: "Finance Director, NovaCo", rating: 5,
            },
            {
              quote: "We reconcile 15 subsidiaries monthly. Refinely's multi-org support and Excel audit exports have made our external audit process seamless and fully documented.",
              name: "Maryam T.", role: "CFO, GlobalTrade Ltd", rating: 5,
            },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={13} fill="#F59E0B" className="text-warning-500" />)}
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-8" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Simple, transparent pricing</h2>
            <p className="text-white/50 text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name}
                className={`relative rounded-2xl p-7 border transition-all ${
                  plan.highlight
                    ? 'border-brand-500/60 shadow-2xl shadow-brand-500/15'
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  background: plan.highlight
                    ? 'linear-gradient(135deg, rgba(45,96,255,0.15), rgba(139,92,246,0.08))'
                    : 'rgba(255,255,255,0.03)',
                }}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-bold bg-brand-500 text-white shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-sm font-semibold text-white/60 mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-white/45 mt-2 leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 size={14} className="text-success-400 flex-shrink-0" />
                      <span className="text-sm text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                    plan.highlight
                      ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                      : 'border border-white/15 text-white/80 hover:bg-white/5 hover:border-white/25'
                  }`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-white/30 text-sm mt-8">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #2D60FF, transparent)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-success-500/30 bg-success-500/10 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
            <span className="text-xs font-semibold text-success-300">Join 50+ Finance Teams</span>
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-5 tracking-tight">
            Ready to reconcile smarter?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Start for free today. No credit card required. Set up in under 5 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 shadow-xl shadow-brand-500/30">
              Start for free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 border border-white/15 rounded-xl font-medium text-base text-white/70 hover:bg-white/5 transition-all">
              Sign in →
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-8 py-14" style={{ background: '#030810' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/logo.png" alt="Refinely" className="h-7 w-auto" />
                <span className="font-bold text-white text-lg">Refinely</span>
              </div>
              <p className="text-sm text-white/35 leading-relaxed">
                AI-powered bank reconciliation for the modern enterprise.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Product</p>
              <ul className="space-y-2.5">
                {['Features', 'How it works', 'Pricing', 'Changelog'].map(l => (
                  <li key={l}><a href="#" className="text-sm text-white/45 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Company</p>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact'].map(l => (
                  <li key={l}><a href="#" className="text-sm text-white/45 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Legal</p>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(l => (
                  <li key={l}><a href="#" className="text-sm text-white/45 hover:text-white transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25">© 2025 Refinely. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <button onClick={() => navigate('/login')} className="text-xs text-white/35 hover:text-white transition-colors">Sign In</button>
              <button onClick={() => navigate('/signup')} className="text-xs text-white/35 hover:text-white transition-colors">Sign Up</button>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-xs text-white/35 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
