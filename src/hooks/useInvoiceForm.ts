'use client';

/**
 * Custom hook for invoice form state management.
 * Handles line items, auto-calculations, and validation.
 */

import { useState, useCallback, useMemo } from 'react';
import type { Invoice, InvoiceItem, Customer } from '@/types';
import { generateInvoiceNumber } from '@/services/storage';

/** Create a blank invoice item */
function createBlankItem(): InvoiceItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    size: 'M',
    color: 'Black',
    quantity: 1,
    price: 0,
    discount: 0,
    amount: 0,
  };
}

/** Calculate the amount for a single item */
function calculateItemAmount(item: InvoiceItem): number {
  const gross = item.price * item.quantity;
  const discountAmount = (gross * item.discount) / 100;
  return gross - discountAmount;
}

interface UseInvoiceFormOptions {
  /** If provided, pre-populates the form for editing */
  existingInvoice?: Invoice;
}

export function useInvoiceForm(options?: UseInvoiceFormOptions) {
  const existing = options?.existingInvoice;

  const [customer, setCustomer] = useState<Customer>(
    existing?.customer || { name: '', phone: '' }
  );

  const [items, setItems] = useState<InvoiceItem[]>(
    existing?.items || [createBlankItem()]
  );

  const [taxRate, setTaxRate] = useState<number>(existing?.taxRate ?? 18);
  const [notes, setNotes] = useState(existing?.notes || '');
  const [status, setStatus] = useState<string>(existing?.status || 'paid');

  /** Add a new blank item row */
  const addItem = useCallback(() => {
    setItems((prev) => [...prev, createBlankItem()]);
  }, []);

  /** Remove an item by ID */
  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev; // Keep at least one item
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  /** Update a specific field on an item */
  const updateItem = useCallback(
    (id: string, field: keyof InvoiceItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };
          // Recalculate amount whenever price, quantity, or discount changes
          updated.amount = calculateItemAmount(updated);
          return updated;
        })
      );
    },
    []
  );

  // ─── Auto-calculated totals ─────────────────────────────

  const totals = useMemo(() => {
    const grossTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscount = grossTotal - subtotal;
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    return { subtotal, totalDiscount, taxAmount, grandTotal };
  }, [items, taxRate]);

  /** Build the complete invoice object */
  const buildInvoice = useCallback((): Invoice => {
    const now = new Date().toISOString();
    return {
      id: existing?.id || crypto.randomUUID(),
      invoiceNumber: existing?.invoiceNumber || generateInvoiceNumber(),
      date: existing?.date || now,
      customer,
      items: items.map((item) => ({
        ...item,
        amount: calculateItemAmount(item),
      })),
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      taxRate,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      status: status as Invoice['status'],
      notes,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
  }, [existing, customer, items, taxRate, notes, status, totals]);

  /** Validate the form — returns error messages or empty array */
  const validate = useCallback((): string[] => {
    const errors: string[] = [];
    if (items.length === 0) errors.push('At least one item is required');
    
    const hasValidItem = items.some(
      (item) => item.name.trim() && item.price > 0 && item.quantity > 0
    );
    if (!hasValidItem) errors.push('At least one item must have a name, price, and quantity');

    return errors;
  }, [items]);

  /** Reset form to blank state */
  const resetForm = useCallback(() => {
    setCustomer({ name: '', phone: '' });
    setItems([createBlankItem()]);
    setTaxRate(18);
    setNotes('');
    setStatus('paid');
  }, []);

  return {
    // State
    customer,
    items,
    taxRate,
    notes,
    status,
    totals,

    // Setters
    setCustomer,
    setTaxRate,
    setNotes,
    setStatus,

    // Item operations
    addItem,
    removeItem,
    updateItem,

    // Form operations
    buildInvoice,
    validate,
    resetForm,
  };
}
