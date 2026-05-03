import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Brain, Bot, FileDown, ArrowRight, Play,
  RefreshCcw, Sparkles, ChevronRight,
  Star, Upload
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white font-sans">
      {/* ── Nav ───────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <RefreshCcw size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Refinely</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 rounded-md transition-colors"
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="flex items-center min-h-[calc(100vh-73px)] px-8 max-w-7xl mx-auto gap-16">
        {/* Left */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ai-500/30 bg-ai-500/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-ai-500 animate-pulse" />
            <span className="text-xs font-medium text-ai-400">AI-Powered Bank Reconciliation</span>
          </div>

          <h1 className="text-[52px] font-extrabold leading-[1.1] mb-5">
            Close your books<br />
            with{' '}
            <span className="bg-gradient-to-r from-brand-400 to-ai-400 bg-clip-text text-transparent">
              confidence.
            </span>
          </h1>

          <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-xl">
            Automated 3-phase transaction matching, ML anomaly detection and an AI copilot
            that resolves issues before your auditors do.
          </p>

          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 rounded-md font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-500/25"
            >
              Get started free <ArrowRight size={16} />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-white/15 rounded-md font-medium text-sm text-white/80 hover:bg-white/5 transition-colors">
              <Play size={14} fill="currentColor" /> Watch demo
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['#2D60FF','#10B981','#F59E0B','#EF4444','#8B5CF6'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0A0F1E] flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: c }}
                >
                  {['S','A','M','J','K'][i]}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/50">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill="#F59E0B" className="text-warning-500" />
                ))}
              </div>
              <span>Trusted by 50+ finance teams</span>
            </div>
          </div>
        </div>

        {/* Right — mockup */}
        <div className="flex-1 relative flex justify-center items-center">
          <div
            className="relative w-full max-w-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ transform: 'perspective(1200px) rotateY(-8deg)', background: 'rgba(255,255,255,0.04)' }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/8 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger-500/60" />
                <div className="w-3 h-3 rounded-full bg-warning-500/60" />
                <div className="w-3 h-3 rounded-full bg-success-500/60" />
              </div>
              <div className="flex-1 text-center text-xs text-white/30 font-mono">refinely.app/dashboard</div>
            </div>
            {/* Dashboard mini mockup */}
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Reconciliations', val: '24', color: 'bg-brand-500/15' },
                  { label: 'Match Rate', val: '87%', color: 'bg-success-500/15' },
                  { label: 'Anomalies', val: '3', color: 'bg-danger-500/15' },
                  { label: 'Unmatched', val: 'PKR 12k', color: 'bg-warning-500/15' },
                ].map((c) => (
                  <div key={c.label} className={`${c.color} rounded-lg p-2.5`}>
                    <p className="text-[9px] text-white/50 mb-1">{c.label}</p>
                    <p className="text-sm font-bold text-white">{c.val}</p>
                  </div>
                ))}
              </div>
              <div className="h-24 rounded-lg bg-white/5 flex items-end gap-1 px-3 pb-3">
                {[40,55,45,70,60,80,65,87,72,90,75,87].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-brand-500/60"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="space-y-1.5">
                {['Matched','Matched','Anomaly','Matched'].map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/4 rounded-md px-3 py-1.5">
                    <span className="text-xs text-white/50">Transaction #{100+i}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      s === 'Matched' ? 'bg-success-500/20 text-success-500' :
                      s === 'Anomaly' ? 'bg-danger-500/20 text-danger-500' :
                      'bg-warning-500/20 text-warning-500'
                    }`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating cards */}
          <div className="absolute top-8 -right-4 bg-white rounded-xl px-3 py-2 shadow-xl border border-surface-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-500" />
              <span className="text-xs font-semibold text-surface-800">87% Match Rate</span>
            </div>
          </div>
          <div className="absolute bottom-16 -left-4 bg-white rounded-xl px-3 py-2 shadow-xl border border-surface-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger-500" />
              <span className="text-xs font-semibold text-surface-800">3 Anomalies Detected</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ─────────────────────────────────── */}
      <section className="bg-surface-50 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 mb-3">
              Everything your finance team needs
            </h2>
            <p className="text-surface-500 text-base">
              Built for enterprise reconciliation — from exact matching to AI-powered resolution.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[
              {
                icon: <Layers size={22} />,
                color: 'bg-brand-50 text-brand-600',
                title: '3-Phase Matching',
                desc: 'Exact, fuzzy amount, and fuzzy description matching in a single pass.',
              },
              {
                icon: <Brain size={22} />,
                color: 'bg-ai-50 text-ai-600',
                title: 'ML Anomaly Detection',
                desc: 'Isolation Forest AI detects statistical outliers in your transaction data.',
              },
              {
                icon: <Bot size={22} />,
                color: 'bg-[#EEF2FF] text-brand-600',
                title: 'AI Copilot',
                desc: 'LLM-powered suggestions to resolve anomalies and explain discrepancies.',
              },
              {
                icon: <FileDown size={22} />,
                color: 'bg-success-50 text-success-600',
                title: 'Audit Export',
                desc: 'Color-coded Excel reports — green matched, red anomaly, yellow resolved.',
              },
            ].map((f) => (
              <div key={f.title} className="card card-hover p-6">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-surface-800 mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-surface-900 mb-3">How Refinely Works</h2>
          <p className="text-surface-500 mb-12">Three steps from raw data to reconciled books.</p>
          <div className="flex items-center justify-center gap-4">
            {[
              { icon: <Upload size={24} />, step: '01', title: 'Upload Files', desc: 'Upload your bank statement and ledger CSV or Excel files.' },
              { icon: <RefreshCcw size={24} />, step: '02', title: 'Run Matching Engine', desc: 'Our 3-phase engine matches transactions automatically.' },
              { icon: <Sparkles size={24} />, step: '03', title: 'AI Resolves Anomalies', desc: 'AI Copilot suggests resolutions for every unmatched item.' },
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 border border-brand-100">
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold text-brand-500 mb-1 uppercase tracking-widest">{s.step}</span>
                  <h3 className="text-base font-semibold text-surface-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-surface-500">{s.desc}</p>
                </div>
                {i < 2 && (
                  <ChevronRight size={20} className="text-surface-300 flex-shrink-0 mt-[-24px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-[#0A0F1E] py-20 text-center">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to reconcile smarter?
          </h2>
          <p className="text-white/50 text-base mb-8">
            Join 50+ finance teams already using Refinely to close their books faster.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 rounded-md font-semibold text-base transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-500/25"
          >
            Start for free <ArrowRight size={18} />
          </button>
          <p className="text-white/30 text-sm mt-4">No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-[#080C18] border-t border-white/8 px-8 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
                <RefreshCcw size={12} className="text-white" />
              </div>
              <span className="font-bold text-white">Refinely</span>
            </div>
            <p className="text-sm text-white/30">Built for the modern enterprise.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
            <button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Sign Up</button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/8 text-center text-xs text-white/20">
          © 2025 Refinely. AI-Powered Bank Reconciliation Platform.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
