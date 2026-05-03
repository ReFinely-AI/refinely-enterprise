import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center animate-pulse-soft">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10a7 7 0 1114 0A7 7 0 013 10z" stroke="white" strokeWidth="2"/>
            <path d="M10 7v3l2 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-sm text-surface-500">Loading Refinely...</p>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
