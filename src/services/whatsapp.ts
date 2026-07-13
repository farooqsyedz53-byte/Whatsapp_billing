/**
 * WhatsApp sharing service.
 * Opens WhatsApp Web/App with a pre-filled invoice summary message.
 */

import type { Invoice, ShopSettings } from '@/types';
import { generateInvoiceHTML } from './html';

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
🧾 *INVOICE - ${shopSettings.name || 'Fashion Store'}*
--------------------
Invoice #: ${invoice.invoiceNumber}
Date: ${new Date(invoice.date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

👤 *Customer:* ${invoice.customer.name || 'Walk-in'}
📱 Phone: ${invoice.customer.phone || 'N/A'}

📦 *Items:*
${items}

--------------------
Subtotal: Rs.${invoice.subtotal.toFixed(2)}
${invoice.totalDiscount > 0 ? `Discount: -Rs.${invoice.totalDiscount.toFixed(2)}\n` : ''}GST (${invoice.taxRate}%): Rs.${invoice.taxAmount.toFixed(2)}
*💰 Grand Total: Rs.${invoice.grandTotal.toFixed(2)}*
--------------------

Thank you for shopping with us! 🛍️
${shopSettings.phone ? `📞 ${shopSettings.phone}` : ''}
${shopSettings.address ? `📍 ${shopSettings.address}` : ''}
`.trim();

  return message;
}

/**
 * Share invoice via WhatsApp.
 * Opens WhatsApp with the customer's number (if available) and pre-filled message.
 */
export async function shareViaWhatsApp(invoice: Invoice, shopSettings: ShopSettings): Promise<void> {
  // 1. Generate and download the standalone HTML file automatically
  const htmlContent = generateInvoiceHTML(invoice, shopSettings);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice_${invoice.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // 2. Open WhatsApp with pre-filled text and phone number
  const message = formatInvoiceMessage(invoice, shopSettings);
  const finalMessage = `${message}\n\n*(Please attach the downloaded HTML invoice file manually)*`;

  const encodedMessage = encodeURIComponent(finalMessage);
  let phone = '';
  if (invoice.customer.phone) {
    phone = invoice.customer.phone.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '91' + phone; // Default to India country code
    }
  }

  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;

  window.open(waUrl, '_blank');
}
