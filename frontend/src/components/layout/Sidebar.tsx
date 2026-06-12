import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  RefreshCcw,
  AlertTriangle,
  Sparkles,
  Settings,
  HelpCircle,
  ChevronDown,
  LogOut,
  Plus,
  Receipt,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganizations } from '../../hooks/useOrganizations';
import { reconciliationService } from '../../services/reconciliation';
import { cn } from '../../utils';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  badge?: number | string;
  ai?: boolean;
}

const bottomNav: NavItem[] = [
  { label: 'Billing',  icon: <Receipt size={18} />,    to: '/billing' },
  { label: 'Settings', icon: <Settings size={18} />,   to: '/settings' },
  { label: 'Help',     icon: <HelpCircle size={18} />, to: '/help' },
];

const NavLink: React.FC<NavItem & { collapsed?: boolean }> = ({
  label, icon, to, badge, ai, collapsed,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  const badgeDisplay = typeof badge === 'number'
    ? badge > 99 ? '99+' : badge > 0 ? String(badge) : undefined
    : badge;

  return (
    <button
      onClick={() => navigate(to)}
      title={collapsed ? label : undefined}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
        isActive
          ? 'bg-brand-500 text-white shadow-sm'
          : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800',
        ai && !isActive && 'hover:bg-ai-50 hover:text-ai-600',
      )}
    >
      <span className={cn(
        'flex-shrink-0',
        isActive ? 'text-white' : ai ? 'text-ai-500' : 'text-surface-400 group-hover:text-surface-700',
      )}>
        {icon}
      </span>

      {!collapsed && (
        <span className="flex-1 text-left truncate">{label}</span>
      )}

      {!collapsed && badgeDisplay && (
        <span className={cn(
          'ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none',
          isActive
            ? 'bg-white/25 text-white'
            : 'bg-danger-500 text-white',
        )}>
          {badgeDisplay}
        </span>
      )}

      {collapsed && badgeDisplay && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 ring-1 ring-white" />
      )}
    </button>
  );
};

const Sidebar: React.FC = () => {
  const { user, logout, activeOrgId, setActiveOrgId } = useAuth();
  const { organizations } = useOrganizations();
  const navigate = useNavigate();
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const { data: reconciliations = [] } = useQuery({
    queryKey: ['reconciliations', activeOrgId],
    queryFn: () => reconciliationService.listReconciliations({ org_id: activeOrgId ?? undefined }),
    enabled: !!activeOrgId,
  });

  // Fetch unresolved anomaly count from the most recent reconciliations
  const recentIds = reconciliations.slice(-5).map((r) => r.id);
  const { data: unresolvedAnomalyCount = 0 } = useQuery({
    queryKey: ['sidebarUnresolvedAnomalies', recentIds],
    queryFn: async () => {
      const results = await Promise.all(
        reconciliations.slice(-5).map((r) => reconciliationService.getAnomalies(r.id)),
      );
      return results.flat().filter((a) => !a.is_resolved).length;
    },
    enabled: reconciliations.length > 0,
    staleTime: 120_000,
  });

  const mainNav: NavItem[] = [
    { label: 'Dashboard',       icon: <LayoutDashboard size={18} />, to: '/dashboard' },
    { label: 'Organizations',   icon: <Building2 size={18} />,       to: '/organizations' },
    { label: 'Bank Accounts',   icon: <CreditCard size={18} />,      to: '/bank-accounts' },
    { label: 'Reconciliations', icon: <RefreshCcw size={18} />,      to: '/reconciliations' },
    { label: 'Anomalies',       icon: <AlertTriangle size={18} />,   to: '/anomalies', badge: unresolvedAnomalyCount || undefined },
    { label: 'AI Copilot',      icon: <Sparkles size={18} />,        to: '/copilot', ai: true },
  ];

  const activeOrg = organizations.find((o) => o.id === activeOrgId) ?? organizations[0];
  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col bg-white border-r border-surface-200 z-30"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-surface-100 flex-shrink-0">
        <img src="/logo.png" alt="Refinely" className="h-8 w-auto" />
        <span className="text-[17px] font-extrabold text-surface-900 tracking-tight">
          Refinely
        </span>
      </div>

      {/* ── Org Switcher ──────────────────────────────────────── */}
      <div className="px-3 py-3 border-b border-surface-100 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setOrgMenuOpen((p) => !p)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors border border-surface-200 group"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Building2 size={14} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-surface-800 truncate leading-tight">
                {activeOrg?.name ?? 'No organization'}
              </p>
              <p className="text-xs text-surface-400 leading-tight">
                {activeOrg?.currency ?? 'PKR'}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                'text-surface-400 transition-transform flex-shrink-0',
                orgMenuOpen && 'rotate-180',
              )}
            />
          </button>

          {orgMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => { setActiveOrgId(org.id); setOrgMenuOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                      org.id === activeOrgId
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-surface-700 hover:bg-surface-50',
                    )}
                  >
                    <div className="w-6 h-6 rounded-md bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={12} className="text-brand-600" />
                    </div>
                    <span className="truncate">{org.name}</span>
                    {org.id === activeOrgId && (
                      <span className="ml-auto text-xs font-semibold text-brand-500">Active</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-surface-100 p-1">
                <button
                  onClick={() => { navigate('/organizations'); setOrgMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-brand-600 hover:bg-brand-50 transition-colors font-semibold"
                >
                  <Plus size={14} />
                  New Organization
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Navigation ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 px-3 pb-2">
          Main Menu
        </p>
        {mainNav.map((item) => (
          <NavLink key={item.to} {...item} />
        ))}

        <div className="pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 px-3 pb-2">
            Account
          </p>
          {bottomNav.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </div>
      </nav>

      {/* ── User Footer ───────────────────────────────────────── */}
      <div className="border-t border-surface-100 p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-surface-50 transition-colors">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name ?? 'User'}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-sm ring-2 ring-surface-100"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-ai-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-surface-800 truncate leading-tight">
              {user?.full_name ?? 'User'}
            </p>
            <p className="text-xs text-surface-400 truncate leading-tight">
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="flex-shrink-0 p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
