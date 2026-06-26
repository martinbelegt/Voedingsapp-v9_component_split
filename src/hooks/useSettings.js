import { useEffect, useRef, useState } from "react";

import { defaultSettings } from "../data/defaults";

import {
  loadSettings,
  saveSettings,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";

export function useSettings() {
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);

  const [settings, setSettingsState] = useState(() => {
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
        hasHydratedCloudData.current = true;
        setSettingsState({
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

    if (!cloudLoaded) return;

    if (!hasHydratedCloudData.current && !hasLocalUserChange.current) {
      console.log("settings cloud save skipped: app data not hydrated");
      return;
    }

    saveAppDataToCloud("settings", settings).then((ok) => {
      console.log("settings cloud save:", ok);
    });
  }, [settings, cloudLoaded]);

  function setSettings(nextSettings) {
    hasLocalUserChange.current = true;
    setSettingsState(nextSettings);
  }

  return {
    settings,
    setSettings,
  };
}
