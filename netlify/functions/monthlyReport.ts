/**
 * Netlify Scheduled Function: Monthly Report
 * 
 * Runs on the 1st of every month at 6:00 AM IST.
 * - Queries last month's invoices from Supabase
 * - Generates a summary report
 * - Sends it via email using Resend
 * - Archives the summary in monthly_reports table
 * - Deletes the raw invoice data for that month
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Netlify scheduled function config
export const config = {
  schedule: '0 0 1 * *', // 1st of every month at 00:00 UTC (5:30 AM IST)
};

interface DailyEntry {
  date: string;
  count: number;
  revenue: number;
  paid: number;
  unpaid: number;
}

interface CustomerEntry {
  name: string;
  phone: string;
  totalSpent: number;
  invoiceCount: number;
}

export default async function handler() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase not configured. Skipping monthly report.');
    return new Response('Supabase not configured', { status: 500 });
  }

  if (!resendKey || !adminEmail) {
    console.error('Resend or admin email not configured. Skipping monthly report.');
    return new Response('Email not configured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);

  // Calculate last month's date range
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const startDate = lastMonth.toISOString();
  const endDate = lastMonthEnd.toISOString();

  const monthName = lastMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  console.log(`Generating monthly report for ${monthName}...`);

  // Fetch last month's invoices
  const { data: invoices, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (fetchError) {
    console.error('Error fetching invoices:', fetchError);
    return new Response('Database error', { status: 500 });
  }

  if (!invoices || invoices.length === 0) {
    console.log('No invoices found for last month. Skipping report.');
    return new Response('No data', { status: 200 });
  }

  // Compute statistics
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);
  const totalUnpaid = totalRevenue - totalPaid;

  // Daily breakdown
  const dailyMap = new Map<string, DailyEntry>();
  for (const inv of invoices) {
    const day = new Date(inv.date).toISOString().split('T')[0];
    const existing = dailyMap.get(day) || { date: day, count: 0, revenue: 0, paid: 0, unpaid: 0 };
    existing.count += 1;
    existing.revenue += parseFloat(inv.grand_total || 0);
    if (inv.status === 'paid') {
      existing.paid += parseFloat(inv.grand_total || 0);
    } else {
      existing.unpaid += parseFloat(inv.grand_total || 0);
    }
    dailyMap.set(day, existing);
  }
  const dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Top customers
  const customerMap = new Map<string, CustomerEntry>();
  for (const inv of invoices) {
    const key = inv.customer_phone || inv.customer_name || 'walk-in';
    const existing = customerMap.get(key) || { name: inv.customer_name || 'Walk-in', phone: inv.customer_phone || '', totalSpent: 0, invoiceCount: 0 };
    existing.totalSpent += parseFloat(inv.grand_total || 0);
    existing.invoiceCount += 1;
    customerMap.set(key, existing);
  }
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Archive the summary
  await supabase.from('monthly_reports').upsert({
    month: lastMonth.getMonth() + 1,
    year: lastMonth.getFullYear(),
    total_invoices: totalInvoices,
    total_revenue: totalRevenue,
    total_paid: totalPaid,
    total_unpaid: totalUnpaid,
    daily_breakdown: dailyBreakdown,
    top_customers: topCustomers,
    report_sent_at: new Date().toISOString(),
  }, { onConflict: 'month,year' });

  // Build the HTML email
  const dailyRows = dailyBreakdown
    .map(
      (d) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:14px;">${d.count}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:14px;">Rs.${d.revenue.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:14px;color:#22c55e;">Rs.${d.paid.toFixed(2)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:14px;color:#ef4444;">Rs.${d.unpaid.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const customerRows = topCustomers
    .map(
      (c) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${c.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;">${c.phone || '-'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;font-size:14px;">${c.invoiceCount}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-size:14px;">Rs.${c.totalSpent.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  // Fetch shop settings for the PDF header and email branding
  const { data: shopData } = await supabase.from('shop_settings').select('*').eq('id', 'default').single();
  
  // Map database row to our standard format
  const shopSettings = shopData ? {
    name: shopData.name || 'Store',
    logo: shopData.logo || '',
    address: shopData.address || '',
    gstNumber: shopData.gst_number || '',
    phone: shopData.phone || '',
    email: shopData.email || '',
    upiId: shopData.upi_id || '',
  } : { name: 'Store' };

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="font-family:'Segoe UI',Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0;">
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">${shopSettings.name} Monthly Report</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${monthName}</p>
      </div>

      <!-- Summary Cards -->
      <div style="padding:24px;display:flex;flex-wrap:wrap;gap:12px;">
        <div style="flex:1;min-width:120px;background:#f0f4ff;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;">Total Invoices</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#4f46e5;">${totalInvoices}</p>
        </div>
        <div style="flex:1;min-width:120px;background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;">Total Revenue</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#16a34a;">Rs.${totalRevenue.toFixed(2)}</p>
        </div>
        <div style="flex:1;min-width:120px;background:#fff7ed;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;">Paid</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#22c55e;">Rs.${totalPaid.toFixed(2)}</p>
        </div>
        <div style="flex:1;min-width:120px;background:#fef2f2;border-radius:8px;padding:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#666;text-transform:uppercase;">Unpaid</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#ef4444;">Rs.${totalUnpaid.toFixed(2)}</p>
        </div>
      </div>

      <!-- Daily Breakdown -->
      <div style="padding:0 24px 24px;">
        <h2 style="font-size:16px;color:#333;margin:0 0 12px;">Daily Breakdown</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Date</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Bills</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Revenue</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Paid</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Unpaid</th>
            </tr>
          </thead>
          <tbody>${dailyRows}</tbody>
        </table>
      </div>

      <!-- Top Customers -->
      <div style="padding:0 24px 24px;">
        <h2 style="font-size:16px;color:#333;margin:0 0 12px;">Top Customers</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Name</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Phone</th>
              <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Bills</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>${customerRows}</tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="background:#f8f9fa;padding:16px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#999;">
          This report was auto-generated by ${shopSettings.name}. Previous month's invoice data has been archived and cleaned up.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Generate PDFs for attachments
  console.log('Generating PDFs for attachments...');
  const { jsPDF } = await import('jspdf');
  // @ts-ignore
  const autoTable = (await import('jspdf-autotable')).default;
  const attachments = [];

  for (const invoice of invoices) {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(shopSettings.name, margin, y + 8);
      y += 20;

      doc.setFontSize(16);
      doc.setTextColor(99, 102, 241);
      doc.text('TAX INVOICE', pageWidth - margin, y, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Invoice #: ${invoice.invoice_number}`, margin, y);
      y += 6;
      doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-IN')}`, margin, y);
      y += 10;

      doc.text('Bill To:', margin, y);
      doc.text(invoice.customer_name || 'Walk-in Customer', margin + 15, y);
      y += 10;

      const items = invoice.items || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tableData = items.map((item: any, idx: number) => [
        idx + 1,
        item.name,
        item.quantity,
        Number(item.price).toFixed(2),
        Number(item.amount).toFixed(2),
      ]);

      autoTable(doc, {
        startY: y,
        head: [['#', 'Item', 'Qty', 'Price', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total: Rs. ${parseFloat(invoice.grand_total).toFixed(2)}`, pageWidth - margin, y, { align: 'right' });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      attachments.push({
        filename: `Invoice_${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
      });
    } catch (e) {
      console.error(`Failed to generate PDF for ${invoice.invoice_number}:`, e);
    }
  }

  // Generate Master CSV Sheet
  console.log('Generating Master CSV Sheet...');
  const csvHeaders = ['Invoice Number', 'Date', 'Customer Name', 'Phone', 'Subtotal', 'Tax Amount', 'Discount', 'Grand Total', 'Status'];
  const csvRows = invoices.map(inv => {
    return [
      inv.invoice_number,
      new Date(inv.date).toLocaleDateString('en-IN'),
      `"${inv.customer_name || 'Walk-in'}"`,
      inv.customer_phone || '',
      inv.subtotal || 0,
      inv.tax_amount || 0,
      inv.total_discount || 0,
      inv.grand_total || 0,
      inv.status || 'paid'
    ].join(',');
  });
  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  const csvBuffer = Buffer.from(csvContent, 'utf-8');
  attachments.push({
    filename: `Master_Report_${monthName.replace(/\s+/g, '_')}.csv`,
    content: csvBuffer,
  });

  // Send the email via Resend
  const emailList = adminEmail.split(',').map((e) => e.trim()).filter(Boolean);
  try {
    await resend.emails.send({
      from: `${shopSettings.name} <onboarding@resend.dev>`,
      to: emailList,
      subject: `Monthly Sales Report - ${monthName}`,
      html: emailHtml,
      attachments: attachments,
    });
    console.log(`Monthly report sent to ${emailList.join(', ')} with ${attachments.length} attachments`);
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
    return new Response('Email send failed', { status: 500 });
  }

  // Delete last month's raw invoice data (it's now archived in monthly_reports)
  const { error: deleteError } = await supabase
    .from('invoices')
    .delete()
    .gte('date', startDate)
    .lte('date', endDate);

  if (deleteError) {
    console.error('Failed to clean up old invoices:', deleteError);
  } else {
    console.log(`Cleaned up ${invoices.length} invoices from ${monthName}`);
  }

  // Clean up old shared bills (digital bill links older than 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { error: sharedBillsError } = await supabase
    .from('shared_bills')
    .delete()
    .lt('created_at', ninetyDaysAgo);

  if (sharedBillsError) {
    console.error('Failed to clean up old shared bills:', sharedBillsError);
  } else {
    console.log('Cleaned up shared bills older than 90 days');
  }

  return new Response(`Report sent for ${monthName}. ${invoices.length} invoices archived and cleaned.`, { status: 200 });
}
