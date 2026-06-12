import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, TrendingUp, Shield, Zap } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.103 17.64 11.892 17.64 9.2z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const Login: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left: Form Panel ──────────────────────────────────────────── */}
      <div className="w-full md:w-[480px] flex flex-col justify-center px-10 lg:px-14 bg-white relative z-10 shadow-xl">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 w-fit group">
          <img src="/logo.png" alt="Refinely" className="h-8 w-auto" />
          <span className="text-xl font-bold text-surface-900 tracking-tight">Refinely</span>
        </Link>

        <div className="mb-8">
          <h2 className="text-[30px] font-extrabold text-surface-900 mb-1.5 tracking-tight">Welcome back</h2>
          <p className="text-sm text-surface-500">Sign in to your Refinely workspace</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-danger-500 mt-1.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Google sign-in */}
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={googleLoading}
          className="w-full h-11 flex items-center justify-center gap-3 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:bg-surface-50 hover:border-surface-300 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all mb-6"
        >
          {googleLoading ? (
            <svg className="animate-spin h-4 w-4 text-surface-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-xs text-surface-400 font-medium">or sign in with email</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-semibold text-surface-700">Password</label>
              <button type="button" className="text-[13px] text-brand-500 hover:text-brand-600 font-medium transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 disabled:translate-y-0 shadow-lg shadow-brand-500/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-surface-500 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-semibold transition-colors">
            Create account →
          </Link>
        </p>

        <p className="text-center text-xs text-surface-400 mt-4 leading-relaxed">
          By signing in, you agree to our{' '}
          <button type="button" className="text-surface-500 hover:text-brand-500 underline underline-offset-2 transition-colors">Terms of Service</button>
          {' '}and{' '}
          <button type="button" className="text-surface-500 hover:text-brand-500 underline underline-offset-2 transition-colors">Privacy Policy</button>
        </p>
      </div>

      {/* ── Right: Visual Panel ────────────────────────────────────────── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A1628 0%, #0F2456 40%, #1A1040 100%)' }}>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />

        {/* Glow orbs */}
        <div className="absolute top-1/4 right-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2D60FF, transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-1/3 w-56 h-56 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />

        <div className="relative z-10 max-w-lg px-12 text-center">
          <div className="text-[80px] font-extrabold text-brand-500/25 leading-none mb-4 select-none">"</div>
          <blockquote className="text-[22px] font-light text-white/90 leading-relaxed mb-7 italic">
            Refinely cut our month-end close from 3 days to 4 hours. The anomaly detection
            caught a PKR 2.4M discrepancy that would have gone unnoticed.
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-ai-500 flex items-center justify-center font-bold text-white text-sm shadow-lg">
              SK
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Sarah K.</p>
              <p className="text-xs text-white/40">Head of Finance, TechCorp</p>
            </div>
          </div>
        </div>

        {/* Stat cards row */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-4 px-12">
          {[
            { icon: <TrendingUp size={16} />, value: '94.2%', label: 'Match Rate', color: 'text-success-400' },
            { icon: <Zap size={16} />, value: '4 hrs', label: 'Month-End Close', color: 'text-brand-400' },
            { icon: <Shield size={16} />, value: '99.9%', label: 'Uptime SLA', color: 'text-ai-400' },
          ].map((s) => (
            <div key={s.label}
              className="flex items-center gap-3 rounded-xl px-5 py-3 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <span className={s.color}>{s.icon}</span>
              <div>
                <p className="text-base font-extrabold text-white leading-none">{s.value}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
