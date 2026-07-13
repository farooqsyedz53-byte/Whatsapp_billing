'use client';

/**
 * Custom hook for managing invoices with LocalStorage sync.
 * Provides CRUD operations, search, and duplicate functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Invoice } from '@/types';
import * as storage from '@/services/storage';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load invoices from localStorage on mount
  useEffect(() => {
    setInvoices(storage.getInvoices());
    setIsLoading(false);
  }, []);

  /** Refresh invoices from storage */
  const refresh = useCallback(() => {
    setInvoices(storage.getInvoices());
  }, []);

  /** Save a new invoice */
  const addInvoice = useCallback((invoice: Invoice) => {
    storage.saveInvoice(invoice);
    setInvoices(storage.getInvoices());
  }, []);

  /** Update an existing invoice */
  const editInvoice = useCallback((invoice: Invoice) => {
    storage.updateInvoice(invoice);
    setInvoices(storage.getInvoices());
  }, []);

  /** Delete an invoice by ID */
  const removeInvoice = useCallback((id: string) => {
    storage.deleteInvoice(id);
    setInvoices(storage.getInvoices());
  }, []);

  /** Duplicate an invoice with a new ID and invoice number */
  const duplicateInvoice = useCallback((id: string) => {
    const original = storage.getInvoiceById(id);
    if (!original) return;

    const duplicate: Invoice = {
      ...original,
      id: crypto.randomUUID(),
      invoiceNumber: storage.generateInvoiceNumber(),
      date: new Date().toISOString(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveInvoice(duplicate);
    setInvoices(storage.getInvoices());
  }, []);

  /** Get a single invoice by ID */
  const getInvoice = useCallback((id: string) => {
    return storage.getInvoiceById(id);
  }, []);

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customer.name.toLowerCase().includes(q) ||
      inv.customer.phone.includes(q) ||
      inv.grandTotal.toString().includes(q)
    );
  });

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    isLoading,
    searchQuery,
    setSearchQuery,
    addInvoice,
    editInvoice,
    removeInvoice,
    duplicateInvoice,
    getInvoice,
    refresh,
  };
}
