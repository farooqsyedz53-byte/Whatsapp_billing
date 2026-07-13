/**
 * API client for Netlify Functions.
 * All backend API calls go through this service.
 */

import type { Invoice } from '@/types';

const API_BASE = '/.netlify/functions';

/** Call the hello health-check function */
export async function callHello(): Promise<{ message: string; timestamp: string }> {
  const res = await fetch(`${API_BASE}/hello`);
  if (!res.ok) throw new Error('Failed to call hello function');
  return res.json();
}

/** Call the generateInvoice function for server-side processing */
export async function callGenerateInvoice(
  invoice: Invoice
): Promise<{ success: boolean; invoice: Invoice }> {
  const res = await fetch(`${API_BASE}/generateInvoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to generate invoice');
  return res.json();
}

/** Call the sendWhatsApp placeholder function */
export async function callSendWhatsApp(
  invoice: Invoice
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/sendWhatsApp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  if (!res.ok) throw new Error('Failed to send WhatsApp message');
  return res.json();
}
