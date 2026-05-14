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
