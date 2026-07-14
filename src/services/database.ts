/**
 * Supabase database service.
 * Handles all database operations for invoices.
 * Works alongside LocalStorage — Supabase is the cloud backup + analytics source.
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Invoice } from '@/types';

/** Convert an Invoice object to a Supabase row */
function invoiceToRow(invoice: Invoice) {
  return {
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    date: invoice.date,
    customer_name: invoice.customer.name,
    customer_phone: invoice.customer.phone,
    items: invoice.items,
    subtotal: invoice.subtotal,
    total_discount: invoice.totalDiscount,
    tax_rate: invoice.taxRate,
    tax_amount: invoice.taxAmount,
    grand_total: invoice.grandTotal,
    status: invoice.status,
    notes: invoice.notes,
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
  };
}

/** Convert a Supabase row back to an Invoice object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    date: row.date,
    customer: {
      name: row.customer_name || '',
      phone: row.customer_phone || '',
    },
    items: row.items || [],
    subtotal: parseFloat(row.subtotal) || 0,
    totalDiscount: parseFloat(row.total_discount) || 0,
    taxRate: parseFloat(row.tax_rate) || 18,
    taxAmount: parseFloat(row.tax_amount) || 0,
    grandTotal: parseFloat(row.grand_total) || 0,
    status: row.status || 'draft',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Save an invoice to Supabase (upsert) */
export async function saveInvoiceToCloud(invoice: Invoice): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('invoices')
    .upsert(invoiceToRow(invoice), { onConflict: 'id' });

  if (error) {
    console.error('Failed to save invoice to Supabase:', error);
    return false;
  }
  return true;
}

/** Delete an invoice from Supabase */
export async function deleteInvoiceFromCloud(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('invoices').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete invoice from Supabase:', error);
    return false;
  }
  return true;
}

/** Fetch all invoices from Supabase */
export async function getInvoicesFromCloud(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch invoices from Supabase:', error);
    return [];
  }

  return (data || []).map(rowToInvoice);
}

/** Sync all LocalStorage invoices to Supabase (one-time bulk upload) */
export async function syncLocalToCloud(invoices: Invoice[]): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = getSupabase();
  if (!supabase) return 0;

  const rows = invoices.map(invoiceToRow);

  const { error } = await supabase
    .from('invoices')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Failed to sync invoices to Supabase:', error);
    return 0;
  }

  return rows.length;
}

/** Get turnover stats for a given date range */
export async function getTurnoverStats(startDate: string, endDate: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Failed to fetch turnover stats:', error);
    return null;
  }

  const invoices = (data || []).map(rowToInvoice);

  // Compute daily breakdown
  const dailyMap = new Map<string, { date: string; count: number; revenue: number; paid: number; unpaid: number }>();

  for (const inv of invoices) {
    const day = new Date(inv.date).toISOString().split('T')[0];
    const existing = dailyMap.get(day) || { date: day, count: 0, revenue: 0, paid: 0, unpaid: 0 };
    existing.count += 1;
    existing.revenue += inv.grandTotal;
    if (inv.status === 'paid') {
      existing.paid += inv.grandTotal;
    } else {
      existing.unpaid += inv.grandTotal;
    }
    dailyMap.set(day, existing);
  }

  // Compute top customers
  const customerMap = new Map<string, { name: string; phone: string; totalSpent: number; invoiceCount: number }>();
  for (const inv of invoices) {
    const key = inv.customer.phone || inv.customer.name || 'walk-in';
    const existing = customerMap.get(key) || { name: inv.customer.name || 'Walk-in', phone: inv.customer.phone, totalSpent: 0, invoiceCount: 0 };
    existing.totalSpent += inv.grandTotal;
    existing.invoiceCount += 1;
    customerMap.set(key, existing);
  }

  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  return {
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
    totalPaid: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.grandTotal, 0),
    totalUnpaid: invoices.filter((inv) => inv.status !== 'paid').reduce((sum, inv) => sum + inv.grandTotal, 0),
    dailyBreakdown: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    topCustomers,
  };
}
