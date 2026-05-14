export function getPackNameForNewProduct(activePackFilter) {
  return activePackFilter === "all" || activePackFilter === "__base__"
    ? "Martin"
    : activePackFilter;
}

export function createProductPayload({
  newProduct,
  portionGram,
  kh100,
  protein100,
  fat100,
  kcal100,
  giValue,
  activePackFilter,
  normalizeProduct,
}) {
  return normalizeProduct({
    categoryId: newProduct.categoryId || "cat-overig",
    name: newProduct.name.trim(),
    portion: newProduct.portion || "1 portie",
    portionGram,
    kh100,
    protein100,
    fat100,
    kcal100,
    giClass: newProduct.giClass || "unknown",
    giValue,
    timingTag: newProduct.timingTag || "meal",
    giNotes: newProduct.giNotes || "",
    personalTimingTag:
      newProduct.personalTimingTag || newProduct.timingTag || "meal",
    personalTimingNotes: newProduct.personalTimingNotes || "",
    absorptionProfile: newProduct.absorptionProfile || "steady",
    favorite: !!newProduct.favorite,
    packId: null,
    packName: getPackNameForNewProduct(activePackFilter),
    sourceType: "manual",
    mealMoment: newProduct.mealMoment || "neutral",
  });
}
const existing = products.find(
  (p) =>
    p.name.toLowerCase() === newProduct.name.trim().toLowerCase() &&
    p.categoryId === newProduct.categoryId,
);
export function findExistingProductMatch(products, newProduct) {
  const name = newProduct.name.trim().toLowerCase();

  return products.find(
    (p) =>
      p.name.toLowerCase() === name && p.categoryId === newProduct.categoryId,
  );
}
