/**
 * WhatsApp sharing service.
 * Opens WhatsApp Web/App with a pre-filled invoice summary message.
 */

import type { Invoice, ShopSettings } from '@/types';

/**
 * Generate a WhatsApp-ready invoice summary message.
 */
function formatInvoiceMessage(invoice: Invoice, shopSettings: ShopSettings): string {
  const items = invoice.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name} (${item.size}, ${item.color}) × ${item.quantity} — ₹${item.amount.toFixed(2)}`
    )
    .join('\n');

  const message = `
🧾 *INVOICE — ${shopSettings.name || 'Fashion Store'}*
━━━━━━━━━━━━━━━━━━━━
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

━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹${invoice.subtotal.toFixed(2)}
${invoice.totalDiscount > 0 ? `Discount: -₹${invoice.totalDiscount.toFixed(2)}\n` : ''}GST (${invoice.taxRate}%): ₹${invoice.taxAmount.toFixed(2)}
*💰 Grand Total: ₹${invoice.grandTotal.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━

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
export function shareViaWhatsApp(invoice: Invoice, shopSettings: ShopSettings): void {
  const message = formatInvoiceMessage(invoice, shopSettings);
  const encodedMessage = encodeURIComponent(message);

  // If customer phone is available, pre-fill the number
  let phone = '';
  if (invoice.customer.phone) {
    // Remove non-numeric characters and ensure country code
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
