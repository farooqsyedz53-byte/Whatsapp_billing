/**
 * HTML generation service.
 * Generates a standalone, offline-ready HTML file for the invoice.
 */

import type { Invoice, ShopSettings } from '@/types';

export function generateInvoiceHTML(invoice: Invoice, shopSettings: ShopSettings): string {
  const itemsHtml = invoice.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; color: #666;">${idx + 1}</td>
        <td style="padding: 10px;">
          <strong>${item.name}</strong><br/>
          <span style="color: #888; font-size: 12px;">(${item.size}, ${item.color})</span>
        </td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">Rs.${item.price.toFixed(2)}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">Rs.${item.amount.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .shop-details h1 { margin: 0 0 5px 0; font-size: 24px; color: #111827; }
    .shop-details p { margin: 2px 0; color: #6b7280; font-size: 14px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { margin: 0; color: #6366f1; font-size: 20px; text-transform: uppercase; }
    .invoice-title p { margin: 4px 0; color: #6b7280; font-size: 14px; }
    
    .customer-box {
      background: #f5f7ff;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .customer-box h3 { margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; color: #6b7280; }
    .customer-box p { margin: 3px 0; font-size: 14px; font-weight: 500; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #6366f1; color: white; padding: 12px 10px; text-align: left; font-size: 14px; }
    th:first-child { border-radius: 6px 0 0 6px; }
    th:last-child { border-radius: 0 6px 6px 0; text-align: right; }
    
    .totals {
      width: 300px;
      float: right;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
      color: #4b5563;
    }
    .totals-row.grand-total {
      font-size: 18px;
      font-weight: bold;
      color: #6366f1;
      border-bottom: none;
      border-top: 2px solid #e5e7eb;
      padding-top: 15px;
      margin-top: 5px;
    }
    .clearfix::after { content: ""; clear: both; display: table; }
    
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #9ca3af;
      font-size: 12px;
    }
    
    @media print {
      body { background: white; padding: 0; }
      .invoice-container { box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="shop-details">
        <h1>${shopSettings.name || 'Fashion Store'}</h1>
        ${shopSettings.address ? `<p>${shopSettings.address}</p>` : ''}
        ${shopSettings.phone ? `<p>Tel: ${shopSettings.phone}</p>` : ''}
        ${shopSettings.gstNumber ? `<p>GST: ${shopSettings.gstNumber}</p>` : ''}
      </div>
      <div class="invoice-title">
        <h2>TAX INVOICE</h2>
        <p>#${invoice.invoiceNumber}</p>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
      </div>
    </div>

    <div class="customer-box">
      <h3>Bill To</h3>
      <p style="font-size: 16px;">${invoice.customer.name || 'Walk-in Customer'}</p>
      ${invoice.customer.phone ? `<p style="color: #6b7280; font-weight: 400;">Phone: ${invoice.customer.phone}</p>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals clearfix">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>Rs.${invoice.subtotal.toFixed(2)}</span>
      </div>
      ${invoice.totalDiscount > 0 ? `
      <div class="totals-row" style="color: #10b981;">
        <span>Discount</span>
        <span>-Rs.${invoice.totalDiscount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="totals-row">
        <span>GST (${invoice.taxRate}%)</span>
        <span>Rs.${invoice.taxAmount.toFixed(2)}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Grand Total</span>
        <span>Rs.${invoice.grandTotal.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="clearfix"></div>

    <div class="footer">
      <p>Thank you for your purchase!</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
