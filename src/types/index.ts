/**
 * TypeScript interfaces for the Clothing Shop Billing application.
 * All data models used across the app are defined here.
 */

/** Represents the shop's configuration/settings */
export interface ShopSettings {
  name: string;
  logo: string; // Base64-encoded image string
  address: string;
  gstNumber: string;
  phone: string;
  email: string;
  upiId: string; // UPI ID for payment links (e.g., yourname@ybl)
}

/** Customer information attached to an invoice */
export interface Customer {
  name: string;
  phone: string;
}

/** A single clothing item on an invoice */
export interface InvoiceItem {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number; // Price per unit in INR
  discount: number; // Discount percentage (0-100)
  amount: number; // Computed: (price * quantity) - discount amount
}

/** Invoice status */
export type InvoiceStatus = 'draft' | 'paid' | 'cancelled';

/** Complete invoice record */
export interface Invoice {
  id: string;
  invoiceNumber: string; // Auto-generated: INV-YYYYMMDD-001
  date: string; // ISO date string
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number; // Sum of all item amounts before tax
  totalDiscount: number; // Total discount amount across all items
  taxRate: number; // GST percentage (e.g., 18)
  taxAmount: number; // Computed tax
  grandTotal: number; // subtotal + taxAmount
  status: InvoiceStatus;
  notes: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Dashboard statistics computed from invoice data */
export interface DashboardStats {
  todaySales: number;
  todayInvoiceCount: number;
  totalInvoices: number;
  totalRevenue: number;
  averageOrderValue: number;
  thisMonthSales: number;
}

/** Toast notification types */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast notification state */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // ms, default 3000
}

/** Size options for clothing */
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'] as const;

/** Common clothing colors */
export const CLOTHING_COLORS = [
  'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow',
  'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Navy',
  'Maroon', 'Beige', 'Cream', 'Multi-Color'
] as const;

/** Available GST rates in India */
export const GST_RATES = [0, 5, 12, 18, 28] as const;

/** Default shop settings */
export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  name: 'StyleBill Fashion Store',
  logo: '',
  address: '',
  gstNumber: '',
  phone: '',
  email: '',
  upiId: '',
};
