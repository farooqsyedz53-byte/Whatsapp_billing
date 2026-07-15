/**
 * WhatsApp sharing service.
 * Opens WhatsApp Web/App with a pre-filled invoice summary message.
 */

import type { Invoice, ShopSettings } from '@/types';
import { getInvoicePDFBlob } from './pdf';

/**
 * Generate a WhatsApp-ready invoice summary message.
 */
function formatInvoiceMessage(invoice: Invoice, shopSettings: ShopSettings): string {
  const items = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name} (${item.size}, ${item.color}) x ${item.quantity} - Rs.${item.amount.toFixed(2)}`
    )
    .join('\n');

  const message = `
*INVOICE - ${shopSettings.name || 'Fashion Store'}*
--------------------
Invoice #: ${invoice.invoiceNumber}
Date: ${new Date(invoice.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

*Customer:* ${invoice.customer.name || 'Walk-in'}
Phone: ${invoice.customer.phone || 'N/A'}

*Items:*
${items}

--------------------
Subtotal: Rs.${invoice.subtotal.toFixed(2)}
${invoice.totalDiscount > 0 ? `Discount: -Rs.${invoice.totalDiscount.toFixed(2)}\n` : ''}GST (${invoice.taxRate}%): Rs.${invoice.taxAmount.toFixed(2)}
*Grand Total: Rs.${invoice.grandTotal.toFixed(2)}*
--------------------

Thank you for shopping with us!
${shopSettings.phone ? `Tel: ${shopSettings.phone}` : ''}
${shopSettings.address ? `Address: ${shopSettings.address}` : ''}
`.trim();

  return message;
}

/**
 * Simple LZW-based string compression for reducing URL payload size.
 * Returns a URL-safe base64 string.
 */
function compressToUrlSafe(input: string): string {
  // Simple compression: use built-in TextEncoder + manual LZW-lite
  // We compress then convert to URL-safe base64
  const dict = new Map<string, number>();
  let dictSize = 256;
  for (let i = 0; i < 256; i++) {
    dict.set(String.fromCharCode(i), i);
  }

  const result: number[] = [];
  let w = '';
  for (const c of input) {
    const wc = w + c;
    if (dict.has(wc)) {
      w = wc;
    } else {
      result.push(dict.get(w)!);
      dict.set(wc, dictSize++);
      w = c;
    }
  }
  if (w) result.push(dict.get(w)!);

  // Pack into Uint16 then to base64
  const bytes = new Uint8Array(result.length * 2);
  for (let i = 0; i < result.length; i++) {
    bytes[i * 2] = result[i] >> 8;
    bytes[i * 2 + 1] = result[i] & 0xff;
  }

  // Convert to URL-safe base64
  let b64 = btoa(String.fromCharCode(...bytes));
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return b64;
}

/**
 * Decompress a URL-safe base64 string back to the original string.
 * Used on the bill page to decode the compressed payload.
 */
export function decompressFromUrlSafe(compressed: string): string {
  // Restore standard base64
  let b64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Unpack Uint16 codes
  const codes: number[] = [];
  for (let i = 0; i < bytes.length; i += 2) {
    codes.push((bytes[i] << 8) | bytes[i + 1]);
  }

  // LZW decompress
  const dict: string[] = [];
  for (let i = 0; i < 256; i++) {
    dict.push(String.fromCharCode(i));
  }

  let w = String.fromCharCode(codes[0]);
  const result = [w];

  for (let i = 1; i < codes.length; i++) {
    const code = codes[i];
    let entry: string;
    if (code < dict.length) {
      entry = dict[code];
    } else if (code === dict.length) {
      entry = w + w[0];
    } else {
      throw new Error('Invalid compressed data');
    }
    result.push(entry);
    dict.push(w + entry[0]);
    w = entry;
  }

  return result.join('');
}

/**
 * Share invoice via WhatsApp.
 * Opens WhatsApp with the customer's number (if available) and pre-filled message.
 */
export async function shareViaWhatsApp(invoice: Invoice, shopSettings: ShopSettings): Promise<void> {
  const message = formatInvoiceMessage(invoice, shopSettings);

  // Create a digital bill link by encoding the invoice data (without the large logo image)
  const { logo, ...shopDetails } = shopSettings;
  const payload = JSON.stringify({ i: invoice, s: shopDetails });

  // Compress the payload to dramatically reduce URL length
  const compressed = compressToUrlSafe(encodeURIComponent(payload));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const longBillUrl = `${baseUrl}/bill?c=${compressed}`;

  // Use server-side API route to shorten URL (avoids CORS issues)
  let finalBillUrl = longBillUrl;
  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: longBillUrl }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.shortUrl && data.shortUrl.startsWith('http')) {
        finalBillUrl = data.shortUrl;
      }
    }
  } catch (error) {
    console.warn('Failed to shorten URL, using compressed URL', error);
  }

  let finalMessage = message;
  
  if (shopSettings.upiId) {
    finalMessage += `\n\n*Click below to View Bill & Pay via PhonePe/GPay:*\n${finalBillUrl}`;
  } else {
    finalMessage += `\n\n*View & Download Digital Bill:*\n${finalBillUrl}`;
  }

  // Use wa.me link to ensure the phone number is targeted
  const encodedMessage = encodeURIComponent(finalMessage);
  let phone = '';
  if (invoice.customer.phone) {
    phone = invoice.customer.phone.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '91' + phone; // Default to India country code
    }
  }

  const url = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(url, '_blank');
}

