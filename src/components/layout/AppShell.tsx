/**
 * AppShell layout component.
 * Provides the sidebar + top bar + main content area structure.
 */

'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

// Create a context for toast notifications so any component can trigger them
export const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
}>({
  showToast: () => {},
});

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="flex h-screen bg-[#0a0e1a] overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onMenuToggle={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 lg:p-6 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ToastContext.Provider>
  );
}
