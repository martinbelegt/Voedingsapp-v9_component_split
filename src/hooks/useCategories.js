import { useEffect, useRef, useState } from "react";
import {
  loadCategories,
  loadStoredCategories,
  saveCategories,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";
import { isMigrationCategories } from "../services/appDataSyncService";
import {
  canSaveAppData,
  decideInitialArrayAuthority,
  shouldAttemptMigration,
} from "../services/syncSafetyService";

export function useCategories() {
  const storedCategories = useRef(loadStoredCategories());
  const [categories, setCategoriesState] = useState(() => loadCategories());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [categoriesSource, setCategoriesSource] = useState(
    storedCategories.current ? "Local cache" : "Defaults",
  );
  const [categoriesCloudDebug, setCategoriesCloudDebug] = useState({
    count: null,
    ok: false,
  });
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);
  const localChangeVersion = useRef(0);
  const cloudWriteBlockedByConflict = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudCategories() {
      const mutationVersionAtLoadStart = localChangeVersion.current;
      const cloudResult = await loadAppDataFromCloud("categories");
      const cloudCategories = cloudResult.value;

      console.log("cloudCategories loaded:", cloudCategories?.length);

      if (cancelled) return;

      const decision = decideInitialArrayAuthority({
        localValue: categories,
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
        setCategoriesSource("Cloud");
        setCategoriesCloudDebug({
          count: cloudCategories.length,
          ok: true,
        });
        setCategoriesState(cloudCategories);
        saveCategories(cloudCategories);
      } else if (
        shouldAttemptMigration(
          cloudResult.status,
          isMigrationCategories(storedCategories.current),
        )
      ) {
        const ok = await saveAppDataToCloud(
          "categories",
          storedCategories.current,
        );
        console.log("categories one-time local migration:", {
          ok,
          count: storedCategories.current.length,
        });

        if (ok) {
          hasHydratedCloudData.current = true;
          setSyncStatus("synced");
          setCategoriesSource("Cloud");
          setCategoriesCloudDebug({
            count: storedCategories.current.length,
            ok: true,
          });
          setCategoriesState(storedCategories.current);
          saveCategories(storedCategories.current);
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

    loadCloudCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveCategories(categories);

    if (
      cloudWriteBlockedByConflict.current ||
      !canSaveAppData({
        cloudLoaded,
        hasHydratedCloudData: hasHydratedCloudData.current,
        hasLocalUserChange: hasLocalUserChange.current,
      })
    ) {
      console.log("categories cloud save skipped: app data not hydrated");
      return;
    }

    saveAppDataToCloud("categories", categories).then((ok) => {
      console.log("categories cloud save:", ok);
      setSyncStatus(ok ? "synced" : "error");
      if (ok) {
        hasLocalUserChange.current = false;
        setCategoriesSource("Cloud");
        setCategoriesCloudDebug({
          count: categories.length,
          ok: true,
        });
      }
    });
  }, [categories, cloudLoaded]);

  function setCategories(nextCategories) {
    hasLocalUserChange.current = true;
    localChangeVersion.current += 1;
    setCategoriesState(nextCategories);
  }

  function addCategory(category) {
    setCategories((prev) => [...prev, category]);
  }

  function updateCategory(id, patch) {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, ...patch } : category,
      ),
    );
  }

  function deleteCategory(id) {
    setCategories((prev) => prev.filter((category) => category.id !== id));
  }

  function getCategory(id) {
    return categories.find((category) => category.id === id);
  }

  return {
    categories,
    setCategories,
    categoriesSource,
    categoriesCloudDebug,
    syncStatus,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
  };
}
