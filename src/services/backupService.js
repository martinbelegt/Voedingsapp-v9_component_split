export const CURRENT_BACKUP_VERSION = 3;
export const LEGACY_BACKUP_MAX_VERSION = 2;

const ARRAY_DATASETS = [
  "categories",
  "products",
  "rows",
  "savedMeals",
  "testLog",
  "dailyLog",
  "timers",
];

const DAILY_LOG_COLLECTIONS = [
  "meals",
  "insulinEvents",
  "glucoseEvents",
  "glucoseBoostEvents",
  "movementEvents",
  "supplementEvents",
  "bowelEvents",
  "noteEvents",
  "trainingPlanEvents",
  "sportSupplementPlanEvents",
];

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function createFullBackupSnapshot({
  categories,
  products,
  rows,
  settings,
  savedMeals,
  testLog,
  dailyLog,
  timers,
}) {
  return {
    exportedAt: new Date().toISOString(),
    app: "diabetes-creon-webapp",
    version: CURRENT_BACKUP_VERSION,
    categories,
    products,
    rows,
    settings,
    savedMeals,
    testLog,
    dailyLog,
    timers,
  };
}

export function validateFullBackupObject(raw) {
  if (!isPlainObject(raw) || raw.app !== "diabetes-creon-webapp") {
    return { ok: false, error: "Dit is geen geldige Companion-backup." };
  }

  const version = Number(raw.version);
  if (!Number.isInteger(version) || version < 1) {
    return { ok: false, error: "De backupversie ontbreekt of is ongeldig." };
  }

  if (version > CURRENT_BACKUP_VERSION) {
    return {
      ok: false,
      error: `Backupversie ${version} wordt door deze app nog niet ondersteund.`,
    };
  }

  // Versie 1 en 2 zijn legacyformaten zonder dailyLog en timers.
  // Alleen aanwezige datasets worden bij legacyherstel toegepast.
  const isLegacy = version <= LEGACY_BACKUP_MAX_VERSION;

  for (const key of ARRAY_DATASETS) {
    if (hasOwn(raw, key) && !Array.isArray(raw[key])) {
      return { ok: false, error: `Backupveld "${key}" moet een lijst zijn.` };
    }
  }

  if (hasOwn(raw, "settings") && !isPlainObject(raw.settings)) {
    return { ok: false, error: 'Backupveld "settings" moet een object zijn.' };
  }

  if (!isLegacy) {
    const requiredFields = [...ARRAY_DATASETS, "settings"];
    const missingField = requiredFields.find((key) => !hasOwn(raw, key));

    if (missingField) {
      return {
        ok: false,
        error: `Volledige backup mist verplicht veld "${missingField}".`,
      };
    }
  }

  if (Array.isArray(raw.dailyLog)) {
    for (const day of raw.dailyLog) {
      if (!isPlainObject(day) || typeof day.date !== "string" || !day.date) {
        return {
          ok: false,
          error: "dailyLog bevat een dag zonder geldige datum.",
        };
      }

      for (const collection of DAILY_LOG_COLLECTIONS) {
        if (hasOwn(day, collection) && !Array.isArray(day[collection])) {
          return {
            ok: false,
            error: `dailyLog-collectie "${collection}" moet een lijst zijn.`,
          };
        }
      }
    }
  }

  if (Array.isArray(raw.timers)) {
    const hasInvalidTimer = raw.timers.some(
      (timer) =>
        !isPlainObject(timer) ||
        typeof timer.id !== "string" ||
        !timer.id ||
        typeof timer.startedAt !== "string" ||
        typeof timer.endsAt !== "string",
    );

    if (hasInvalidTimer) {
      return {
        ok: false,
        error: "De backup bevat een ongeldige maaltijdtimer.",
      };
    }
  }

  return { ok: true, version, isLegacy };
}

export function prepareRestoredBackupData(raw, adapters) {
  const validation = validateFullBackupObject(raw);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const restored = {
    version: validation.version,
    isLegacy: validation.isLegacy,
  };

  if (hasOwn(raw, "categories")) restored.categories = raw.categories;
  if (hasOwn(raw, "products")) {
    restored.products = raw.products.map(adapters.normalizeProduct);
  }
  if (hasOwn(raw, "rows")) {
    restored.rows = adapters.ensureLastEmptyRow(
      adapters.normalizeMealRows(raw.rows),
    );
  }
  if (hasOwn(raw, "settings")) {
    restored.settings = adapters.migrateSettings(raw.settings);
  }
  if (hasOwn(raw, "savedMeals")) restored.savedMeals = raw.savedMeals;
  if (hasOwn(raw, "testLog")) restored.testLog = raw.testLog;

  // Geen veldmapping: alle huidige en toekomstige dailyLog-/timervelden
  // blijven exact behouden.
  if (hasOwn(raw, "dailyLog")) restored.dailyLog = raw.dailyLog;
  if (hasOwn(raw, "timers")) restored.timers = raw.timers;

  return restored;
}

export function downloadJsonFile(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

export function createBackupFileName() {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `diabetes-creon-backup-${stamp}.json`;
}
export function getProductsForPackExport(products, activePackFilter) {
  if (activePackFilter === "all") return products;

  if (activePackFilter === "__base__") {
    return products.filter(
      (p) => !p.packName || String(p.packName).trim() === "",
    );
  }

  return products.filter((p) => p.packName === activePackFilter);
}

export function getPackExportName(activePackFilter) {
  if (activePackFilter === "all") return "Alles";
  if (activePackFilter === "__base__") return "Basis";
  return activePackFilter;
}

export function createPackExportObject(products, activePackFilter) {
  const data = getProductsForPackExport(products, activePackFilter);

  return {
    type: "product_import",
    name: getPackExportName(activePackFilter),
    products: data.map((p) => ({
      name: p.name,
      categoryId: p.categoryId,
      portion: p.portion,
      portionGram: p.portionGram,
      kh100: p.kh100,
      protein100: p.protein100,
      fat100: p.fat100,
      kcal100: p.kcal100,
      favorite: !!p.favorite,
      packName:
        activePackFilter === "all"
          ? p.packName || ""
          : activePackFilter === "__base__"
            ? ""
            : activePackFilter,
    })),
  };
}

export function createPackExportFileName(activePackFilter) {
  if (activePackFilter === "all") return "export_alles.json";
  if (activePackFilter === "__base__") return "export_basis.json";
  return `export_${String(activePackFilter).toLowerCase()}.json`;
}
export function isFullBackupObject(raw) {
  return validateFullBackupObject(raw).ok;
}
export function isProductImportObject(raw) {
  return raw?.type === "product_import" && Array.isArray(raw.products);
}
export function getProductImportKey(product) {
  return `${String(product.name).trim().toLowerCase()}__${
    product.categoryId || ""
  }`;
}

export function createExistingProductKeySet(products) {
  return new Set(products.map(getProductImportKey));
}
export function normalizeImportedProducts(
  products,
  { normalizeProduct, createId },
) {
  return products.map((p) =>
    normalizeProduct({
      id: createId("prod"),
      ...p,
    }),
  );
}
export function createProductImportResultMessage(importedCount, skippedCount) {
  return (
    `${importedCount} producten geïmporteerd.` +
    (skippedCount > 0
      ? ` ${skippedCount} product(en) overgeslagen omdat ze al bestonden.`
      : "")
  );
}
export function getBackupCategories(backup, starterCategories) {
  return Array.isArray(backup.categories)
    ? backup.categories
    : starterCategories;
}

export function getBackupProducts(
  backup,
  { starterProducts, normalizeProduct, applyGiToProducts },
) {
  return Array.isArray(backup.products)
    ? backup.products.map(normalizeProduct)
    : applyGiToProducts(starterProducts);
}
export function getBackupRows(
  backup,
  { normalizeMealRows, ensureLastEmptyRow, makeRow },
) {
  return Array.isArray(backup.rows)
    ? ensureLastEmptyRow(normalizeMealRows(backup.rows))
    : [makeRow(), makeRow(), makeRow()];
}

export function getBackupSettings(backup, migrateSettings) {
  return migrateSettings(backup.settings);
}

export function getBackupSavedMeals(backup) {
  return Array.isArray(backup.savedMeals) ? backup.savedMeals : [];
}

export function getBackupTestLog(backup) {
  return Array.isArray(backup.testLog) ? backup.testLog : [];
}
export function createProductImportKey(product) {
  return `${String(product.name).trim().toLowerCase()}__${product.categoryId || ""}`;
}

export function getNewProductsFromImport(
  rawProducts,
  existingProducts,
  normalizeProduct,
  createId,
) {
  const existingKeys = new Set(existingProducts.map(createProductImportKey));

  return rawProducts
    .filter((p) => !existingKeys.has(createProductImportKey(p)))
    .map((p) =>
      normalizeProduct({
        id: createId("prod"),
        ...p,
      }),
    );
}
