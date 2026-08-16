import { createExercise, sanitizeExercise, validateExercise } from "../data/exercises";

export function parseExerciseImportJson(text) {
  try { return JSON.parse(String(text || "")); }
  catch { throw new Error("Ongeldige JSON. Kies een geldig oefeningbestand."); }
}

export function assertSingleExerciseObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Het bestand moet precies één oefeningobject bevatten.");
  }
  return value;
}

export function normalizeExerciseImport(raw = {}, categories = []) {
  const available = new Set(categories.map(({ id }) => id));
  const candidate = sanitizeExercise({
    ...raw,
    category: available.has(raw.category) ? raw.category : "other",
    instructions: Array.isArray(raw.instructions) ? raw.instructions : [],
  });
  return { candidate, unknownCategory: raw.category && !available.has(raw.category) ? raw.category : "" };
}

function normalized(value) { return String(value || "").trim().toLocaleLowerCase("nl"); }

export function findExerciseDuplicate(candidate, items = []) {
  const byId = candidate.id && items.find(({ id }) => id === candidate.id);
  if (byId) return { type: "id", item: byId };
  const name = normalized(candidate.name);
  const byName = name && items.find((item) => normalized(item.name) === name);
  return byName ? { type: "name", item: byName } : null;
}

export function buildExerciseImportResult(raw, categories = [], items = []) {
  const { candidate, unknownCategory } = normalizeExerciseImport(raw, categories);
  return { candidate, validation: validateExercise(candidate), duplicate: findExerciseDuplicate(candidate, items), unknownCategory };
}

export function createNewExerciseVariant(result) {
  return result?.candidate ? sanitizeExercise(createExercise({ ...result.candidate, id: "" })) : null;
}

export function appendExerciseToCatalog(catalog, exercise) {
  return { ...catalog, items: [exercise, ...(catalog.items || [])] };
}
