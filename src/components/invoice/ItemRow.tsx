/**
 * Single invoice line item row.
 * Allows editing item name, size, color, quantity, price, and discount.
 * Fully responsive: stacks into a card on mobile, sleek grid on desktop.
 */

'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { InvoiceItem } from '@/types';
import { CLOTHING_SIZES, CLOTHING_COLORS } from '@/types';

interface ItemRowProps {
  item: InvoiceItem;
  index: number;
  canDelete: boolean;
  onUpdate: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onRemove: (id: string) => void;
}

export default function ItemRow({
  item,
  index,
  canDelete,
  onUpdate,
  onRemove,
}: ItemRowProps) {
  return (
    <div className="group flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-2 items-start p-4 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] sm:hover:-translate-y-0.5 hover:shadow-lg shadow-black/20 transition-all duration-300 relative">
      
      {/* Mobile-only Header (Row Number & Delete) */}
      <div className="flex items-center justify-between w-full sm:hidden mb-1">
        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
          Item #{index + 1}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          disabled={!canDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Desktop-only Row number */}
      <div className="hidden sm:flex sm:col-span-1 items-center h-9">
        <span className="text-xs font-medium text-gray-500 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
          {index + 1}
        </span>
      </div>

      {/* Item Name */}
      <div className="w-full sm:col-span-3">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block sm:hidden">Item Name</label>
        <input
          type="text"
          placeholder="Item name"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Mobile Grid for smaller inputs */}
      <div className="grid grid-cols-2 gap-3 w-full sm:hidden">
        {/* Size */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Size</label>
          <select
            value={item.size}
            onChange={(e) => onUpdate(item.id, 'size', e.target.value)}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            {CLOTHING_SIZES.map((size) => (
              <option key={size} value={size} className="bg-gray-900">{size}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Color</label>
          <select
            value={item.color}
            onChange={(e) => onUpdate(item.id, 'color', e.target.value)}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            {CLOTHING_COLORS.map((color) => (
              <option key={color} value={color} className="bg-gray-900">{color}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Qty</label>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onUpdate(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
          />
        </div>

        {/* Price */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Price ₹</label>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            value={item.price || ''}
            onChange={(e) => onUpdate(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
          />
        </div>

        {/* Discount */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Disc %</label>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="0"
            value={item.discount || ''}
            onChange={(e) => onUpdate(item.id, 'discount', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
            className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
          />
        </div>

        {/* Amount (computed) mobile */}
        <div className="flex flex-col justify-end">
          <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Total</label>
          <div className="h-9 flex items-center px-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <span className="text-sm font-bold text-emerald-400 tabular-nums">
              ₹{item.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop-only inputs (hidden on mobile) */}
      <div className="hidden sm:block sm:col-span-1">
        <select
          value={item.size}
          onChange={(e) => onUpdate(item.id, 'size', e.target.value)}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
        >
          {CLOTHING_SIZES.map((size) => (
            <option key={size} value={size} className="bg-gray-900">{size}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block sm:col-span-2">
        <select
          value={item.color}
          onChange={(e) => onUpdate(item.id, 'color', e.target.value)}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
        >
          {CLOTHING_COLORS.map((color) => (
            <option key={color} value={color} className="bg-gray-900">{color}</option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block sm:col-span-1">
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white text-center outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
        />
      </div>

      <div className="hidden sm:block sm:col-span-1">
        <input
          type="number"
          min={0}
          step={0.01}
          placeholder="0"
          value={item.price || ''}
          onChange={(e) => onUpdate(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white text-right outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
        />
      </div>

      <div className="hidden sm:block sm:col-span-1">
        <input
          type="number"
          min={0}
          max={100}
          placeholder="0"
          value={item.discount || ''}
          onChange={(e) => onUpdate(item.id, 'discount', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
          className="w-full h-9 rounded-lg bg-white/5 border border-white/10 px-2 text-sm text-white text-right outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all tabular-nums"
        />
      </div>

      <div className="hidden sm:flex sm:col-span-1 items-center h-9">
        <span className="text-sm font-semibold text-emerald-400 tabular-nums">
          ₹{item.amount.toFixed(2)}
        </span>
      </div>

      {/* Desktop-only delete button */}
      <div className="hidden sm:flex sm:col-span-1 items-center justify-center h-9">
        <button
          onClick={() => onRemove(item.id)}
          disabled={!canDelete}
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:bg-transparent transition-all"
          title="Remove item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
