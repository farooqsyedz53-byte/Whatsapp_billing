'use client';

/**
 * Custom hook for managing shop settings with LocalStorage sync.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ShopSettings } from '@/types';
import { DEFAULT_SHOP_SETTINGS } from '@/types';
import * as storage from '@/services/storage';

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    setSettings(storage.getShopSettings());
    setIsLoading(false);
  }, []);

  /** Save updated shop settings */
  const updateSettings = useCallback((newSettings: ShopSettings) => {
    storage.saveShopSettings(newSettings);
    setSettings(newSettings);
  }, []);

  /** Handle logo upload — converts file to base64 */
  const uploadLogo = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const updated = { ...settings, logo: base64 };
          storage.saveShopSettings(updated);
          setSettings(updated);
          resolve();
        };
        reader.onerror = () => reject(new Error('Failed to read logo file'));
        reader.readAsDataURL(file);
      });
    },
    [settings]
  );

  /** Remove the shop logo */
  const removeLogo = useCallback(() => {
    const updated = { ...settings, logo: '' };
    storage.saveShopSettings(updated);
    setSettings(updated);
  }, [settings]);

  return {
    settings,
    isLoading,
    updateSettings,
    uploadLogo,
    removeLogo,
  };
}
