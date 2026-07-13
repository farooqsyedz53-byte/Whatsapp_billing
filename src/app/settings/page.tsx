/**
 * Settings page — configure shop details for invoice branding.
 */

'use client';

import React, { useContext } from 'react';
import { Settings } from 'lucide-react';
import { useShopSettings } from '@/hooks/useShopSettings';
import ShopSettingsForm from '@/components/settings/ShopSettingsForm';
import { ToastContext } from '@/components/layout/AppShell';

export default function SettingsPage() {
  const { settings, updateSettings, uploadLogo, removeLogo, isLoading } =
    useShopSettings();
  const { showToast } = useContext(ToastContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = (newSettings: typeof settings) => {
    updateSettings(newSettings);
    showToast('Settings saved successfully!', 'success');
  };

  const handleUploadLogo = async (file: File) => {
    await uploadLogo(file);
    showToast('Logo uploaded!', 'success');
  };

  const handleRemoveLogo = () => {
    removeLogo();
    showToast('Logo removed', 'info');
  };

  return (
    <div className="page-enter space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings size={24} className="text-indigo-400" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your shop details for invoice branding
        </p>
      </div>

      {/* Settings Form */}
      <div className="max-w-2xl">
        <ShopSettingsForm
          settings={settings}
          onSave={handleSave}
          onUploadLogo={handleUploadLogo}
          onRemoveLogo={handleRemoveLogo}
        />
      </div>
    </div>
  );
}
