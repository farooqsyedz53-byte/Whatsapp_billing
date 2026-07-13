/**
 * Toast notification system.
 * Renders floating notifications at the top-right of the screen.
 */

'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastType, ToastType as TType } from '@/types';

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

const iconMap: Record<TType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-emerald-400" />,
  error: <XCircle size={18} className="text-red-400" />,
  warning: <AlertTriangle size={18} className="text-amber-400" />,
  info: <Info size={18} className="text-blue-400" />,
};

const bgMap: Record<TType, string> = {
  success: 'border-emerald-500/20 bg-emerald-500/10',
  error: 'border-red-500/20 bg-red-500/10',
  warning: 'border-amber-500/20 bg-amber-500/10',
  info: 'border-blue-500/20 bg-blue-500/10',
};

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border
            backdrop-blur-xl shadow-2xl shadow-black/30
            animate-slide-in-right
            ${bgMap[toast.type]}
          `}
        >
          {iconMap[toast.type]}
          <p className="text-sm text-white flex-1">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
