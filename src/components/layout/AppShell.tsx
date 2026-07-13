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
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Key, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

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
  const pathname = usePathname();
  const { user, login, isReady } = useAuth();

  // 1. Bypass authentication and shell layout for the public digital bill page
  if (pathname === '/bill') {
    return (
      <ToastContext.Provider value={{ showToast }}>
        {children}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </ToastContext.Provider>
    );
  }

  // 2. Wait for Netlify Identity to initialize before checking auth state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 3. Secure access wall for unauthenticated users
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a] px-4">
        <div className="w-full max-w-md bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 text-center animate-scale-in">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-indigo-500/20">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Secure Access</h1>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Please log in with your authorized GitHub account to manage the billing dashboard.
          </p>
          <Button variant="primary" className="w-full py-3 flex items-center justify-center gap-3" onClick={login}>
            <Key size={20} />
            <span className="font-semibold">Login to Dashboard</span>
          </Button>
        </div>
      </div>
    );
  }

  // 4. Fully authenticated shell
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
