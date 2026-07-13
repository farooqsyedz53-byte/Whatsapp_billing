/**
 * Single invoice line item row.
 * Allows editing item name, size, color, quantity, price, and discount.
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
    <div className="group grid grid-cols-12 gap-2 items-start p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
      {/* Row number */}
      <div className="col-span-12 sm:col-span-1 flex items-center">
        <span className="text-xs font-medium text-gray-500 w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
          {index + 1}
        </span>
      </div>

      {/* Item Name */}
      <div className="col-span-12 sm:col-span-3">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block sm:hidden">Item Name</label>
        <input
          type="text"
          placeholder="Item name"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {/* Size */}
      <div className="col-span-4 sm:col-span-1">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block sm:hidden">Size</label>
        <select
          value={item.size}
          onChange={(e) => onUpdate(item.id, 'size', e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
        >
          {CLOTHING_SIZES.map((size) => (
            <option key={size} value={size} className="bg-gray-900">{size}</option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div className="col-span-4 sm:col-span-2">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block sm:hidden">Color</label>
        <select
          value={item.color}
          onChange={(e) => onUpdate(item.id, 'color', e.target.value)}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
        >
          {CLOTHING_COLORS.map((color) => (
            <option key={color} value={color} className="bg-gray-900">{color}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="col-span-4 sm:col-span-1">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block sm:hidden">Qty</label>
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white text-center outline-none focus:border-indigo-500/50 transition-all tabular-nums"
        />
      </div>

      {/* Price */}
      <div className="col-span-4 sm:col-span-1">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block sm:hidden">Price ₹</label>
        <input
          type="number"
          min={0}
          step={0.01}
          placeholder="0"
          value={item.price || ''}
          onChange={(e) => onUpdate(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white text-right outline-none focus:border-indigo-500/50 transition-all tabular-nums"
        />
      </div>

      {/* Discount */}
      <div className="col-span-4 sm:col-span-1">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block sm:hidden">Disc %</label>
        <input
          type="number"
          min={0}
          max={100}
          placeholder="0"
          value={item.discount || ''}
          onChange={(e) => onUpdate(item.id, 'discount', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-sm text-white text-right outline-none focus:border-indigo-500/50 transition-all tabular-nums"
        />
      </div>

      {/* Amount (computed) */}
      <div className="col-span-8 sm:col-span-1 flex items-center">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider mr-2 sm:hidden">Amount:</label>
        <span className="text-sm font-semibold text-emerald-400 tabular-nums">
          ₹{item.amount.toFixed(2)}
        </span>
      </div>

      {/* Delete button */}
      <div className="col-span-4 sm:col-span-1 flex items-center justify-end sm:justify-center">
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
