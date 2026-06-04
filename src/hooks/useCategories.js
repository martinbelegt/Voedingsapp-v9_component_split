import { useEffect, useState } from "react";
import {
  loadCategories,
  saveCategories,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";

export function useCategories() {
  const [categories, setCategories] = useState(() => loadCategories());
  const [cloudLoaded, setCloudLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudCategories() {
      const cloudCategories = await loadAppDataFromCloud("categories");

      console.log("cloudCategories loaded:", cloudCategories?.length);

      if (cancelled) return;

      if (cloudCategories?.length) {
        setCategories(cloudCategories);
        saveCategories(cloudCategories);
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

    if (cloudLoaded && categories?.length > 0) {
      saveAppDataToCloud("categories", categories).then((ok) => {
        console.log("categories cloud save:", ok);
      });
    }
  }, [categories, cloudLoaded]);

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
    addCategory,
    updateCategory,
    deleteCategory,
    getCategory,
  };
}
