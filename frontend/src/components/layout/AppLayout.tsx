import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-50">

      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className="flex-1 flex flex-col min-h-screen overflow-auto md:ml-[var(--sidebar-width)]"
      >
        {/* Mobile top bar — only visible on small screens */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-surface-200 bg-white md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <img src="/logo.png" alt="Refinely" className="h-7 w-auto" />
          <span className="text-base font-extrabold text-surface-900 tracking-tight">
            Refinely
          </span>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AppLayout;