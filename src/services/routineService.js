import { createId as defaultCreateId } from "./idService";

export const ROUTINE_STORAGE_KEY = "companion_routines_v1";
export const ROUTINE_MODEL_VERSION = 1;

export const ROUTINE_ITEM_TYPES = [
  "food",
  "supplement",
  "medication",
  "exercise",
  "note",
];

export function createRoutine(overrides = {}, options = {}) {
  const createId = options.createId || defaultCreateId;
  const now = options.now || new Date().toISOString();

  return {
    id: overrides.id || createId("routine"),
    name: overrides.name || "Nieuwe routine",
    description: overrides.description || "",
    color: overrides.color || "#557a5b",
    icon: overrides.icon || "☀️",
    startTime: overrides.startTime || "",
    items: Array.isArray(overrides.items) ? overrides.items : [],
    // Gereserveerde planning/participatievelden. Deze foundation voert ze niet uit.
    schedule: {
      weekdays: [],
      times: [],
      dayType: "any",
      ...(overrides.schedule || {}),
    },
    reminders: Array.isArray(overrides.reminders) ? overrides.reminders : [],
    extensions: {
      ai: null,
      community: null,
      marketplace: null,
      ...(overrides.extensions || {}),
    },
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    modelVersion: ROUTINE_MODEL_VERSION,
  };
}

export function createRoutineItem(input, options = {}) {
  const createId = options.createId || defaultCreateId;
  if (!ROUTINE_ITEM_TYPES.includes(input.type)) {
    throw new Error("Onbekend routine-itemtype.");
  }
  if (input.type !== "note" && !input.catalogItemId) {
    throw new Error("Een catalogusverwijzing is verplicht.");
  }

  return {
    id: input.id || createId("routine-item"),
    type: input.type,
    catalogItemId: input.catalogItemId || null,
    defaultAmount: input.defaultAmount ?? "",
    defaultUnit: input.defaultUnit || "",
    defaultNote: input.defaultNote || "",
    order: Number.isFinite(input.order) ? input.order : 0,
  };
}

export function loadRoutines(storage = localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(ROUTINE_STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map((routine) => createRoutine(routine))
      : [];
  } catch {
    return [];
  }
}

export function saveRoutines(routines, storage = localStorage) {
  try {
    storage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routines));
    return true;
  } catch {
    return false;
  }
}

export function resolveRoutineItem(item, catalogs) {
  if (item.type === "food") {
    const product = catalogs.products.find(({ id }) => id === item.catalogItemId);
    return product ? { item, catalogItem: product, label: product.name } : null;
  }
  if (item.type === "supplement") {
    const supplement = catalogs.supplements.find(
      ({ id }) => id === item.catalogItemId,
    );
    return supplement
      ? { item, catalogItem: supplement, label: supplement.product?.name || "Supplement" }
      : null;
  }
  if (item.type === "exercise") {
    const exercise = (catalogs.exercises || []).find(({ id }) => id === item.catalogItemId);
    return exercise ? { item, catalogItem: exercise, label: exercise.name || "Oefening" } : null;
  }
  return null;
}

export function buildRoutineRegistrations(routine, checkedIds, catalogs, now = new Date()) {
  const eventTime = new Date(now);
  const executionId = defaultCreateId("routine-execution");
  if (routine.startTime) {
    const [hours, minutes] = routine.startTime.split(":").map(Number);
    eventTime.setHours(hours, minutes, 0, 0);
  }

  return routine.items
    .filter((item) => checkedIds.includes(item.id))
    .map((item) => resolveRoutineItem(item, catalogs))
    .filter(Boolean)
    .map(({ item, catalogItem, label }) => {
      const routineExecution = {
        id: executionId,
        routineId: routine.id,
        name: routine.name,
        icon: routine.icon,
        color: routine.color,
        itemCount: checkedIds.length,
      };
      if (item.type === "supplement") {
        return {
          type: "supplement",
          input: {
            date: eventTime.toISOString().slice(0, 10),
            eventTime: eventTime.toISOString(),
            name: label,
            supplementName: label,
            supplementId: catalogItem.id,
            dosage: item.defaultAmount || catalogItem.personal?.dosage || "",
            unit: item.defaultUnit || catalogItem.personal?.dosageUnit || "",
            note: item.defaultNote,
            brand: catalogItem.product?.brand || "",
            productName: catalogItem.product?.productName || "",
            routineExecution,
          },
        };
      }

      if (item.type === "exercise") {
        return {
          type: "exercise",
          input: {
            date: eventTime.toISOString().slice(0, 10),
            eventTime: eventTime.toISOString(),
            activityType: label,
            exerciseName: label,
            exerciseId: catalogItem.id,
            personalDosage: item.defaultAmount || catalogItem.personalDosage || "",
            side: catalogItem.side || "Niet van toepassing",
            note: item.defaultNote || catalogItem.notes || "",
            routineExecution,
          },
        };
      }

      const amount = item.defaultAmount || 1;
      const grams = item.defaultUnit === "g"
        ? Number(amount) || 0
        : (Number(catalogItem.portionGram) || 100) * (Number(amount) || 1);
      const factor = grams / 100;
      return {
        type: "food",
        input: {
          date: eventTime.toISOString().slice(0, 10),
          name: routine.name,
          mealMoment: "neutral",
          mealNote: item.defaultNote,
          eatenAt: eventTime.toISOString(),
          rows: [{
            id: `routine-row-${item.id}`,
            productId: catalogItem.id,
            mode: item.defaultUnit === "g" ? "gram" : "portion",
            amount: String(amount),
          }],
          totals: {
            kh: (Number(catalogItem.kh100) || 0) * factor,
            protein: (Number(catalogItem.protein100) || 0) * factor,
            fat: (Number(catalogItem.fat100) || 0) * factor,
            kcal: (Number(catalogItem.kcal100) || 0) * factor,
          },
          routineExecution,
        },
      };
    });
}
