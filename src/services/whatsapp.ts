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
export async function shareViaWhatsApp(invoice: Invoice, shopSettings: ShopSettings): Promise<void> {
  const message = formatInvoiceMessage(invoice, shopSettings);

  try {
    // Attempt to use Web Share API with the PDF file (works on modern mobile browsers & some desktop)
    if (navigator.share && navigator.canShare) {
      const pdfBlob = await getInvoicePDFBlob(invoice, shopSettings);
      const file = new File([pdfBlob], `${invoice.invoiceNumber}.pdf`, {
        type: 'application/pdf',
      });
      
      const shareData = {
        title: `Invoice ${invoice.invoiceNumber}`,
        text: message,
        files: [file],
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return; // Successfully shared via native dialog
      }
    }
  } catch (error) {
    console.warn('Web Share API failed or was cancelled, falling back to wa.me link.', error);
  }

  // Fallback to text-only wa.me link if Web Share is unsupported or fails
  const encodedMessage = encodeURIComponent(message);
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
