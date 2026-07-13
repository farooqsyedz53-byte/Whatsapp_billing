/**
 * Shop settings form — configure shop name, logo, address, GST, phone, email.
 */

'use client';

import React, { useState } from 'react';
import { Store, Upload, X, Save } from 'lucide-react';
import type { ShopSettings } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ShopSettingsFormProps {
  settings: ShopSettings;
  onSave: (settings: ShopSettings) => void;
  onUploadLogo: (file: File) => Promise<void>;
  onRemoveLogo: () => void;
}

export default function ShopSettingsForm({
  settings,
  onSave,
  onUploadLogo,
  onRemoveLogo,
}: ShopSettingsFormProps) {
  const [form, setForm] = useState<ShopSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  // Keep form in sync when settings prop changes (e.g., logo upload)
  React.useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    onSave(form);
    // Brief delay to show saving state
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUploadLogo(file);
    }
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Store size={16} className="text-indigo-400" />
          Shop Settings
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Configure your shop details for invoices
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Logo Upload */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-2 block">Shop Logo</label>
          <div className="flex items-center gap-4">
            {form.logo ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.logo}
                  alt="Shop Logo"
                  className="w-16 h-16 rounded-xl object-cover border border-white/10"
                />
                <button
                  onClick={onRemoveLogo}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all">
                <Upload size={20} className="text-gray-500" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
            <div className="text-xs text-gray-500">
              <p>Upload your shop logo</p>
              <p>PNG, JPG, or SVG (max 500KB)</p>
            </div>
          </div>
        </div>

        {/* Shop Name */}
        <Input
          label="Shop Name"
          placeholder="StyleBill Fashion Store"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Address */}
        <div>
          <label className="text-sm font-medium text-gray-400 mb-1.5 block">Address</label>
          <textarea
            placeholder="123 Fashion Street, City, State - 400001"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        {/* GST & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="GST Number"
            placeholder="22AAAAA0000A1Z5"
            value={form.gstNumber}
            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="9876543210"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Email */}
        <Input
          label="Email"
          placeholder="shop@example.com"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Save Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
