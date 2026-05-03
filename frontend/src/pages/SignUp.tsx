import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function passwordStrength(p: string): { score: number; label: string; color: string } {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-danger-500', 'bg-warning-500', 'bg-success-500', 'bg-brand-500'];
  return { score, label: labels[score] ?? '', color: colors[score] ?? '' };
}

const SignUp: React.FC = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('You must agree to the Terms of Service'); return; }
    setLoading(true);
    setError('');
    try {
      await signup({ full_name: fullName, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form Panel */}
      <div className="w-[40%] flex flex-col justify-center px-12 bg-white overflow-y-auto py-8">
        <Link to="/" className="flex items-center gap-2 mb-10 w-fit">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <RefreshCcw size={15} className="text-white" />
          </div>
          <span className="text-lg font-bold text-surface-900 tracking-tight">Refinely</span>
        </Link>

        <h2 className="text-[28px] font-bold text-surface-900 mb-1">Create your account</h2>
        <p className="text-sm text-surface-500 mb-8">Start reconciling in minutes — no setup required</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Full name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Nabeel"
                required
                className="w-full h-10 pl-9 pr-4 rounded-md border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-10 pl-9 pr-4 rounded-md border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
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
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-surface-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-surface-400">{strength.label}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Confirm password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="w-full h-10 pl-9 pr-4 rounded-md border border-surface-200 bg-white text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-600">
              I agree to the{' '}
              <button type="button" className="text-brand-500 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-brand-500 hover:underline">Privacy Policy</button>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-sm rounded-md transition-all hover:-translate-y-0.5 disabled:translate-y-0 shadow-md shadow-brand-500/20 mt-2"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-surface-200" />
          <span className="text-xs text-surface-400">Or sign up with</span>
          <div className="flex-1 h-px bg-surface-200" />
        </div>

        <div className="flex gap-3">
          {['Google', 'Apple'].map((p) => (
            <button key={p} className="flex-1 h-10 flex items-center justify-center gap-2 border border-surface-200 rounded-md text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors">
              {p === 'Google' ? '🟡' : '🍎'} {p}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>

      {/* Right: Visual Panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 max-w-md">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            Everything you need to reconcile at scale
          </h3>
          <ul className="space-y-4">
            {[
              '3-phase intelligent transaction matching',
              'ML-powered anomaly detection',
              'AI copilot for instant resolution',
              'Color-coded Excel audit exports',
              'Multi-organization support',
              'Role-based access control',
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-success-500 flex-shrink-0" />
                <span className="text-base text-white/90">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
