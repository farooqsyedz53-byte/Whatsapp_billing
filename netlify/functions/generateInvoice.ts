/**
 * generateInvoice — Netlify Function for server-side invoice processing.
 * Accepts invoice data via POST, validates, computes totals, and returns
 * the processed invoice.
 */

import type { Context } from '@netlify/functions';

/** Invoice item structure (server-side validation) */
interface InvoiceItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  discount: number;
}

export default async (req: Request, _context: Context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'At least one item is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Server-side total computation for validation
    const taxRate = body.taxRate ?? 18;
    let subtotal = 0;
    let totalDiscount = 0;

    const processedItems = body.items.map((item: InvoiceItem) => {
      const gross = item.price * item.quantity;
      const discountAmount = (gross * (item.discount || 0)) / 100;
      const amount = gross - discountAmount;

      subtotal += amount;
      totalDiscount += discountAmount;

      return {
        ...item,
        amount: Math.round(amount * 100) / 100,
      };
    });

    const taxAmount = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          ...body,
          items: processedItems,
          subtotal: Math.round(subtotal * 100) / 100,
          totalDiscount: Math.round(totalDiscount * 100) / 100,
          taxRate,
          taxAmount,
          grandTotal,
          processedAt: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid request body',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
