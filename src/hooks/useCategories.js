import { useEffect, useState } from "react";
import {
  loadCategories,
  saveCategories,
} from "../services/localStorageService";

export function useCategories() {
  const [categories, setCategories] = useState(() => loadCategories());

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

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
