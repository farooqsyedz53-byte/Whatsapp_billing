/**
 * Edit Invoice page — loads an existing invoice and allows editing.
 * Reuses the same form components as the New Invoice page.
 */

'use client';

import React, { useContext, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Edit3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Invoice } from '@/types';
import { getInvoiceById, updateInvoice } from '@/services/storage';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { useShopSettings } from '@/hooks/useShopSettings';
import { generateInvoicePDF, printInvoicePDF } from '@/services/pdf';
import { shareViaWhatsApp } from '@/services/whatsapp';
import CustomerForm from '@/components/invoice/CustomerForm';
import ItemsTable from '@/components/invoice/ItemsTable';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import InvoiceActions from '@/components/invoice/InvoiceActions';
import { ToastContext } from '@/components/layout/AppShell';
import EmptyState from '@/components/ui/EmptyState';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { settings } = useShopSettings();
  const { showToast } = useContext(ToastContext);

  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the invoice on mount
  useEffect(() => {
    const inv = getInvoiceById(invoiceId);
    if (inv) {
      setExistingInvoice(inv);
    }
    setIsLoading(false);
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!existingInvoice) {
    return (
      <EmptyState
        icon={<Edit3 size={28} />}
        title="Invoice not found"
        description="The invoice you're looking for doesn't exist or has been deleted."
        action={
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl"
          >
            Go to Invoices
          </Link>
        }
      />
    );
  }

  return <EditInvoiceForm invoice={existingInvoice} settings={settings} showToast={showToast} router={router} />;
}

/** Separate component so useInvoiceForm can receive the existing invoice */
function EditInvoiceForm({
  invoice: existingInvoice,
  settings,
  showToast,
  router,
}: {
  invoice: Invoice;
  settings: ReturnType<typeof useShopSettings>['settings'];
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  router: ReturnType<typeof useRouter>;
}) {
  const {
    customer,
    items,
    taxRate,
    notes,
    status,
    totals,
    setCustomer,
    setTaxRate,
    setNotes,
    setStatus,
    addItem,
    removeItem,
    updateItem,
    buildInvoice,
    validate,
  } = useInvoiceForm({ existingInvoice });

  const previewInvoice = buildInvoice();

  const handleSave = () => {
    const errors = validate();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }

    const invoice = buildInvoice();
    updateInvoice(invoice);
    showToast('Invoice updated successfully!', 'success');
    router.push('/invoices');
  };

  const handleDownloadPDF = async () => {
    const invoice = buildInvoice();
    await generateInvoicePDF(invoice, settings);
    showToast('PDF downloaded!', 'success');
  };

  const handlePrint = async () => {
    const invoice = buildInvoice();
    await printInvoicePDF(invoice, settings);
  };

  const handleShareWhatsApp = () => {
    const invoice = buildInvoice();
    shareViaWhatsApp(invoice, settings);
  };

  return (
    <div className="page-enter space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/invoices"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Edit3 size={24} className="text-indigo-400" />
            Edit Invoice
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Editing {existingInvoice.invoiceNumber}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Invoice Form */}
        <div className="xl:col-span-2 space-y-4">
          <CustomerForm customer={customer} onChange={setCustomer} />
          <ItemsTable
            items={items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
          <InvoiceSummary
            subtotal={totals.subtotal}
            totalDiscount={totals.totalDiscount}
            taxRate={taxRate}
            taxAmount={totals.taxAmount}
            grandTotal={totals.grandTotal}
            notes={notes}
            status={status}
            onTaxRateChange={setTaxRate}
            onNotesChange={setNotes}
            onStatusChange={setStatus}
          />
          <InvoiceActions
            onSave={handleSave}
            onDownloadPDF={handleDownloadPDF}
            onPrint={handlePrint}
            onShareWhatsApp={handleShareWhatsApp}
            isEdit
          />
        </div>

        {/* Right: Live Preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-20">
            <InvoicePreview invoice={previewInvoice} shopSettings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
