/**
 * Dashboard page — shows today's sales stats and recent invoices.
 * This is the landing page of the application.
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  FileText,
  TrendingUp,
  ShoppingBag,
  Calendar,
  BarChart3,
} from 'lucide-react';
import type { DashboardStats, Invoice } from '@/types';
import { getDashboardStats, getInvoices } from '@/services/storage';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentInvoices from '@/components/dashboard/RecentInvoices';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayInvoiceCount: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    thisMonthSales: 0,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setStats(getDashboardStats());
    setInvoices(getInvoices());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s your business overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          icon={<IndianRupee size={18} className="text-white" />}
          label="Today's Sales"
          value={stats.todaySales}
          prefix="₹"
          accentColor="from-indigo-500 to-purple-600"
        />
        <StatsCard
          icon={<FileText size={18} className="text-white" />}
          label="Today's Invoices"
          value={stats.todayInvoiceCount}
          accentColor="from-blue-500 to-cyan-600"
        />
        <StatsCard
          icon={<Calendar size={18} className="text-white" />}
          label="This Month"
          value={stats.thisMonthSales}
          prefix="₹"
          accentColor="from-emerald-500 to-teal-600"
        />
        <StatsCard
          icon={<TrendingUp size={18} className="text-white" />}
          label="Total Revenue"
          value={stats.totalRevenue}
          prefix="₹"
          accentColor="from-amber-500 to-orange-600"
        />
        <StatsCard
          icon={<ShoppingBag size={18} className="text-white" />}
          label="Total Invoices"
          value={stats.totalInvoices}
          accentColor="from-pink-500 to-rose-600"
        />
        <StatsCard
          icon={<BarChart3 size={18} className="text-white" />}
          label="Avg. Order"
          value={stats.averageOrderValue}
          prefix="₹"
          accentColor="from-violet-500 to-fuchsia-600"
        />
      </div>

      {/* Recent Invoices */}
      <RecentInvoices invoices={invoices} />
    </div>
  );
}
