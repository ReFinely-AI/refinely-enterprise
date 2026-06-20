import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, Sparkles, Shield, BarChart3 } from 'lucide-react';
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

function passwordStrength(p: string): { score: number; label: string; color: string; barColor: string } {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'text-danger-500', 'text-warning-500', 'text-brand-500', 'text-success-500'];
  const barColors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-brand-500', 'bg-success-500'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '', barColor: barColors[score] ?? '' };
}

const SignUp: React.FC = () => {
  const { register: signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = passwordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('You must agree to the Terms of Service to continue'); return; }
    setLoading(true);
    setError('');
    try {
      await signup({ full_name: fullName, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Google sign-up failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-up was cancelled or failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen flex bg-white">

      {/* ── Left: Form Panel ──────────────────────────────────────────── */}
      <div className="w-full md:w-[480px] flex flex-col justify-center px-10 lg:px-14 bg-white overflow-y-auto py-10 relative z-10 shadow-xl">

        <Link to="/" className="flex items-center gap-2.5 mb-9 w-fit group">
          <img src="/logo.png" alt="Refinely" className="h-8 w-auto" />
          <span className="text-xl font-bold text-surface-900 tracking-tight">Refinely</span>
        </Link>

        <div className="mb-7">
          <h2 className="text-[30px] font-extrabold text-surface-900 mb-1.5 tracking-tight">Create your account</h2>
          <p className="text-sm text-surface-500">Start reconciling in minutes — no setup required</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-danger-500 mt-1.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Google sign-up */}
        <button
          type="button"
          onClick={() => googleSignUp()}
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
          {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-xs text-surface-400 font-medium">or register with email</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Full name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your Name"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password && (
              <div className="mt-2.5 space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                      i <= strength.score ? strength.barColor : 'bg-surface-200'
                    }`} />
                  ))}
                </div>
                {strength.label && (
                  <p className={`text-xs font-medium ${strength.color}`}>{strength.label}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-surface-700 mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all ${
                agreed ? 'bg-brand-500 border-brand-500' : 'border-surface-300 bg-white group-hover:border-brand-400'
              }`}>
                {agreed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-surface-600 leading-snug">
              I agree to Refinely's{' '}
              <button type="button" className="text-brand-500 hover:text-brand-600 font-medium hover:underline transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-brand-500 hover:text-brand-600 font-medium hover:underline transition-colors">Privacy Policy</button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all hover:-translate-y-0.5 disabled:translate-y-0 shadow-lg shadow-brand-500/20 mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Creating account...
              </span>
            ) : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-surface-500 mt-7">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold transition-colors">Sign in →</Link>
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
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2D60FF, transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />

        <div className="relative z-10 max-w-md px-12">
          <h3 className="text-2xl font-extrabold text-white mb-3 text-center tracking-tight">
            Everything you need to<br />reconcile at scale
          </h3>
          <p className="text-sm text-white/45 text-center mb-10">
            Join 50+ finance teams closing their books faster with Refinely.
          </p>

          <ul className="space-y-4">
            {[
              { icon: <BarChart3 size={16} />, text: '3-phase intelligent transaction matching', color: 'text-brand-400', bg: 'bg-brand-500/15' },
              { icon: <Sparkles size={16} />, text: 'ML-powered anomaly detection with Isolation Forest', color: 'text-ai-400', bg: 'bg-ai-500/15' },
              { icon: <CheckCircle2 size={16} />, text: 'AI copilot for instant discrepancy resolution', color: 'text-success-400', bg: 'bg-success-500/15' },
              { icon: <Shield size={16} />, text: 'Color-coded Excel audit exports', color: 'text-warning-400', bg: 'bg-warning-500/15' },
              { icon: <User size={16} />, text: 'Multi-organization support', color: 'text-brand-400', bg: 'bg-brand-500/15' },
              { icon: <Lock size={16} />, text: 'Role-based access control & SSO', color: 'text-ai-400', bg: 'bg-ai-500/15' },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3.5">
                <div className={`w-7 h-7 rounded-lg ${f.bg} flex items-center justify-center flex-shrink-0 ${f.color}`}>
                  {f.icon}
                </div>
                <span className="text-sm text-white/80">{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Trust badge */}
          <div className="mt-10 flex items-center gap-3 p-4 rounded-xl border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="w-10 h-10 rounded-xl bg-success-500/20 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-success-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Enterprise Security</p>
              <p className="text-xs text-white/40 mt-0.5">SOC 2 compliant · Data encrypted at rest & in transit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
