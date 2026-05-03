import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, RefreshCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Form Panel (40%) ─────────────────────── */}
      <div className="w-[40%] flex flex-col justify-center px-12 bg-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12 w-fit">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <RefreshCcw size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold text-surface-900 tracking-tight">Refinely</span>
        </Link>

        <h2 className="text-[28px] font-bold text-surface-900 mb-1">Welcome back</h2>
        <p className="text-sm text-surface-500 mb-8">Sign in to your Refinely account</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-10 pl-9 pr-4 rounded-md border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-medium text-surface-600">Password</label>
              <button type="button" className="text-[13px] text-brand-500 hover:text-brand-600">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-9 pr-10 rounded-md border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-sm rounded-md transition-all hover:-translate-y-0.5 disabled:translate-y-0 shadow-md shadow-brand-500/20"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-xs text-surface-400">Or continue with</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        <div className="flex gap-3">
          {['Google', 'Apple'].map((p) => (
            <button
              key={p}
              className="flex-1 h-10 flex items-center justify-center gap-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
            >
              {p === 'Google' ? '🟡' : '🍎'} {p}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-surface-500 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium">
            Create an account →
          </Link>
        </p>
        <p className="text-center text-xs text-surface-400 mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* ── Right: Visual Panel (60%) ───────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-lg text-center">
          <div className="text-[72px] font-bold text-brand-500/40 leading-none mb-4">"</div>
          <blockquote className="text-xl font-light italic text-white/90 leading-relaxed mb-6">
            Refinely cut our month-end close from 3 days to 4 hours. The anomaly detection
            alone caught a PKR 2.4M discrepancy that would have gone unnoticed.
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
              SK
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Sarah K.</p>
              <p className="text-xs text-white/40">Head of Finance, TechCorp</p>
            </div>
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4 px-16">
          {[
            { label: 'Average Match Rate', value: '87%' },
            { label: 'Anomalies Caught', value: '2.4M PKR' },
            { label: 'Average Close Time', value: '4 hrs' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl px-5 py-3 text-center">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
