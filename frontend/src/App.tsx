import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
import AppLayout from './components/layout/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import OrganizationsPage from './pages/Organizations';
import BankAccountsPage from './pages/BankAccounts';
import ReconciliationsPage from './pages/Reconciliations';
import ReconciliationDetail from './pages/ReconciliationDetail';
import AnomaliesPage from './pages/Anomalies';
import AICopilotPage from './pages/AICopilot';
import SettingsPage from './pages/Settings';
import BillingPage from './pages/Billing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <img src="/logo.png" alt="Refinely" className="h-12 w-auto animate-pulse-soft" />
          <div className="absolute inset-0 rounded-full bg-brand-500/10 scale-150 animate-pulse-soft" />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-base font-bold text-surface-700 tracking-tight">Refinely</p>
          <p className="text-xs text-surface-400">Loading your workspace...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft"
              style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
        <Route path="/bank-accounts" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />
        <Route path="/reconciliations" element={<ProtectedRoute><ReconciliationsPage /></ProtectedRoute>} />
        <Route path="/reconciliations/:id" element={<ProtectedRoute><ReconciliationDetail /></ProtectedRoute>} />
        <Route path="/anomalies" element={<ProtectedRoute><AnomaliesPage /></ProtectedRoute>} />
        <Route path="/copilot" element={<ProtectedRoute><AICopilotPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/settings/:section" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
