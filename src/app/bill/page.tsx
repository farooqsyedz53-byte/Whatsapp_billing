/**
 * Digital Bill view page.
 * Parses the base64 encoded invoice data from the URL and displays it.
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, Download } from 'lucide-react';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import type { Invoice, ShopSettings } from '@/types';
import Button from '@/components/ui/Button';

function BillContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{ invoice: Invoice; shopSettings: ShopSettings } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const d = searchParams.get('d');
    if (d) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(d)));
        if (decoded.i && decoded.s) {
          setData({ invoice: decoded.i, shopSettings: decoded.s });
        } else {
          setError(true);
        }
      } catch (e) {
        console.error('Failed to parse bill data:', e);
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="bg-red-500/10 text-red-500 p-4 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
        <p className="text-gray-400">This digital bill link is invalid or corrupted.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Loading your bill...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white/[0.03] border border-white/[0.06] p-4 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-white">Digital Bill</h1>
          <p className="text-sm text-gray-400">Invoice #{data.invoice.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>
      
      {/* 
        The InvoicePreview wrapper will handle its own white background.
        We force a light background context for it by wrapping it in a div that ignores dark mode.
      */}
      <div className="bg-gray-100 rounded-xl p-2 sm:p-4 overflow-x-auto">
        <div className="min-w-[400px]">
          <InvoicePreview invoice={data.invoice} shopSettings={data.shopSettings} standalone />
        </div>
      </div>
    </div>
  );
}

export default function BillPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 sm:p-8">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <BillContent />
      </Suspense>
    </div>
  );
}
