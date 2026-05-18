export function removeBaseProducts(products) {
  return products.filter((p) => p.packName && String(p.packName).trim() !== "");
}

export function removeProductsFromPack(products, packName) {
  return products.filter((p) => p.packName !== packName);
}
export function createPackFilterOptions(activePackNames) {
  return [
    { value: "all", label: "Alles" },
    { value: "__base__", label: "Basis / handmatig" },
    ...activePackNames.map((name) => ({
      value: name,
      label: name,
    })),
  ];
}
