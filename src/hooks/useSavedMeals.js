import { useEffect, useState } from "react";

import { createId } from "../services/idService";

import {
  loadSavedMeals,
  saveSavedMeals,
  loadAppDataFromCloud,
  saveAppDataToCloud,
} from "../services/localStorageService";

export function useSavedMeals() {
  const [savedMeals, setSavedMeals] = useState(() => loadSavedMeals());
  const [cloudLoaded, setCloudLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCloudSavedMeals() {
      const cloudSavedMeals = await loadAppDataFromCloud("savedMeals");

      console.log("cloudSavedMeals loaded:", cloudSavedMeals?.length);

      if (cancelled) return;

      if (cloudSavedMeals?.length) {
        setSavedMeals(cloudSavedMeals);
        saveSavedMeals(cloudSavedMeals);
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

    if (cloudLoaded && savedMeals?.length > 0) {
      saveAppDataToCloud("savedMeals", savedMeals).then((ok) => {
        console.log("savedMeals cloud save:", ok);
      });
    }
  }, [savedMeals, cloudLoaded]);

  function addSavedMeal(name, rows) {
    const newMeal = {
      id: createId("saved-meal"),
      name,
      rows,
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
    addSavedMeal,
    deleteSavedMeal,
    getSavedMeal,
    overwriteSavedMeal,
  };
}
