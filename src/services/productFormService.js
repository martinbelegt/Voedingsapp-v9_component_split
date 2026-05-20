import { defaultNewProduct } from "../data/productDefaults";

export function createNewProductForm(categories) {
  return {
    ...defaultNewProduct,
    categoryId: categories?.[0]?.id || "cat-overig",
  };
}

export function createProductEditForm(product) {
  return {
    name: product.name,
    categoryId: product.categoryId,
    portion: product.portion,
    portionGram: String(product.portionGram),
    inputMode: "per100",
    khInput: String(product.kh100),
    proteinInput: String(product.protein100),
    fatInput: String(product.fat100),
    kcalInput: String(product.kcal100),
    giClass: product.giClass || "unknown",
    giValue: String(product.giValue ?? ""),
    timingTag: product.timingTag || "meal",
    giNotes: product.giNotes || "",
    giSourceUrl: product.giSourceUrl || "",
    giSourceNotes: product.giSourceNotes || "",
    personalTimingTag: product.personalTimingTag || product.timingTag || "meal",
    personalTimingNotes: product.personalTimingNotes || "",
    absorptionProfile: product.absorptionProfile || "steady",
    favorite: !!product.favorite,
    packName: product.packName || "Martin",
    mealMoment: product.mealMoment || "neutral",
    // Bron/herkomst van ingevoerde voedingsgegevens
    sourceName: product.sourceName || "",
    sourceUrl: product.sourceUrl || "",
    sourceNotes: product.sourceNotes || "",
  };
}
