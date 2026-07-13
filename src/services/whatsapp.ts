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
 * Share invoice via WhatsApp.
 * Opens WhatsApp with the customer's number (if available) and pre-filled message.
 */
export async function shareViaWhatsApp(invoice: Invoice, shopSettings: ShopSettings): Promise<void> {
  const message = formatInvoiceMessage(invoice, shopSettings);

  // Create a digital bill link by encoding the invoice data (without the large logo image)
  const { logo, ...shopDetails } = shopSettings;
  const payload = { i: invoice, s: shopDetails };
  const encodedData = btoa(encodeURIComponent(JSON.stringify(payload)));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const longBillUrl = `${baseUrl}/bill?d=${encodedData}`;

  // Use TinyURL free API to shorten the long link
  let finalBillUrl = longBillUrl;
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longBillUrl)}`);
    if (response.ok) {
      finalBillUrl = await response.text();
    }
  } catch (error) {
    console.warn('Failed to shorten URL with TinyURL, using long URL', error);
  }

  const finalMessage = `${message}\n\n*View & Download Digital Bill:*\n${finalBillUrl}`;

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
