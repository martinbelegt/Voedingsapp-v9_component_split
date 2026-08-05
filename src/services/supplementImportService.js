import { createSupplement, sanitizeSupplement, validateSupplement } from "../data/supplements";

const SAFE_IMAGE_URL = /^https?:\/\//i;

function hasSafeExternalImage(image) {
  if (!image || typeof image !== "object") return false;
  const src = String(image.src || image.url || "").trim();
  return !!src && SAFE_IMAGE_URL.test(src) && (image.storage === "url" || !image.storage);
}

export function parseSupplementImportJson(text) {
  try {
    return JSON.parse(String(text || ""));
  } catch (error) {
    throw new Error("Ongeldige JSON. Kies een geldig supplementbestand.");
  }
}

export function assertSingleSupplementObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Het bestand moet precies één supplementobject bevatten.");
  }
  return value;
}

export function getSafeSupplementImages(images) {
  return Array.isArray(images) ? images.filter(hasSafeExternalImage) : [];
}

export function normalizeSupplementImport(rawSupplement, categories = []) {
  const rawProduct = rawSupplement?.product || {};
  const product = {
    name: "",
    brand: "",
    productName: "",
    categoryId: "",
    categoryIds: [],
    alternativeName: "",
    form: "",
    amountPerUnit: "",
    unit: "mg",
    unitsPerPackage: "",
    price: "",
    orderUrl: "",
    ingredients: [],
    description: "",
    barcode: "",
    imageUrl: "",
    images: [],
    ...rawProduct,
  };

  const sanitized = sanitizeSupplement({
    ...rawSupplement,
    product: {
      ...product,
      images: getSafeSupplementImages(product.images),
      categoryIds: product.categoryIds.length
        ? product.categoryIds
        : product.categoryId
          ? [product.categoryId]
          : [],
    },
  });

  const availableCategoryIds = Array.isArray(categories)
    ? categories.map((category) => category.id)
    : [];

  const categoryIds = Array.isArray(sanitized.product.categoryIds)
    ? sanitized.product.categoryIds.filter((id) => availableCategoryIds.includes(id))
    : [];

  const unknownCategoryIds = Array.isArray(sanitized.product.categoryIds)
    ? [...new Set(sanitized.product.categoryIds.filter((id) => !availableCategoryIds.includes(id)))]
    : [];

  const finalCategoryIds = categoryIds.length ? categoryIds : ["other"];
  const candidate = sanitizeSupplement({
    ...sanitized,
    product: {
      ...sanitized.product,
      categoryIds: finalCategoryIds,
    },
  });

  return {
    candidate,
    unknownCategoryIds,
    safeCategoryIds: finalCategoryIds,
  };
}

function normalizeString(value) {
  return String(value || "").trim().toLocaleLowerCase("nl");
}

export function findSupplementDuplicate(candidate, existingItems = []) {
  const normalizedBrand = normalizeString(candidate.product.brand);
  const normalizedProductName = normalizeString(candidate.product.productName);
  const normalizedName = normalizeString(candidate.product.name);

  const byId = candidate.id && existingItems.find((item) => item.id === candidate.id);
  if (byId) {
    return { type: "id", item: byId };
  }

  if (normalizedBrand && normalizedProductName) {
    const byBrandProduct = existingItems.find((item) =>
      normalizeString(item.product.brand) === normalizedBrand &&
      normalizeString(item.product.productName) === normalizedProductName,
    );
    if (byBrandProduct) {
      return { type: "brandProduct", item: byBrandProduct };
    }
  }

  if (!normalizedBrand && !normalizedProductName && normalizedName) {
    const byName = existingItems.find((item) => normalizeString(item.product.name) === normalizedName);
    if (byName) {
      return { type: "name", item: byName };
    }
  }

  return null;
}

export function buildSupplementImportResult(rawSupplement, categories = [], existingItems = []) {
  const { candidate, unknownCategoryIds } = normalizeSupplementImport(rawSupplement, categories);
  const validation = validateSupplement(candidate);
  const duplicate = findSupplementDuplicate(candidate, existingItems);
  const hasImageMetadata = Array.isArray(candidate.product.images) && candidate.product.images.length > 0;
  return {
    candidate,
    validation,
    duplicate,
    unknownCategoryIds,
    hasImageMetadata,
  };
}

export function createNewSupplementVariant(importResult) {
  if (!importResult || !importResult.candidate) return null;
  return sanitizeSupplement({ ...importResult.candidate, id: "" });
}

export function appendSupplementToCatalog(catalog, supplement) {
  if (!catalog || typeof catalog !== "object") {
    throw new Error("Ongeldige catalogus.");
  }

  return {
    ...catalog,
    items: [supplement, ...(Array.isArray(catalog.items) ? catalog.items : [])],
  };
}
