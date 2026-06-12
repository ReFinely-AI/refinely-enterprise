import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Building2, Shield, Bell, Key, CreditCard, Save, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../hooks/useOrganizations';
import { cn } from '../utils';
import PageHeader from '../components/layout/PageHeader';

type Section = 'profile' | 'organization' | 'security' | 'notifications' | 'api' | 'billing';

const NAV_ITEMS: Array<{ key: Section; label: string; icon: React.ReactNode }> = [
  { key: 'profile', label: 'Profile', icon: <User size={15} /> },
  { key: 'organization', label: 'Organization Settings', icon: <Building2 size={15} /> },
  { key: 'security', label: 'Security', icon: <Shield size={15} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  { key: 'api', label: 'API Keys', icon: <Key size={15} /> },
  { key: 'billing', label: 'Billing', icon: <CreditCard size={15} /> },
];

const SettingsPage: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizations, activeOrgId } = useOrganizations();
  const [activeSection, setActiveSection] = useState<Section>((section as Section) || 'profile');

  const activeOrg = organizations.find((o) => o.id === activeOrgId);

  const setSection = (s: Section) => {
    setActiveSection(s);
    navigate(`/settings/${s}`, { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <PageHeader title="Settings" subtitle="Manage your account and organization preferences" />

      <div className="flex flex-1 p-8 gap-6">
        {/* Left nav */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  activeSection === item.key
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800',
                )}
              >
                <span className={activeSection === item.key ? 'text-brand-600' : 'text-surface-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'profile' && <ProfileSection user={user} />}
          {activeSection === 'organization' && <OrgSection org={activeOrg} />}
          {activeSection === 'security' && <SecuritySection />}
          {activeSection === 'notifications' && <ComingSoon label="Notifications" />}
          {activeSection === 'api' && <ApiKeysSection />}
          {activeSection === 'billing' && <BillingRedirectSection navigate={navigate} />}
        </div>
      </div>
    </div>
  );
};

/* ── Sections ─────────────────────────────────────────────────────── */

const ProfileSection: React.FC<{ user: any }> = ({ user }) => {
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [saved, setSaved] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, call update API
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-surface-900 mb-5">Profile Settings</h3>

      <div className="flex items-center gap-5 mb-6 pb-6 border-b border-surface-100">
        <div className="w-[72px] h-[72px] rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-surface-800">{user?.full_name || 'User'}</p>
          <p className="text-xs text-surface-400 mb-2">{user?.email || ''}</p>
          <button className="text-xs text-brand-500 hover:text-brand-600 font-medium">Upload photo</button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Email address</label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm bg-surface-50 text-surface-400 cursor-not-allowed"
          />
          <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <Save size={14} /> {saved ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-surface-200">
        <p className="text-sm font-semibold text-danger-600 mb-3">Danger Zone</p>
        <button className="px-4 py-2 border border-danger-300 text-danger-600 hover:bg-danger-50 text-sm font-medium rounded-md transition-colors">
          Delete account
        </button>
      </div>
    </div>
  );
};

const OrgSection: React.FC<{ org: any }> = ({ org }) => {
  const [orgName, setOrgName] = useState(org?.name ?? '');
  const [currency, setCurrency] = useState(org?.currency ?? 'PKR');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="card p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-surface-900 mb-1">Organization Settings</h3>
      <p className="text-sm text-surface-500 mb-6">Manage {org?.name ?? 'organization'} settings</p>

      <form onSubmit={handleSave} className="space-y-4 mb-8">
        <div>
          <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Organization Name</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Default Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          >
            {['PKR','USD','EUR','GBP','AED','SAR','INR'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-colors"
        >
          <Save size={14} /> {saved ? 'Saved!' : 'Save changes'}
        </button>
      </form>

      <div className="pt-6 border-t border-surface-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-surface-700">Members</p>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-surface-200 rounded-md text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors">
            + Invite member
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200">
              {['Member', 'Role', ''].map((h) => (
                <th key={h} className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-surface-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-surface-100">
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">MN</div>
                  <div>
                    <p className="text-sm font-medium text-surface-800">Muhammad Nabeel</p>
                    <p className="text-xs text-surface-400">nabeel@company.com</p>
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-600">ADMIN</span>
              </td>
              <td className="py-3 text-right">
                <span className="text-xs text-surface-300">You</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
  };

  return (
    <div className="card p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-surface-900 mb-5">Security</h3>

      <div className="mb-8">
        <p className="text-sm font-semibold text-surface-700 mb-4">Change Password</p>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Current password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowCurrent((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <button type="button" onClick={() => setShowNew((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-surface-600 mb-1.5">Confirm new password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-surface-200 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <Save size={14} /> {saved ? 'Updated!' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="pt-6 border-t border-surface-200">
        <p className="text-sm font-semibold text-surface-700 mb-4">Active Sessions</p>
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: 'Just now', current: true },
            { device: 'Safari on iPhone', ip: '192.168.1.5', lastActive: '2 hours ago', current: false },
          ].map((s) => (
            <div key={s.device} className="flex items-center justify-between p-3 rounded-lg border border-surface-200">
              <div>
                <p className="text-sm font-medium text-surface-800">{s.device}</p>
                <p className="text-xs text-surface-400">{s.ip} · {s.lastActive}</p>
              </div>
              {s.current ? (
                <span className="text-xs font-medium text-success-600 bg-success-50 px-2 py-1 rounded-full">Current</span>
              ) : (
                <button className="text-xs font-medium text-danger-600 hover:underline">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComingSoon: React.FC<{ label: string }> = ({ label }) => (
  <div className="card p-6 max-w-2xl flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-4">
      <Bell size={20} className="text-surface-400" />
    </div>
    <p className="text-base font-semibold text-surface-700 mb-2">{label}</p>
    <p className="text-sm text-surface-400">This section is coming soon.</p>
  </div>
);

const BillingRedirectSection: React.FC<{ navigate: (to: string) => void }> = ({ navigate }) => (
  <div className="card p-6 max-w-2xl">
    <h3 className="text-lg font-bold text-surface-900 mb-1">Billing & Subscription</h3>
    <p className="text-sm text-surface-500 mb-6">Manage your plan, payment methods, and invoices</p>
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: 'Current Plan', value: 'Professional', color: 'bg-brand-50 text-brand-700' },
        { label: 'Next Billing', value: 'Jul 1, 2025', color: 'bg-surface-50 text-surface-700' },
        { label: 'Monthly Cost', value: '$49/mo', color: 'bg-success-50 text-success-700' },
      ].map(s => (
        <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
          <p className="text-xs font-semibold opacity-60 mb-1">{s.label}</p>
          <p className="text-lg font-extrabold">{s.value}</p>
        </div>
      ))}
    </div>
    <button
      onClick={() => navigate('/billing')}
      className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 hover:-translate-y-0.5"
    >
      <CreditCard size={15} /> Manage Billing <ArrowRight size={14} />
    </button>
  </div>
);

const ApiKeysSection: React.FC = () => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const keys = [
    { id: 'key_1', name: 'Production Key', key: 'rfn_prod_sk_4xK8mN2pQvL9wR7tY3uZ', created: 'Apr 16, 2025', lastUsed: '2 hours ago' },
    { id: 'key_2', name: 'Development Key', key: 'rfn_dev_sk_7bJ5nP1qXsC6eH2yM8dW', created: 'May 3, 2025', lastUsed: 'Never' },
  ];

  return (
    <div className="card p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-surface-900 mb-1">API Keys</h3>
      <p className="text-sm text-surface-500 mb-6">Use these keys to authenticate requests to the Refinely API</p>

      <div className="space-y-3 mb-6">
        {keys.map(k => (
          <div key={k.id} className="p-4 rounded-xl border border-surface-200 bg-surface-50">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-surface-800">{k.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">Created {k.created} · Last used {k.lastUsed}</p>
              </div>
              <button className="text-xs font-semibold text-danger-500 hover:text-danger-600 transition-colors">Revoke</button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-white border border-surface-200 rounded-lg px-3 py-2 text-surface-600 overflow-hidden">
                {revealed[k.id] ? k.key : k.key.slice(0, 16) + '••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setRevealed(p => ({ ...p, [k.id]: !p[k.id] }))}
                className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-white border border-surface-200 transition-colors"
              >
                <Eye size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20">
        + Generate New Key
      </button>
    </div>
  );
};

export default SettingsPage;
