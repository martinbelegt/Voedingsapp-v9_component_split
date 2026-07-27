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
import {
  canSaveAppData,
  decideInitialArrayAuthority,
  shouldAttemptMigration,
} from "../services/syncSafetyService";

export function useSavedMeals() {
  const storedSavedMeals = useRef(loadStoredSavedMeals());
  const [savedMeals, setSavedMealsState] = useState(() => loadSavedMeals());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [savedMealsSource, setSavedMealsSource] = useState(
    storedSavedMeals.current ? "Local cache" : "Defaults",
  );
  const [savedMealsCloudDebug, setSavedMealsCloudDebug] = useState({
    count: null,
    ok: false,
  });
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);
  const localChangeVersion = useRef(0);
  const cloudWriteBlockedByConflict = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudSavedMeals() {
      const mutationVersionAtLoadStart = localChangeVersion.current;
      const cloudResult = await loadAppDataFromCloud("savedMeals");
      const cloudSavedMeals = cloudResult.value;

      console.log("cloudSavedMeals loaded:", cloudSavedMeals?.length);

      if (cancelled) return;

      const decision = decideInitialArrayAuthority({
        localValue: savedMeals,
        cloudResult,
        localChangedDuringLoad:
          localChangeVersion.current !== mutationVersionAtLoadStart,
      });

      if (
        (cloudResult.status === "success" ||
          cloudResult.status === "empty") &&
        decision.action !== "keep-local"
      ) {
        hasHydratedCloudData.current = true;
        setSyncStatus("synced");
        setSavedMealsSource("Cloud");
        setSavedMealsCloudDebug({
          count: cloudSavedMeals.length,
          ok: true,
        });
        setSavedMealsState(cloudSavedMeals);
        saveSavedMeals(cloudSavedMeals);
      } else if (
        shouldAttemptMigration(
          cloudResult.status,
          isMigrationSavedMeals(storedSavedMeals.current),
        )
      ) {
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
          setSyncStatus("synced");
          setSavedMealsSource("Cloud");
          setSavedMealsCloudDebug({
            count: storedSavedMeals.current.length,
            ok: true,
          });
          setSavedMealsState(storedSavedMeals.current);
          saveSavedMeals(storedSavedMeals.current);
        } else {
          setSyncStatus("error");
        }
      } else {
        cloudWriteBlockedByConflict.current = decision.status === "conflict";
        setSyncStatus(
          cloudResult.status === "error" || cloudResult.status === "invalid"
            ? "error"
            : decision.status,
        );
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

    if (
      cloudWriteBlockedByConflict.current ||
      !canSaveAppData({
        cloudLoaded,
        hasHydratedCloudData: hasHydratedCloudData.current,
        hasLocalUserChange: hasLocalUserChange.current,
      })
    ) {
      console.log("savedMeals cloud save skipped: app data not hydrated");
      return;
    }

    saveAppDataToCloud("savedMeals", savedMeals).then((ok) => {
      console.log("savedMeals cloud save:", ok);
      setSyncStatus(ok ? "synced" : "error");
      if (ok) {
        hasLocalUserChange.current = false;
        setSavedMealsSource("Cloud");
        setSavedMealsCloudDebug({
          count: savedMeals.length,
          ok: true,
        });
      }
    });
  }, [savedMeals, cloudLoaded]);

  function setSavedMeals(nextSavedMeals) {
    hasLocalUserChange.current = true;
    localChangeVersion.current += 1;
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
    syncStatus,
    addSavedMeal,
    deleteSavedMeal,
    getSavedMeal,
    overwriteSavedMeal,
  };
}
