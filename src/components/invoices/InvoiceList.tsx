/**
 * Invoice list component for the invoices page.
 * Supports search, edit, duplicate, delete actions.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Edit3,
  Copy,
  Trash2,
  Download,
  MessageCircle,
  MoreVertical,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import type { Invoice, ShopSettings } from '@/types';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { generateInvoicePDF } from '@/services/pdf';
import { shareViaWhatsApp } from '@/services/whatsapp';

interface InvoiceListProps {
  invoices: Invoice[];
  shopSettings: ShopSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

export default function InvoiceList({
  invoices,
  shopSettings,
  searchQuery,
  onSearchChange,
  onDuplicate,
  onDelete,
  onMarkPaid,
}: InvoiceListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (invoices.length === 0 && !searchQuery) {
    return (
      <EmptyState
        icon={<FileText size={28} />}
        title="No invoices yet"
        description="Start by creating your first invoice. It will appear here."
        action={
          <Link
            href="/invoice/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
          >
            Create Invoice
          </Link>
        }
      />
    );
  }

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          placeholder="Search by invoice #, customer name, phone, or amount..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-3">
        {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
      </p>

      {/* No results */}
      {invoices.length === 0 && searchQuery && (
        <EmptyState
          icon={<Search size={28} />}
          title="No results found"
          description={`No invoices match "${searchQuery}". Try a different search.`}
        />
      )}

      {/* Invoice cards */}
      <div className="space-y-3">
        {invoices.map((invoice, idx) => (
          <div
            key={invoice.id}
            className="group rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 p-4 animate-slide-in-up"
            style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: Invoice info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-semibold text-indigo-400">
                    {invoice.invoiceNumber}
                  </span>
                  <Badge status={invoice.status} />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white truncate">
                    {invoice.customer.name || 'Walk-in'}
                  </span>
                  <span className="text-gray-500 hidden sm:inline">
                    {new Date(invoice.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-gray-500 hidden md:inline">
                    {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Right: Amount + Actions */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-white tabular-nums whitespace-nowrap">
                  ₹{invoice.grandTotal.toFixed(2)}
                </span>

                {/* Action buttons (desktop) */}
                <div className="hidden md:flex items-center gap-1">
                  {invoice.status !== 'paid' && (
                    <button
                      onClick={() => onMarkPaid(invoice.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      title="Mark as Paid"
                    >
                      <CheckCircle2 size={15} />
                    </button>
                  )}
                  <Link
                    href={`/invoice/${invoice.id}/edit`}
                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                    title="Edit"
                  >
                    <Edit3 size={15} />
                  </Link>
                  <button
                    onClick={() => onDuplicate(invoice.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    title="Duplicate"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    onClick={() => generateInvoicePDF(invoice, shopSettings)}
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    title="Download PDF"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(invoice, shopSettings)}
                    className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                    title="Share WhatsApp"
                  >
                    <MessageCircle size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(invoice.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Mobile dropdown trigger */}
                <div className="md:hidden">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === invoice.id ? null : invoice.id
                      )
                    }
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile bottom-sheet action menu — rendered outside card stacking context */}
      {openDropdown && (() => {
        const activeInvoice = invoices.find(inv => inv.id === openDropdown);
        if (!activeInvoice) return null;
        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpenDropdown(null)}
              style={{ animation: 'fadeIn 0.15s ease-out' }}
            />
            {/* Bottom sheet */}
            <div
              className="fixed bottom-0 left-0 right-0 z-[101] md:hidden bg-gray-900 border-t border-white/10 rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]"
              style={{ animation: 'slideUp 0.2s ease-out' }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Invoice info header */}
              <div className="px-5 pb-3 border-b border-white/5">
                <p className="text-sm font-semibold text-white">{activeInvoice.invoiceNumber}</p>
                <p className="text-xs text-gray-400">
                  {activeInvoice.customer.name || 'Walk-in'} · ₹{activeInvoice.grandTotal.toFixed(2)}
                </p>
              </div>

              {/* Action buttons */}
              <div className="py-2">
                {activeInvoice.status !== 'paid' && (
                  <button
                    onClick={() => { onMarkPaid(activeInvoice.id); setOpenDropdown(null); }}
                    className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-emerald-400 active:bg-emerald-500/10 transition-colors"
                  >
                    <CheckCircle2 size={18} /> Mark as Paid
                  </button>
                )}
                <Link
                  href={`/invoice/${activeInvoice.id}/edit`}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-gray-200 active:bg-white/5 transition-colors"
                  onClick={() => setOpenDropdown(null)}
                >
                  <Edit3 size={18} /> Edit Invoice
                </Link>
                <button
                  onClick={() => { onDuplicate(activeInvoice.id); setOpenDropdown(null); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-gray-200 active:bg-white/5 transition-colors"
                >
                  <Copy size={18} /> Duplicate
                </button>
                <button
                  onClick={() => { generateInvoicePDF(activeInvoice, shopSettings); setOpenDropdown(null); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-gray-200 active:bg-white/5 transition-colors"
                >
                  <Download size={18} /> Download PDF
                </button>
                <button
                  onClick={() => { shareViaWhatsApp(activeInvoice, shopSettings); setOpenDropdown(null); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-gray-200 active:bg-white/5 transition-colors"
                >
                  <MessageCircle size={18} /> Share via WhatsApp
                </button>
                <div className="border-t border-white/5 my-1" />
                <button
                  onClick={() => { setDeleteId(activeInvoice.id); setOpenDropdown(null); }}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-sm text-red-400 active:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={18} /> Delete Invoice
                </button>
              </div>

              {/* Cancel button */}
              <div className="px-4 pb-4 pt-1">
                <button
                  onClick={() => setOpenDropdown(null)}
                  className="w-full py-3 rounded-xl bg-white/5 text-sm font-medium text-gray-300 active:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Invoice"
        size="sm"
      >
        <p className="text-sm text-gray-300 mb-4">
          Are you sure you want to delete this invoice? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
