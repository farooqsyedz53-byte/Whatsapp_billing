/**
 * Sidebar navigation component.
 * Shows navigation links with icons, highlights active route.
 * Collapsible on mobile with slide-in animation.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Settings,
  ShoppingBag,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoice/new', label: 'New Invoice', icon: FilePlus },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-gray-950/95 backdrop-blur-xl border-r border-white/5
          flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">StyleBill</h1>
              <p className="text-[10px] text-gray-500 font-medium">Billing System</p>
            </div>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/10 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-indigo-400' : 'text-gray-500'}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5">
          <p className="text-[10px] text-gray-600 text-center">
            StyleBill v1.0 · Clothing POS
          </p>
        </div>
      </aside>
    </>
  );
}
