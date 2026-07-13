/**
 * Root layout for the StyleBill application.
 * Sets up Google Fonts, metadata, and the AppShell wrapper.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'StyleBill — Clothing Shop Billing System',
  description:
    'Professional clothing store billing and POS application. Create invoices, manage customers, generate PDF bills, and share via WhatsApp.',
  keywords: ['billing', 'invoice', 'clothing', 'POS', 'fashion', 'GST'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
