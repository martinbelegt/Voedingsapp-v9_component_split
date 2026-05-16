export function createFullBackupSnapshot({
  categories,
  products,
  rows,
  settings,
  savedMeals,
  testLog,
}) {
  return {
    exportedAt: new Date().toISOString(),
    app: "diabetes-creon-webapp",
    version: 2,
    categories,
    products,
    rows,
    settings,
    savedMeals,
    testLog,
  };
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
  return !!raw && raw.app === "diabetes-creon-webapp";
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
