/**
 * LocalStorage service for persisting invoices and shop settings.
 * All data is stored client-side — no database required.
 */

import type { Invoice, ShopSettings, DashboardStats } from '@/types';
import { DEFAULT_SHOP_SETTINGS } from '@/types';

// Storage keys
const KEYS = {
  INVOICES: 'stylebill_invoices',
  SHOP_SETTINGS: 'stylebill_shop_settings',
  INVOICE_COUNTER: 'stylebill_invoice_counter',
} as const;

// ─── Helper ───────────────────────────────────────────────────────────

/** Safely parse JSON from localStorage */
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Save data to localStorage as JSON */
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Invoice Operations ───────────────────────────────────────────────

/** Retrieve all invoices, sorted by date descending (newest first) */
export function getInvoices(): Invoice[] {
  const invoices = getFromStorage<Invoice[]>(KEYS.INVOICES, []);
  return invoices.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Save a new invoice to storage */
export function saveInvoice(invoice: Invoice): void {
  const invoices = getFromStorage<Invoice[]>(KEYS.INVOICES, []);
  invoices.push(invoice);
  saveToStorage(KEYS.INVOICES, invoices);
}

/** Update an existing invoice by ID */
export function updateInvoice(updatedInvoice: Invoice): void {
  const invoices = getFromStorage<Invoice[]>(KEYS.INVOICES, []);
  const index = invoices.findIndex((inv) => inv.id === updatedInvoice.id);
  if (index !== -1) {
    invoices[index] = { ...updatedInvoice, updatedAt: new Date().toISOString() };
    saveToStorage(KEYS.INVOICES, invoices);
  }
}

/** Delete an invoice by ID */
export function deleteInvoice(id: string): void {
  const invoices = getFromStorage<Invoice[]>(KEYS.INVOICES, []);
  const filtered = invoices.filter((inv) => inv.id !== id);
  saveToStorage(KEYS.INVOICES, filtered);
}

/** Get a single invoice by ID */
export function getInvoiceById(id: string): Invoice | undefined {
  const invoices = getFromStorage<Invoice[]>(KEYS.INVOICES, []);
  return invoices.find((inv) => inv.id === id);
}

// ─── Invoice Number Generation ────────────────────────────────────────

/**
 * Generate the next sequential invoice number.
 * Format: INV-YYYYMMDD-NNN (e.g., INV-20260713-001)
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const counter = getFromStorage<number>(KEYS.INVOICE_COUNTER, 0) + 1;
  saveToStorage(KEYS.INVOICE_COUNTER, counter);
  const padded = String(counter).padStart(3, '0');
  return `INV-${dateStr}-${padded}`;
}

// ─── Shop Settings ────────────────────────────────────────────────────

/** Retrieve shop settings (or defaults if not configured) */
export function getShopSettings(): ShopSettings {
  return getFromStorage<ShopSettings>(KEYS.SHOP_SETTINGS, DEFAULT_SHOP_SETTINGS);
}

/** Save shop settings */
export function saveShopSettings(settings: ShopSettings): void {
  saveToStorage(KEYS.SHOP_SETTINGS, settings);
}

// ─── Dashboard Statistics ─────────────────────────────────────────────

/** Compute dashboard statistics from stored invoices */
export function getDashboardStats(): DashboardStats {
  const invoices = getInvoices();
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = now.toISOString().slice(0, 7);

  // Filter invoices that are paid (not cancelled/draft)
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');

  // Today's invoices
  const todayInvoices = paidInvoices.filter(
    (inv) => inv.date.slice(0, 10) === todayStr
  );

  // This month's invoices
  const thisMonthInvoices = paidInvoices.filter(
    (inv) => inv.date.slice(0, 7) === monthStr
  );

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  return {
    todaySales: todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
    todayInvoiceCount: todayInvoices.length,
    totalInvoices: invoices.length,
    totalRevenue,
    averageOrderValue: paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0,
    thisMonthSales: thisMonthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
  };
}
