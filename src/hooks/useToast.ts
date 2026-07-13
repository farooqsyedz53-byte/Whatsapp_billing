'use client';

/**
 * Custom hook for toast notifications.
 * Provides a simple API to show success/error/warning/info messages.
 */

import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '@/types';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /** Show a toast notification */
  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = crypto.randomUUID();
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  /** Dismiss a specific toast */
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
