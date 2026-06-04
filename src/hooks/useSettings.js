import { useEffect, useState } from "react";

import { defaultSettings } from "../data/defaults";

import {
  loadSettings,
  saveSettings,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";

export function useSettings() {
  const [cloudLoaded, setCloudLoaded] = useState(false);

  const [settings, setSettings] = useState(() => {
    const savedSettings = loadSettings();

    return {
      ...defaultSettings,
      ...(savedSettings || {}),

      dailyTargets: {
        ...defaultSettings.dailyTargets,
        ...(savedSettings?.dailyTargets || {}),
      },
    };
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCloudSettings() {
      const cloudSettings = await loadAppDataFromCloud("settings");

      console.log("cloudSettings loaded:", cloudSettings);

      if (cancelled) return;

      if (cloudSettings) {
        setSettings({
          ...defaultSettings,
          ...cloudSettings,

          dailyTargets: {
            ...defaultSettings.dailyTargets,
            ...(cloudSettings.dailyTargets || {}),
          },
        });

        saveSettings(cloudSettings);
      }

      setCloudLoaded(true);
    }

    loadCloudSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveSettings(settings);

    if (cloudLoaded) {
      saveAppDataToCloud("settings", settings).then((ok) => {
        console.log("settings cloud save:", ok);
      });
    }
  }, [settings, cloudLoaded]);

  return {
    settings,
    setSettings,
  };
}
