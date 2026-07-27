import { useEffect, useRef, useState } from "react";

import { defaultSettings } from "../data/defaults";

import {
  loadSettings,
  loadStoredSettings,
  saveSettings,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";
import {
  canSaveAppData,
  shouldAttemptMigration,
} from "../services/syncSafetyService";

export function useSettings() {
  const storedSettings = useRef(loadStoredSettings());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [settingsSource, setSettingsSource] = useState(
    storedSettings.current ? "Local cache" : "Defaults",
  );
  const [settingsCloudDebug, setSettingsCloudDebug] = useState({
    ok: false,
  });
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);
  const localChangeVersion = useRef(0);
  const cloudWriteBlockedByConflict = useRef(false);

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
      const mutationVersionAtLoadStart = localChangeVersion.current;
      const cloudResult = await loadAppDataFromCloud("settings");
      const cloudSettings = cloudResult.value;

      console.log("cloudSettings loaded:", cloudSettings);

      if (cancelled) return;

      const localChangedDuringLoad =
        localChangeVersion.current !== mutationVersionAtLoadStart;
      const hasValidCloudSettings =
        cloudResult.status === "success" &&
        !!cloudSettings &&
        typeof cloudSettings === "object" &&
        !Array.isArray(cloudSettings);

      if (hasValidCloudSettings && !localChangedDuringLoad) {
        hasHydratedCloudData.current = true;
        setSyncStatus("synced");
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
      } else if (
        shouldAttemptMigration(
          cloudResult.status,
          storedSettings.current && !localChangedDuringLoad,
        )
      ) {
        const ok = await saveAppDataToCloud("settings", storedSettings.current);
        console.log("settings one-time local migration:", {
          ok,
          present: true,
        });

        if (ok) {
          hasHydratedCloudData.current = true;
          setSyncStatus("synced");
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
        } else {
          setSyncStatus("error");
        }
      } else {
        const hasHydrationConflict =
          hasValidCloudSettings && localChangedDuringLoad;
        cloudWriteBlockedByConflict.current = hasHydrationConflict;
        setSyncStatus(
          cloudResult.status === "error" ||
            cloudResult.status === "invalid" ||
            (cloudResult.status === "success" && !hasValidCloudSettings)
            ? "error"
            : hasHydrationConflict
              ? "conflict"
              : "local-only",
        );
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

    if (
      cloudWriteBlockedByConflict.current ||
      !canSaveAppData({
        cloudLoaded,
        hasHydratedCloudData: hasHydratedCloudData.current,
        hasLocalUserChange: hasLocalUserChange.current,
      })
    ) {
      console.log("settings cloud save skipped: app data not hydrated");
      return;
    }

    saveAppDataToCloud("settings", settings).then((ok) => {
      console.log("settings cloud save:", ok);
      setSyncStatus(ok ? "synced" : "error");
      if (ok) {
        hasLocalUserChange.current = false;
        setSettingsSource("Cloud");
        setSettingsCloudDebug({ ok: true });
      }
    });
  }, [settings, cloudLoaded]);

  function setSettings(nextSettings) {
    hasLocalUserChange.current = true;
    localChangeVersion.current += 1;
    setSettingsState(nextSettings);
  }

  return {
    settings,
    setSettings,
    settingsSource,
    settingsCloudDebug,
    syncStatus,
  };
}
