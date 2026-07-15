/**
 * Recent invoices table displayed on the dashboard.
 * Shows the last 5 invoices with quick action buttons.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, FileText } from 'lucide-react';
import type { Invoice } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface RecentInvoicesProps {
  invoices: Invoice[];
}

export default function RecentInvoices({ invoices }: RecentInvoicesProps) {
  const recent = invoices.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold text-white">Recent Invoices</h3>
        </div>
        <EmptyState
          icon={<FileText size={24} />}
          title="No invoices yet"
          description="Create your first invoice to see it here"
          action={
            <Link
              href="/invoice/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              Create Invoice
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white">Recent Invoices</h3>
        <Link
          href="/invoices"
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/[0.04]">
              <th className="text-left px-3 sm:px-5 py-3 font-medium">Invoice</th>
              <th className="text-left px-3 sm:px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-3 sm:px-5 py-3 font-medium hidden md:table-cell">Date</th>
              <th className="text-right px-3 sm:px-5 py-3 font-medium">Amount</th>
              <th className="text-center px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">Status</th>
              <th className="text-center px-3 sm:px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((invoice) => (
              <tr
                key={invoice.id}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-3 sm:px-5 py-3.5">
                  <span className="text-sm font-medium text-indigo-400">
                    {invoice.invoiceNumber}
                  </span>
                </td>
                <td className="px-3 sm:px-5 py-3.5">
                  <div>
                    <p className="text-sm text-white">
                      {invoice.customer.name || 'Walk-in'}
                    </p>
                    {invoice.customer.phone && (
                      <p className="text-xs text-gray-500">{invoice.customer.phone}</p>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-5 py-3.5 hidden md:table-cell">
                  <span className="text-sm text-gray-400">
                    {new Date(invoice.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </td>
                <td className="px-3 sm:px-5 py-3.5 text-right">
                  <span className="text-sm font-semibold text-white tabular-nums">
                    ₹{invoice.grandTotal.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 sm:px-5 py-3.5 text-center hidden sm:table-cell">
                  <Badge status={invoice.status} />
                </td>
                <td className="px-3 sm:px-5 py-3.5 text-center">
                  <Link
                    href={`/invoice/${invoice.id}/edit`}
                    className="inline-flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    title="View/Edit"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
