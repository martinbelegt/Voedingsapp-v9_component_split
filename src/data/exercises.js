export const EXERCISE_STORAGE_KEY = "companion_exercises_v1";
export const EXERCISE_DATA_VERSION = 1;

export const EXERCISE_CATEGORIES = [
  { id: "strength", name: "Kracht" },
  { id: "mobility", name: "Mobiliteit" },
  { id: "rehabilitation", name: "Herstel/Revalidatie" },
  { id: "cardio", name: "Cardio" },
  { id: "other", name: "Overig" },
];

export const EXERCISE_BODY_REGIONS = ["Schouder", "Borst", "Rug", "Arm", "Been", "Core", "Hele lichaam", "Overig"];
export const EXERCISE_SIDES = ["Beide", "Links", "Rechts", "Afwisselend", "Niet van toepassing"];

export function createExercise(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: overrides.id || `exercise-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: overrides.name || "",
    category: overrides.category || "other",
    bodyRegion: overrides.bodyRegion || "Overig",
    goal: overrides.goal || "",
    equipment: overrides.equipment || "",
    instructions: Array.isArray(overrides.instructions)
      ? overrides.instructions.map(String)
      : String(overrides.instructions || "").split(/\r?\n/).filter(Boolean),
    source: overrides.source || "",
    sourceUrl: overrides.sourceUrl || "",
    sourceTimestamp: overrides.sourceTimestamp || "",
    sourceDosage: overrides.sourceDosage || "",
    personalDosage: overrides.personalDosage || "",
    side: overrides.side || "Niet van toepassing",
    painRule: overrides.painRule || "",
    progression: overrides.progression || "",
    regression: overrides.regression || "",
    notes: overrides.notes || "",
    favorite: Boolean(overrides.favorite),
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
  };
}

export function sanitizeExercise(value = {}) {
  const exercise = createExercise(value);
  return {
    ...exercise,
    name: exercise.name.trim(),
    instructions: exercise.instructions.map((step) => step.trim()).filter(Boolean),
    updatedAt: new Date().toISOString(),
  };
}

export function validateExercise(exercise) {
  const errors = {};
  if (!String(exercise?.name || "").trim()) errors.name = "Naam is verplicht.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function migrateExerciseCatalog(raw = {}) {
  const value = raw && typeof raw === "object" ? raw : {};
  return {
    version: EXERCISE_DATA_VERSION,
    categories: Array.isArray(value.categories) && value.categories.length ? value.categories : EXERCISE_CATEGORIES,
    items: Array.isArray(value.items) ? value.items.map(createExercise) : [],
  };
}
