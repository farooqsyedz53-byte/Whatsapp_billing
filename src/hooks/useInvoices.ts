'use client';

/**
 * Custom hook for managing invoices with LocalStorage + Supabase cloud sync.
 * LocalStorage is the primary store (works offline).
 * Supabase is the cloud backup for analytics and monthly reports.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Invoice } from '@/types';
import * as storage from '@/services/storage';
import {
  saveInvoiceToCloud,
  deleteInvoiceFromCloud,
  syncLocalToCloud,
  getInvoicesFromCloud,
} from '@/services/database';
import { isSupabaseConfigured } from '@/lib/supabase';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const hasSynced = useRef(false);

  // Load invoices from localStorage on mount, then sync to cloud
  useEffect(() => {
    const localInvoices = storage.getInvoices();
    setInvoices(localInvoices);
    setIsLoading(false);

    // Sync: push local to cloud, and fetch cloud to merge locally
    if (isSupabaseConfigured() && !hasSynced.current) {
      hasSynced.current = true;
      
      const sync = async () => {
        // Push any local invoices to cloud
        if (localInvoices.length > 0) {
          syncLocalToCloud(localInvoices).catch(console.error);
        }

        // Fetch cloud invoices
        try {
          const cloudInvoices = await getInvoicesFromCloud();
          if (cloudInvoices.length > 0) {
            const merged = [...localInvoices];
            let changed = false;

            for (const cInv of cloudInvoices) {
              const existingIdx = merged.findIndex((lInv) => lInv.id === cInv.id);
              if (existingIdx === -1) {
                // If it doesn't exist locally, add it
                merged.push(cInv);
                changed = true;
              } else {
                // If it exists locally, take the most recently updated one
                if (new Date(cInv.updatedAt).getTime() > new Date(merged[existingIdx].updatedAt).getTime()) {
                  merged[existingIdx] = cInv;
                  changed = true;
                }
              }
            }

            if (changed) {
              // Sort by newest first
              merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              storage.saveAllInvoices(merged);
              setInvoices(merged);
            }
          }
        } catch (err) {
          console.error('Failed to sync invoices from cloud:', err);
        }
      };

      sync();
    }
  }, []);

  /** Refresh invoices from storage */
  const refresh = useCallback(() => {
    setInvoices(storage.getInvoices());
  }, []);

  /** Save a new invoice (LocalStorage + Cloud) */
  const addInvoice = useCallback((invoice: Invoice) => {
    storage.saveInvoice(invoice);
    setInvoices(storage.getInvoices());
    // Fire-and-forget cloud save
    saveInvoiceToCloud(invoice);
  }, []);

  /** Update an existing invoice (LocalStorage + Cloud) */
  const editInvoice = useCallback((invoice: Invoice) => {
    storage.updateInvoice(invoice);
    setInvoices(storage.getInvoices());
    saveInvoiceToCloud(invoice);
  }, []);

  /** Delete an invoice by ID (LocalStorage + Cloud) */
  const removeInvoice = useCallback((id: string) => {
    storage.deleteInvoice(id);
    setInvoices(storage.getInvoices());
    deleteInvoiceFromCloud(id);
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
    saveInvoiceToCloud(duplicate);
  }, []);

  /** Get a single invoice by ID */
  const getInvoice = useCallback((id: string) => {
    return storage.getInvoiceById(id);
  }, []);

  /** Mark an invoice as paid (LocalStorage + Cloud) */
  const markAsPaid = useCallback((id: string) => {
    const invoice = storage.getInvoiceById(id);
    if (invoice) {
      const updated = { ...invoice, status: 'paid' as const, updatedAt: new Date().toISOString() };
      storage.updateInvoice(updated);
      setInvoices(storage.getInvoices());
      saveInvoiceToCloud(updated);
    }
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
    markAsPaid,
    refresh,
  };
}
