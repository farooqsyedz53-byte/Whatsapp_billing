/**
 * Live invoice preview — shows how the invoice will look when printed/PDF'd.
 * Updates in real-time as the user edits the invoice form.
 */

'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import type { Invoice, ShopSettings } from '@/types';

interface InvoicePreviewProps {
  invoice: Invoice;
  shopSettings: ShopSettings;
  standalone?: boolean;
}

export default function InvoicePreview({ invoice, shopSettings, standalone = false }: InvoicePreviewProps) {
  const content = (
    <>
      {/* Shop Header */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-indigo-500">
            <div className="flex items-center gap-3">
              {shopSettings.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shopSettings.logo}
                  alt="Shop Logo"
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {shopSettings.name || 'Fashion Store'}
                </h2>
                {shopSettings.address && (
                  <p className="text-[10px] text-gray-500">{shopSettings.address}</p>
                )}
                {shopSettings.phone && (
                  <p className="text-[10px] text-gray-500">Tel: {shopSettings.phone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-indigo-600">TAX INVOICE</p>
              <p className="text-[10px] text-gray-500">#{invoice.invoiceNumber}</p>
              <p className="text-[10px] text-gray-500">
                {new Date(invoice.date).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Customer */}
          <div className="mb-4 p-2.5 bg-indigo-50 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Bill To</p>
            <p className="text-xs font-medium">{invoice.customer.name || 'Walk-in Customer'}</p>
            {invoice.customer.phone && (
              <p className="text-[10px] text-gray-500">{invoice.customer.phone}</p>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-[10px] mb-4">
            <thead>
              <tr className="bg-indigo-500 text-white">
                <th className="text-left p-1.5 rounded-tl-md">#</th>
                <th className="text-left p-1.5">Item</th>
                <th className="text-center p-1.5">Qty</th>
                <th className="text-right p-1.5">Price</th>
                <th className="text-right p-1.5 rounded-tr-md">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items
                .filter((item) => item.name)
                .map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="p-1.5 text-gray-500">{idx + 1}</td>
                    <td className="p-1.5">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-400 ml-1">
                        ({item.size}, {item.color})
                      </span>
                    </td>
                    <td className="p-1.5 text-center">{item.quantity}</td>
                    <td className="p-1.5 text-right tabular-nums">₹{item.price.toFixed(0)}</td>
                    <td className="p-1.5 text-right font-medium tabular-nums">
                      ₹{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="tabular-nums">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="tabular-nums">-₹{invoice.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">GST ({invoice.taxRate}%)</span>
              <span className="tabular-nums">₹{invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
              <span>Grand Total</span>
              <span className="text-indigo-600 tabular-nums">₹{invoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          {shopSettings.gstNumber && (
            <p className="text-[9px] text-gray-400 mt-3">GST: {shopSettings.gstNumber}</p>
          )}
          <p className="text-[9px] text-gray-400 text-center mt-3">
            Thank you for your purchase!
          </p>
    </>
  );

  if (standalone) {
    return (
      <div className="bg-white rounded-xl p-6 sm:p-8 text-gray-900 shadow-sm border border-gray-100">
        {content}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Eye size={16} className="text-indigo-400" />
          Live Preview
        </h3>
      </div>
      <div className="p-4">
        <div className="bg-white rounded-xl p-6 text-gray-900 shadow-2xl shadow-black/40 max-h-[600px] overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );
}
