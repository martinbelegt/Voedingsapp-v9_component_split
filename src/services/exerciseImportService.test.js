import { EXERCISE_CATEGORIES, createExercise } from "../data/exercises";
import { appendExerciseToCatalog, assertSingleExerciseObject, buildExerciseImportResult, createNewExerciseVariant, parseExerciseImportJson } from "./exerciseImportService";

const raw = {
  id: "exercise-1", name: "Side-lying external rotation", category: "rehabilitation", bodyRegion: "Schouder",
  goal: "Controle", equipment: "Dumbbell", instructions: ["Ga liggen.", "Roteer rustig."], source: "Video",
  sourceUrl: "https://youtu.be/abc", sourceTimestamp: "1:23", sourceDosage: "30–60 seconden",
  personalDosage: "20 seconden × 1", side: "Links", painRule: "Stop bij pijn", progression: "Zwaarder",
  regression: "Zonder gewicht", notes: "Rustig",
};

test("geldige oefeningimport houdt alle ondersteunde velden lossless", () => {
  const parsed = assertSingleExerciseObject(parseExerciseImportJson(JSON.stringify(raw)));
  const result = buildExerciseImportResult(parsed, EXERCISE_CATEGORIES, []);
  expect(result.validation.valid).toBe(true);
  expect(result.candidate).toMatchObject(raw);
  expect(result.candidate.instructions).toEqual(raw.instructions);
  expect(result.candidate.sourceDosage).toBe("30–60 seconden");
  expect(result.candidate.personalDosage).toBe("20 seconden × 1");
  const stored = appendExerciseToCatalog({ categories: EXERCISE_CATEGORIES, items: [] }, result.candidate);
  expect(stored.items[0]).toMatchObject(raw);
});

test("ongeldige JSON en ontbrekende naam worden geweigerd", () => {
  expect(() => parseExerciseImportJson("{name:}")).toThrow("Ongeldige JSON");
  expect(() => assertSingleExerciseObject([])).toThrow("precies één oefeningobject");
  expect(buildExerciseImportResult({ instructions: [] }, EXERCISE_CATEGORIES, []).validation.valid).toBe(false);
});

test("duplicaten worden eerst op id en anders op genormaliseerde naam gevonden", () => {
  const existing = [createExercise(raw)];
  expect(buildExerciseImportResult(raw, EXERCISE_CATEGORIES, existing).duplicate.type).toBe("id");
  expect(buildExerciseImportResult({ ...raw, id: "ander", name: "  SIDE-LYING EXTERNAL ROTATION " }, EXERCISE_CATEGORIES, existing).duplicate.type).toBe("name");
});

test("import als nieuw krijgt een ander id; annuleren wijzigt de catalogus niet", () => {
  const catalog = { categories: EXERCISE_CATEGORIES, items: [createExercise(raw)] };
  const result = buildExerciseImportResult(raw, EXERCISE_CATEGORIES, catalog.items);
  const variant = createNewExerciseVariant(result);
  expect(variant.id).not.toBe(raw.id);
  expect(variant).toMatchObject({ ...raw, id: variant.id });
  expect(catalog.items).toHaveLength(1);
});
