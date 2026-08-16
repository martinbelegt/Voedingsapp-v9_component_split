import { EXERCISE_DATA_VERSION, EXERCISE_STORAGE_KEY, migrateExerciseCatalog } from "../data/exercises";

export function loadExerciseCatalog(storage = localStorage) {
  try {
    return migrateExerciseCatalog(JSON.parse(storage.getItem(EXERCISE_STORAGE_KEY) || "{}"));
  } catch {
    return migrateExerciseCatalog({});
  }
}

export function saveExerciseCatalog(catalog, storage = localStorage) {
  try {
    storage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify({
      version: EXERCISE_DATA_VERSION,
      savedAt: new Date().toISOString(),
      categories: catalog.categories,
      items: catalog.items,
    }));
    return true;
  } catch {
    return false;
  }
}
