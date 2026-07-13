/**
 * Invoices page — view all invoices with search, edit, duplicate, and delete.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useShopSettings } from '@/hooks/useShopSettings';
import InvoiceList from '@/components/invoices/InvoiceList';
import Button from '@/components/ui/Button';

export default function InvoicesPage() {
  const {
    invoices,
    searchQuery,
    setSearchQuery,
    duplicateInvoice,
    removeInvoice,
    isLoading,
  } = useInvoices();

  const { settings } = useShopSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText size={24} className="text-indigo-400" />
            Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all your invoices
          </p>
        </div>

        <Link href="/invoice/new">
          <Button variant="primary" icon={<Plus size={16} />}>
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Invoice List */}
      <InvoiceList
        invoices={invoices}
        shopSettings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDuplicate={duplicateInvoice}
        onDelete={removeInvoice}
      />
    </div>
  );
}
