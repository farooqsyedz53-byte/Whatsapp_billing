/**
 * PDF generation service using jsPDF + jspdf-autotable.
 * Creates professional invoice PDFs with shop branding.
 */

import type { Invoice, ShopSettings } from '@/types';

/**
 * Common internal function to build the jsPDF document.
 */
async function buildInvoicePDFDoc(
  invoice: Invoice,
  shopSettings: ShopSettings
) {
  // Dynamic imports to avoid SSR issues in Next.js
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // ─── Shop Logo ────────────────────────────────────────────
  if (shopSettings.logo) {
    try {
      doc.addImage(shopSettings.logo, 'PNG', margin, y, 25, 25);
    } catch {
      // Skip logo if it fails to render
    }
  }

  // ─── Shop Header ──────────────────────────────────────────
  const headerX = shopSettings.logo ? margin + 30 : margin;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(shopSettings.name || 'Fashion Store', headerX, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  if (shopSettings.address) {
    doc.text(shopSettings.address, headerX, y + 14);
  }
  if (shopSettings.phone) {
    doc.text(`Phone: ${shopSettings.phone}`, headerX, y + 19);
  }
  if (shopSettings.gstNumber) {
    doc.text(`GST: ${shopSettings.gstNumber}`, headerX, y + 24);
  }

  y += 35;

  // ─── Divider Line ─────────────────────────────────────────
  doc.setDrawColor(99, 102, 241); // Indigo accent
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ─── Invoice Title ────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text('TAX INVOICE', pageWidth - margin, y, { align: 'right' });

  // ─── Invoice Details ──────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, margin, y);
  y += 6;
  doc.text(
    `Date: ${new Date(invoice.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    margin,
    y
  );
  y += 10;

  // ─── Customer Details ─────────────────────────────────────
  doc.setFillColor(245, 247, 255);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'F');
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Bill To:', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer.name || 'Walk-in Customer', margin + 22, y);
  y += 6;
  if (invoice.customer.phone) {
    doc.text(`Phone: ${invoice.customer.phone}`, margin + 22, y);
  }
  y += 12;

  // ─── Items Table ──────────────────────────────────────────
  const tableColumns = [
    { header: '#', dataKey: 'index' },
    { header: 'Item', dataKey: 'name' },
    { header: 'Size', dataKey: 'size' },
    { header: 'Color', dataKey: 'color' },
    { header: 'Qty', dataKey: 'quantity' },
    { header: 'Price (₹)', dataKey: 'price' },
    { header: 'Disc %', dataKey: 'discount' },
    { header: 'Amount (₹)', dataKey: 'amount' },
  ];

  const tableData = invoice.items.map((item, idx) => ({
    index: idx + 1,
    name: item.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    price: item.price.toFixed(2),
    discount: `${item.discount}%`,
    amount: item.amount.toFixed(2),
  }));

  autoTable(doc, {
    startY: y,
    columns: tableColumns,
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 255],
    },
    columnStyles: {
      index: { cellWidth: 10, halign: 'center' },
      quantity: { halign: 'center' },
      price: { halign: 'right' },
      discount: { halign: 'center' },
      amount: { halign: 'right' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ─── Totals Section ───────────────────────────────────────
  const totalsX = pageWidth - margin - 80;
  const totalsValueX = pageWidth - margin;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  // Subtotal
  doc.text('Subtotal:', totalsX, y);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, totalsValueX, y, { align: 'right' });
  y += 6;

  // Discount
  if (invoice.totalDiscount > 0) {
    doc.setTextColor(16, 185, 129); // Green
    doc.text('Discount:', totalsX, y);
    doc.text(`-₹${invoice.totalDiscount.toFixed(2)}`, totalsValueX, y, { align: 'right' });
    y += 6;
  }

  // Tax
  doc.setTextColor(80, 80, 80);
  doc.text(`GST (${invoice.taxRate}%):`, totalsX, y);
  doc.text(`₹${invoice.taxAmount.toFixed(2)}`, totalsValueX, y, { align: 'right' });
  y += 8;

  // Grand Total
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y - 2, totalsValueX, y - 2);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(99, 102, 241);
  doc.text('Grand Total:', totalsX, y + 4);
  doc.text(`₹${invoice.grandTotal.toFixed(2)}`, totalsValueX, y + 4, { align: 'right' });
  y += 16;

  // ─── Notes ────────────────────────────────────────────────
  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text(`Notes: ${invoice.notes}`, margin, y);
    y += 10;
  }

  // ─── Footer ───────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your purchase!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(
    `Generated by ${shopSettings.name || 'StyleBill'}`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  return doc;
}

/**
 * Generate a professional invoice PDF and download it.
 */
export async function generateInvoicePDF(
  invoice: Invoice,
  shopSettings: ShopSettings
): Promise<void> {
  const doc = await buildInvoicePDFDoc(invoice, shopSettings);
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

/**
 * Generate PDF and trigger print dialog.
 */
export async function printInvoicePDF(
  invoice: Invoice,
  shopSettings: ShopSettings
): Promise<void> {
  const doc = await buildInvoicePDFDoc(invoice, shopSettings);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

/**
 * Generate PDF and return as Blob (useful for Web Share API).
 */
export async function getInvoicePDFBlob(
  invoice: Invoice,
  shopSettings: ShopSettings
): Promise<Blob> {
  const doc = await buildInvoicePDFDoc(invoice, shopSettings);
  return doc.output('blob');
}
