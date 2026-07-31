import {
  migrateSupplements,
  SUPPLEMENT_DATA_VERSION,
  SUPPLEMENT_STORAGE_KEY,
} from "../data/supplements";

export function loadSupplements(storage = localStorage) {
  try {
    const raw = storage.getItem(SUPPLEMENT_STORAGE_KEY);
    if (!raw) return migrateSupplements([]);
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed?.items;
    return migrateSupplements(items);
  } catch {
    return migrateSupplements([]);
  }
}

export function saveSupplements(items, storage = localStorage) {
  try {
    storage.setItem(
      SUPPLEMENT_STORAGE_KEY,
      JSON.stringify({
        version: SUPPLEMENT_DATA_VERSION,
        savedAt: new Date().toISOString(),
        items,
      }),
    );
    return true;
  } catch {
    return false;
  }
}
