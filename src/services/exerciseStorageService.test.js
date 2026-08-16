import { loadExerciseCatalog, saveExerciseCatalog } from "./exerciseStorageService";
import { createExercise, EXERCISE_STORAGE_KEY } from "../data/exercises";

test("oefeningencatalogus wordt duurzaam opgeslagen en geladen", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  const item = createExercise({ id: "ex-1", name: "Oefening", sourceTimestamp: "02:10", sourceDosage: "10", personalDosage: "5" });
  expect(saveExerciseCatalog({ categories: [], items: [item] }, storage)).toBe(true);
  expect(values.has(EXERCISE_STORAGE_KEY)).toBe(true);
  expect(loadExerciseCatalog(storage).items[0]).toMatchObject(item);
});
