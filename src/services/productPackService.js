export function removeBaseProducts(products) {
  return products.filter((p) => p.packName && String(p.packName).trim() !== "");
}

export function removeProductsFromPack(products, packName) {
  return products.filter((p) => p.packName !== packName);
}
