import { useEffect, useState } from "react";
import { defaultSettings } from "../data/defaults";
import { loadSettings, saveSettings } from "../services/localStorageService";

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    const savedSettings = loadSettings();
    return {
      ...defaultSettings,
      ...(savedSettings || {}),
    };
  });

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return {
    settings,
    setSettings,
  };
}
