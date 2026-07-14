/**
 * Invoice summary panel — shows subtotal, discount, tax, and grand total.
 * Also includes tax rate selector and notes.
 */

'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { GST_RATES } from '@/types';
import Select from '@/components/ui/Select';

interface InvoiceSummaryProps {
  subtotal: number;
  totalDiscount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  notes: string;
  status: string;
  onTaxRateChange: (rate: number) => void;
  onNotesChange: (notes: string) => void;
  onStatusChange: (status: string) => void;
}

export default function InvoiceSummary({
  subtotal,
  totalDiscount,
  taxRate,
  taxAmount,
  grandTotal,
  notes,
  status,
  onTaxRateChange,
  onNotesChange,
  onStatusChange,
}: InvoiceSummaryProps) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Calculator size={16} className="text-indigo-400" />
          Invoice Summary
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Tax Rate & Status */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="GST Rate"
            value={String(taxRate)}
            onChange={(e) => onTaxRateChange(Number(e.target.value))}
            options={GST_RATES.map((rate) => ({
              value: String(rate),
              label: `${rate}%`,
            }))}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { value: 'paid', label: 'Paid' },
              { value: 'draft', label: 'Draft' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1.5 block">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any notes or terms..."
            rows={2}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        {/* Totals Breakdown */}
        <div className="border-t border-white/[0.06] pt-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white tabular-nums">₹{subtotal.toFixed(2)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Discount</span>
              <span className="text-emerald-400 tabular-nums">
                -₹{totalDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">GST ({taxRate}%)</span>
            <span className="text-white tabular-nums">₹{taxAmount.toFixed(2)}</span>
          </div>

          <div className="border-t border-white/[0.08] pt-3 flex justify-between items-center">
            <span className="text-base font-semibold text-white">Grand Total</span>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tabular-nums animate-pulse-slow">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
