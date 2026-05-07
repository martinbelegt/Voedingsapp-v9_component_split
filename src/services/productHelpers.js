export function getCategoryById(categories, categoryId) {
  return categories.find((c) => c.id === categoryId) || null;
}

export function getCategoryName(categories, categoryId) {
  return getCategoryById(categories, categoryId)?.name || "Onbekend";
}

export function getCategoryColor(categories, categoryId) {
  return getCategoryById(categories, categoryId)?.color || "#f1f5f9";
}

export function getProductById(products, productId) {
  return products.find((p) => p.id === productId) || null;
}
