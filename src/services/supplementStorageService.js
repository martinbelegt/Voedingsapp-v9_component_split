import {
  migrateSupplementCatalog,
  migrateSupplements,
  SUPPLEMENT_DATA_VERSION,
  SUPPLEMENT_STORAGE_KEY,
} from "../data/supplements";

export function loadSupplementCatalog(storage = localStorage) {
  try {
    const raw = storage.getItem(SUPPLEMENT_STORAGE_KEY);
    return migrateSupplementCatalog(raw ? JSON.parse(raw) : {});
  } catch {
    return migrateSupplementCatalog({});
  }
}

export function loadSupplements(storage = localStorage) {
  return loadSupplementCatalog(storage).items;
}

export function saveSupplementCatalog(catalog, storage = localStorage) {
  try {
    storage.setItem(
      SUPPLEMENT_STORAGE_KEY,
      JSON.stringify({
        version: SUPPLEMENT_DATA_VERSION,
        savedAt: new Date().toISOString(),
        categories: catalog.categories,
        items: catalog.items,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function saveSupplements(items, storage = localStorage) {
  const current = loadSupplementCatalog(storage);
  return saveSupplementCatalog({ ...current, items }, storage);
}
