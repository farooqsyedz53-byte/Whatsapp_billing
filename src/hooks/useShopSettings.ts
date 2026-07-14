'use client';

/**
 * Custom hook for managing shop settings with LocalStorage sync.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ShopSettings } from '@/types';
import { DEFAULT_SHOP_SETTINGS } from '@/types';
import * as storage from '@/services/storage';
import { getShopSettingsFromCloud, saveShopSettingsToCloud } from '@/services/database';

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedCloud = useRef(false);

  // Load settings from localStorage instantly, then sync from cloud
  useEffect(() => {
    // 1. Instant load from local storage
    const localSettings = storage.getShopSettings();
    setSettings(localSettings);
    setIsLoading(false);

    // 2. Fetch from cloud in background to keep local storage fresh
    const fetchCloudSettings = async () => {
      if (hasFetchedCloud.current) return;
      hasFetchedCloud.current = true;
      
      const cloudSettings = await getShopSettingsFromCloud();
      if (cloudSettings) {
        // Only update if cloud actually has data and it's different
        // We can just overwrite local storage to ensure it's in sync with DB
        storage.saveShopSettings(cloudSettings);
        setSettings(cloudSettings);
      } else {
        // If no cloud settings exist yet (first time), push local settings to cloud
        saveShopSettingsToCloud(localSettings);
      }
    };

    fetchCloudSettings();
  }, []);

  /** Save updated shop settings (Local + Cloud) */
  const updateSettings = useCallback((newSettings: ShopSettings) => {
    storage.saveShopSettings(newSettings);
    setSettings(newSettings);
    saveShopSettingsToCloud(newSettings);
  }, []);

  /** Handle logo upload — converts file to base64 (Local + Cloud) */
  const uploadLogo = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const updated = { ...settings, logo: base64 };
          storage.saveShopSettings(updated);
          setSettings(updated);
          saveShopSettingsToCloud(updated);
          resolve();
        };
        reader.onerror = () => reject(new Error('Failed to read logo file'));
        reader.readAsDataURL(file);
      });
    },
    [settings]
  );

  /** Remove the shop logo (Local + Cloud) */
  const removeLogo = useCallback(() => {
    const updated = { ...settings, logo: '' };
    storage.saveShopSettings(updated);
    setSettings(updated);
    saveShopSettingsToCloud(updated);
  }, [settings]);

  return {
    settings,
    isLoading,
    updateSettings,
    uploadLogo,
    removeLogo,
  };
}
