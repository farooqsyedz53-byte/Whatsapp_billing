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
}

export default function InvoiceList({
  invoices,
  shopSettings,
  searchQuery,
  onSearchChange,
  onDuplicate,
  onDelete,
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
      <div className="space-y-2">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="group rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10 transition-all p-4"
          >
            <div className="flex items-center justify-between gap-4">
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

                {/* Mobile dropdown */}
                <div className="md:hidden relative">
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

                  {openDropdown === invoice.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 py-1 animate-scale-in">
                        <Link
                          href={`/invoice/${invoice.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Edit3 size={14} /> Edit
                        </Link>
                        <button
                          onClick={() => { onDuplicate(invoice.id); setOpenDropdown(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Copy size={14} /> Duplicate
                        </button>
                        <button
                          onClick={() => { generateInvoicePDF(invoice, shopSettings); setOpenDropdown(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Download size={14} /> Download PDF
                        </button>
                        <button
                          onClick={() => { shareViaWhatsApp(invoice, shopSettings); setOpenDropdown(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </button>
                        <div className="border-t border-white/5 my-1" />
                        <button
                          onClick={() => { setDeleteId(invoice.id); setOpenDropdown(null); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
