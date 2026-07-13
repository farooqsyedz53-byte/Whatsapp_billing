/**
 * Items table component — manages the list of invoice line items.
 * Includes column headers (desktop) and add item button.
 */

'use client';

import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import type { InvoiceItem } from '@/types';
import ItemRow from './ItemRow';
import Button from '@/components/ui/Button';

interface ItemsTableProps {
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
}

export default function ItemsTable({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: ItemsTableProps) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShoppingBag size={16} className="text-indigo-400" />
          Clothing Items
        </h3>
        <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={onAddItem}>
          Add Item
        </Button>
      </div>

      {/* Column headers (desktop only) */}
      <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 text-[10px] text-gray-500 uppercase tracking-wider font-medium border-b border-white/[0.04]">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Item Name</div>
        <div className="col-span-1">Size</div>
        <div className="col-span-2">Color</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-1 text-right">Price ₹</div>
        <div className="col-span-1 text-right">Disc %</div>
        <div className="col-span-1">Amount</div>
        <div className="col-span-1 text-center">Del</div>
      </div>

      {/* Item rows */}
      <div className="p-3 space-y-2">
        {items.map((item, idx) => (
          <ItemRow
            key={item.id}
            item={item}
            index={idx}
            canDelete={items.length > 1}
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      {/* Add item footer */}
      <div className="px-5 py-3 border-t border-white/[0.04]">
        <button
          onClick={onAddItem}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/10 text-sm text-gray-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Add Another Item
        </button>
      </div>
    </div>
  );
}
