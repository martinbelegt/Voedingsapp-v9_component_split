function normalizeName(name) {
  return String(name || "").trim();
}

export function validateCategoryName(name, categories, exceptId = null) {
  const cleaned = normalizeName(name);
  if (!cleaned) return "Categorienaam is verplicht.";
  const duplicate = categories.some(
    (category) =>
      category.id !== exceptId &&
      normalizeName(category.name).toLocaleLowerCase("nl") ===
        cleaned.toLocaleLowerCase("nl"),
  );
  return duplicate ? "Deze categorie bestaat al." : null;
}

export function addSupplementCategory(categories, name, options = {}) {
  const error = validateCategoryName(name, categories);
  if (error) return { categories, error };
  const cleaned = normalizeName(name);
  const category = {
    id:
      options.id ||
      `supp-category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleaned,
    createdAt: options.createdAt || new Date().toISOString(),
  };
  return {
    error: null,
    category,
    categories: [...categories, category],
  };
}

export function renameSupplementCategory(categories, id, name) {
  const error = validateCategoryName(name, categories, id);
  if (error) return { categories, error };
  return {
    error: null,
    categories: categories.map((category) =>
      category.id === id ? { ...category, name: normalizeName(name) } : category,
    ),
  };
}

export function removeSupplementCategory(categories, supplements, id) {
  return {
    categories: categories.filter((category) => category.id !== id),
    supplements: supplements.map((supplement) => ({
      ...supplement,
      product: {
        ...supplement.product,
        categoryIds: (supplement.product.categoryIds || []).filter(
          (categoryId) => categoryId !== id,
        ),
      },
    })),
  };
}

export function countCategoryLinks(supplements, id) {
  return supplements.filter((supplement) =>
    (supplement.product.categoryIds || []).includes(id),
  ).length;
}
