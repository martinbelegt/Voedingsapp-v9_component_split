import { useEffect, useRef, useState } from "react";

import { createId } from "../services/idService";

import {
  loadSavedMeals,
  loadStoredSavedMeals,
  saveSavedMeals,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";
import { isMigrationSavedMeals } from "../services/appDataSyncService";

export function useSavedMeals() {
  const storedSavedMeals = useRef(loadStoredSavedMeals());
  const [savedMeals, setSavedMealsState] = useState(() => loadSavedMeals());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [savedMealsSource, setSavedMealsSource] = useState(
    storedSavedMeals.current ? "Local cache" : "Defaults",
  );
  const [savedMealsCloudDebug, setSavedMealsCloudDebug] = useState({
    count: null,
    ok: false,
  });
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudSavedMeals() {
      const cloudSavedMeals = await loadAppDataFromCloud("savedMeals");

      console.log("cloudSavedMeals loaded:", cloudSavedMeals?.length);

      if (cancelled) return;

      if (Array.isArray(cloudSavedMeals)) {
        hasHydratedCloudData.current = true;
        setSavedMealsSource("Cloud");
        setSavedMealsCloudDebug({
          count: cloudSavedMeals.length,
          ok: true,
        });
        setSavedMealsState(cloudSavedMeals);
        saveSavedMeals(cloudSavedMeals);
      } else if (isMigrationSavedMeals(storedSavedMeals.current)) {
        const ok = await saveAppDataToCloud(
          "savedMeals",
          storedSavedMeals.current,
        );
        console.log("savedMeals one-time local migration:", {
          ok,
          count: storedSavedMeals.current.length,
        });

        if (ok) {
          hasHydratedCloudData.current = true;
          setSavedMealsSource("Cloud");
          setSavedMealsCloudDebug({
            count: storedSavedMeals.current.length,
            ok: true,
          });
          setSavedMealsState(storedSavedMeals.current);
          saveSavedMeals(storedSavedMeals.current);
        }
      }

      setCloudLoaded(true);
    }

    loadCloudSavedMeals();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveSavedMeals(savedMeals);

    if (!cloudLoaded) return;

    if (!hasHydratedCloudData.current && !hasLocalUserChange.current) {
      console.log("savedMeals cloud save skipped: app data not hydrated");
      return;
    }

    if (savedMeals?.length > 0) {
      saveAppDataToCloud("savedMeals", savedMeals).then((ok) => {
        console.log("savedMeals cloud save:", ok);
        if (ok) {
          setSavedMealsSource("Cloud");
          setSavedMealsCloudDebug({
            count: savedMeals.length,
            ok: true,
          });
        }
      });
    }
  }, [savedMeals, cloudLoaded]);

  function setSavedMeals(nextSavedMeals) {
    hasLocalUserChange.current = true;
    setSavedMealsState(nextSavedMeals);
  }

  function addSavedMeal(name, rows, options = {}) {
    const newMeal = {
      id: createId("saved-meal"),

      name,

      rows,

      servings: options.servings || 1,
    };

    setSavedMeals((prev) => [...prev, newMeal]);
  }

  function deleteSavedMeal(id) {
    setSavedMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function getSavedMeal(id) {
    return savedMeals.find((m) => m.id === id);
  }

  function overwriteSavedMeal(id, rows, name) {
    setSavedMeals((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              rows,
              name: name ?? m.name,
            }
          : m,
      ),
    );
  }

  return {
    savedMeals,
    setSavedMeals,
    savedMealsSource,
    savedMealsCloudDebug,
    addSavedMeal,
    deleteSavedMeal,
    getSavedMeal,
    overwriteSavedMeal,
  };
}
