/**
 * New Invoice page — create a new invoice with live preview.
 * Features customer form, items table, summary, and action buttons.
 */

'use client';

import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus } from 'lucide-react';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { useShopSettings } from '@/hooks/useShopSettings';
import { saveInvoice } from '@/services/storage';
import { generateInvoicePDF, printInvoicePDF } from '@/services/pdf';
import { shareViaWhatsApp } from '@/services/whatsapp';
import CustomerForm from '@/components/invoice/CustomerForm';
import ItemsTable from '@/components/invoice/ItemsTable';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import InvoiceActions from '@/components/invoice/InvoiceActions';
import { ToastContext } from '@/components/layout/AppShell';

export default function NewInvoicePage() {
  const router = useRouter();
  const { settings } = useShopSettings();
  const { showToast } = useContext(ToastContext);

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
    resetForm,
  } = useInvoiceForm();

  // Build the invoice for preview (without saving)
  const previewInvoice = buildInvoice();

  const handleSave = () => {
    const errors = validate();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }

    const invoice = buildInvoice();
    saveInvoice(invoice);
    showToast('Invoice saved successfully!', 'success');
    resetForm();
    router.push('/invoices');
  };

  const handleDownloadPDF = async () => {
    const errors = validate();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }
    const invoice = buildInvoice();
    await generateInvoicePDF(invoice, settings);
    showToast('PDF downloaded!', 'success');
  };

  const handlePrint = async () => {
    const errors = validate();
    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return;
    }
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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FilePlus size={24} className="text-indigo-400" />
          New Invoice
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new invoice for your customer
        </p>
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
