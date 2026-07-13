/**
 * Customer details form — name and phone number inputs.
 */

'use client';

import React from 'react';
import { User, Phone } from 'lucide-react';
import type { Customer } from '@/types';
import Input from '@/components/ui/Input';

interface CustomerFormProps {
  customer: Customer;
  onChange: (customer: Customer) => void;
}

export default function CustomerForm({ customer, onChange }: CustomerFormProps) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <User size={16} className="text-indigo-400" />
        Customer Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Customer Name"
          placeholder="Walk-in Customer"
          value={customer.name}
          onChange={(e) => onChange({ ...customer, name: e.target.value })}
          icon={<User size={16} />}
        />
        <Input
          label="Phone Number"
          placeholder="9876543210"
          type="tel"
          value={customer.phone}
          onChange={(e) => onChange({ ...customer, phone: e.target.value })}
          icon={<Phone size={16} />}
        />
      </div>
    </div>
  );
}
