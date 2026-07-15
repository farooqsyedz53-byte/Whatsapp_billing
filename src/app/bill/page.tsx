/**
 * Digital Bill view page.
 * Parses the base64 encoded invoice data from the URL and displays it.
 * Shows UPI payment buttons if the shop has a UPI ID configured.
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Printer, CreditCard, CheckCircle2 } from 'lucide-react';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import type { Invoice, ShopSettings } from '@/types';
import Button from '@/components/ui/Button';
import { decompressFromUrlSafe } from '@/services/whatsapp';

/** Build a standard UPI intent URL */
function buildUpiUrl(upiId: string, name: string, amount: number, invoiceNumber: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `Payment for ${invoiceNumber}`,
  });
  return `upi://pay?${params.toString()}`;
}

/** Payment app configurations with platform-specific deep-link schemes */
const PAYMENT_APPS = [
  {
    name: 'Google Pay',
    /** Android intent package */
    androidPackage: 'com.google.android.apps.nbu.paisa.user',
    /** iOS URL scheme for Google Pay */
    iosScheme: 'gpay://upi/pay',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:shadow-blue-500/30',
    logo: '🅖',
  },
  {
    name: 'PhonePe',
    androidPackage: 'com.phonepe.app',
    iosScheme: 'phonepe://pay',
    color: 'from-purple-600 to-indigo-600',
    hoverColor: 'hover:shadow-purple-500/30',
    logo: '🅟',
  },
  {
    name: 'Amazon Pay',
    androidPackage: 'in.amazon.mShop.android.shopping',
    /** Amazon Pay has no reliable iOS UPI deep-link — falls back to generic upi:// */
    iosScheme: null,
    color: 'from-amber-500 to-orange-500',
    hoverColor: 'hover:shadow-amber-500/30',
    logo: '🅐',
  },
  {
    name: 'Any UPI App',
    androidPackage: null,
    iosScheme: null,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'hover:shadow-emerald-500/30',
    logo: '💳',
  },
];

/** Detect if the current device is iOS */
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Detect if the current device is Android */
function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Build an Android intent:// URI that targets a specific app by package name.
 * @see https://developer.chrome.com/docs/android/intents
 */
function buildIntentUrl(upiUrl: string, androidPackage: string): string {
  const queryPart = upiUrl.replace('upi://pay?', '');
  return `intent://pay?${queryPart}#Intent;scheme=upi;package=${androidPackage};end`;
}

/**
 * Build an iOS app-specific URL by replacing the upi:// scheme with the app's scheme.
 * e.g., upi://pay?pa=... → gpay://upi/pay?pa=...
 */
function buildIOSAppUrl(upiUrl: string, iosScheme: string): string {
  const queryPart = upiUrl.replace('upi://pay', '');
  return `${iosScheme}${queryPart}`;
}

function PaymentSection({ invoice, shopSettings }: { invoice: Invoice; shopSettings: ShopSettings }) {
  const [paymentDone, setPaymentDone] = useState(false);

  if (!shopSettings.upiId) return null;
  if (invoice.grandTotal <= 0) return null;

  const genericUpiUrl = buildUpiUrl(shopSettings.upiId, shopSettings.name || 'Shop', invoice.grandTotal, invoice.invoiceNumber);

  const handlePay = (app: typeof PAYMENT_APPS[0]) => {
    if (isIOS()) {
      // iOS: Use app-specific URL scheme, or fall back to generic upi://
      if (app.iosScheme) {
        const appUrl = buildIOSAppUrl(genericUpiUrl, app.iosScheme);
        window.location.href = appUrl;
      } else {
        window.location.href = genericUpiUrl;
      }
    } else if (isAndroid() && app.androidPackage) {
      // Android: Use intent URI with package name
      const intentUrl = buildIntentUrl(genericUpiUrl, app.androidPackage);
      window.location.href = intentUrl;
    } else {
      // Desktop or fallback: Use generic UPI URL
      window.location.href = genericUpiUrl;
    }
  };

  if (paymentDone) {
    return (
      <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
        <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">Payment Initiated!</h3>
        <p className="text-sm text-gray-400">
          Please complete the payment in your UPI app. The shop owner will confirm receipt.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="mt-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden animate-slide-in-up"
      style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Pay Now</h3>
        </div>
        <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-bold tabular-nums">
          Rs. {invoice.grandTotal.toFixed(2)}
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {PAYMENT_APPS.map((app) => (
          <button
            key={app.name}
            onClick={() => {
              handlePay(app);
              // Mark as initiated after a short delay
              setTimeout(() => setPaymentDone(true), 1500);
            }}
            className={`
              relative flex items-center gap-3 px-4 py-3.5 rounded-xl
              bg-gradient-to-r ${app.color} 
              text-white font-semibold text-sm
              shadow-lg ${app.hoverColor}
              hover:scale-[1.02] active:scale-[0.98]
              transition-all duration-200
            `}
          >
            <span className="text-lg">{app.logo}</span>
            <span>{app.name}</span>
          </button>
        ))}
      </div>

      <div className="px-5 pb-4">
        <p className="text-[11px] text-gray-500 text-center">
          Tap a button to open your payment app. The amount and shop details will be pre-filled.
        </p>
      </div>
    </div>
  );
}

function BillContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{ invoice: Invoice; shopSettings: ShopSettings } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const billId = searchParams.get('id'); // Database-backed short ID
    const c = searchParams.get('c'); // Compressed format (fallback)
    const d = searchParams.get('d'); // Legacy uncompressed format

    if (billId) {
      // Fetch bill data from Supabase via API
      fetch(`/api/bill/${billId}`)
        .then(res => {
          if (!res.ok) throw new Error('Bill not found');
          return res.json();
        })
        .then(result => {
          if (result.invoice && result.shopSettings) {
            setData({ invoice: result.invoice, shopSettings: result.shopSettings });
          } else {
            setError(true);
          }
        })
        .catch(err => {
          console.error('Failed to fetch bill:', err);
          setError(true);
        });
      return;
    }

    // Inline data formats (compressed or legacy)
    try {
      let decoded;
      if (c) {
        decoded = JSON.parse(decodeURIComponent(decompressFromUrlSafe(c)));
      } else if (d) {
        decoded = JSON.parse(decodeURIComponent(atob(d)));
      }

      if (decoded?.i && decoded?.s) {
        setData({ invoice: decoded.i, shopSettings: decoded.s });
      } else {
        setError(true);
      }
    } catch (e) {
      console.error('Failed to parse bill data:', e);
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
      
      {/* Invoice Preview */}
      <div className="bg-gray-100 rounded-xl p-2 sm:p-4 overflow-x-auto">
        <div className="min-w-fit sm:min-w-[400px] mx-auto">
          <InvoicePreview invoice={data.invoice} shopSettings={data.shopSettings} standalone />
        </div>
      </div>

      {/* UPI Payment Section */}
      <PaymentSection invoice={data.invoice} shopSettings={data.shopSettings} />
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
