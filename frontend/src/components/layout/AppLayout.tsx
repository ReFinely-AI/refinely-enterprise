import React from 'react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main
        className="flex-1 flex flex-col min-h-screen overflow-auto"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
