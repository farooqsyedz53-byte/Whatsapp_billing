/**
 * Top bar component with mobile menu toggle and page title.
 */

'use client';

import React from 'react';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Menu size={20} />
        </button>

        {/* Spacer for desktop (sidebar is static) */}
        <div className="hidden lg:block" />

        {/* Right side — could add profile/search later */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
            S
          </div>
        </div>
      </div>
    </header>
  );
}
