import { useEffect, useRef, useState } from "react";
import {
  loadCategories,
  loadStoredCategories,
  saveCategories,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";
import { isMigrationCategories } from "../services/appDataSyncService";

export function useCategories() {
  const storedCategories = useRef(loadStoredCategories());
  const [categories, setCategoriesState] = useState(() => loadCategories());
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [categoriesSource, setCategoriesSource] = useState(
    storedCategories.current ? "Local cache" : "Defaults",
  );
  const [categoriesCloudDebug, setCategoriesCloudDebug] = useState({
    count: null,
    ok: false,
  });
  const hasHydratedCloudData = useRef(false);
  const hasLocalUserChange = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudCategories() {
      const cloudCategories = await loadAppDataFromCloud("categories");

      console.log("cloudCategories loaded:", cloudCategories?.length);

      if (cancelled) return;

      if (Array.isArray(cloudCategories)) {
        hasHydratedCloudData.current = true;
        setCategoriesSource("Cloud");
        setCategoriesCloudDebug({
          count: cloudCategories.length,
          ok: true,
        });
        setCategoriesState(cloudCategories);
        saveCategories(cloudCategories);
      } else if (isMigrationCategories(storedCategories.current)) {
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
          setCategoriesSource("Cloud");
          setCategoriesCloudDebug({
            count: storedCategories.current.length,
            ok: true,
          });
          setCategoriesState(storedCategories.current);
          saveCategories(storedCategories.current);
        }
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

    if (!cloudLoaded) return;

    if (!hasHydratedCloudData.current && !hasLocalUserChange.current) {
      console.log("categories cloud save skipped: app data not hydrated");
      return;
    }

    if (categories?.length > 0) {
      saveAppDataToCloud("categories", categories).then((ok) => {
        console.log("categories cloud save:", ok);
        if (ok) {
          setCategoriesSource("Cloud");
          setCategoriesCloudDebug({
            count: categories.length,
            ok: true,
          });
        }
      });
    }
  }, [categories, cloudLoaded]);

  function setCategories(nextCategories) {
    hasLocalUserChange.current = true;
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
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
  };
}
