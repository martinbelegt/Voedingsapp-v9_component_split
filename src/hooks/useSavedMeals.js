import { useEffect, useState } from "react";

import { createId } from "../services/idService";
import {
  loadSavedMeals,
  saveSavedMeals,
} from "../services/localStorageService";

export function useSavedMeals() {
  const [savedMeals, setSavedMeals] = useState(() => loadSavedMeals());

  useEffect(() => {
    saveSavedMeals(savedMeals);
  }, [savedMeals]);

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

  function overwriteSavedMeal(id, rows) {
    setSavedMeals((prev) =>
      prev.map((m) => (m.id === id ? { ...m, rows } : m)),
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
