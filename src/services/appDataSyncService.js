const MIGRATION_COUNTS = {
  products: 148,
  savedMeals: 11,
  categories: 12,
};

export function countFavoriteProducts(products) {
  return Array.isArray(products)
    ? products.filter((product) => !!product?.favorite).length
    : 0;
}

export function getAppDataCounts({ products, savedMeals, categories }) {
  return {
    products: Array.isArray(products) ? products.length : 0,
    favorites: countFavoriteProducts(products),
    savedMeals: Array.isArray(savedMeals) ? savedMeals.length : 0,
    categories: Array.isArray(categories) ? categories.length : 0,
  };
}

export function isMigrationProducts(products) {
  return (
    Array.isArray(products) &&
    products.length === MIGRATION_COUNTS.products
  );
}

export function isMigrationSavedMeals(savedMeals) {
  return (
    Array.isArray(savedMeals) &&
    savedMeals.length === MIGRATION_COUNTS.savedMeals
  );
}

export function isMigrationCategories(categories) {
  return (
    Array.isArray(categories) &&
    categories.length === MIGRATION_COUNTS.categories
  );
}

export function logAppDataState({ products, savedMeals, categories, source }) {
  const counts = getAppDataCounts({ products, savedMeals, categories });

  console.log("[APP_DATA]", {
    products: counts.products,
    favorites: counts.favorites,
    savedMeals: counts.savedMeals,
    categories: counts.categories,
    source,
  });
}
