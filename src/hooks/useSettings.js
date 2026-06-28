import { useEffect, useRef, useState } from "react";

import { defaultSettings } from "../data/defaults";

import {
  loadSettings,
  loadStoredSettings,
  saveSettings,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";

export function useSettings() {
  const storedSettings = useRef(loadStoredSettings());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [settingsSource, setSettingsSource] = useState(
    storedSettings.current ? "Local cache" : "Defaults",
  );
  const [settingsCloudDebug, setSettingsCloudDebug] = useState({
    ok: false,
  });
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
        setSettingsSource("Cloud");
        setSettingsCloudDebug({ ok: true });
        setSettingsState({
          ...defaultSettings,
          ...cloudSettings,

          dailyTargets: {
            ...defaultSettings.dailyTargets,
            ...(cloudSettings.dailyTargets || {}),
          },
        });

        saveSettings(cloudSettings);
      } else if (storedSettings.current) {
        const ok = await saveAppDataToCloud("settings", storedSettings.current);
        console.log("settings one-time local migration:", {
          ok,
          present: true,
        });

        if (ok) {
          hasHydratedCloudData.current = true;
          setSettingsSource("Cloud");
          setSettingsCloudDebug({ ok: true });
          setSettingsState({
            ...defaultSettings,
            ...storedSettings.current,

            dailyTargets: {
              ...defaultSettings.dailyTargets,
              ...(storedSettings.current.dailyTargets || {}),
            },
          });
          saveSettings(storedSettings.current);
        }
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
      if (ok) {
        setSettingsSource("Cloud");
        setSettingsCloudDebug({ ok: true });
      }
    });
  }, [settings, cloudLoaded]);

  function setSettings(nextSettings) {
    hasLocalUserChange.current = true;
    setSettingsState(nextSettings);
  }

  return {
    settings,
    setSettings,
    settingsSource,
    settingsCloudDebug,
  };
}
