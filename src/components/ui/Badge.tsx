/**
 * Status Badge component for invoice status indicators.
 */

import React from 'react';
import type { InvoiceStatus } from '@/types';

interface BadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusConfig: Record<InvoiceStatus, { label: string; classes: string }> = {
  paid: {
    label: 'Paid',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  draft: {
    label: 'Draft',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
};

export default function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold
        border transition-colors
        ${config.classes}
        ${className}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  );
}
