export const SUPPLEMENT_STORAGE_KEY = "companion_supplements_v2";
export const SUPPLEMENT_DATA_VERSION = 3;

export const SUPPLEMENT_CATEGORIES = [
  { id: "vitamins", label: "Vitaminen" },
  { id: "minerals", label: "Mineralen" },
  { id: "fatty-acids", label: "Vetzuren" },
  { id: "amino-acids", label: "Aminozuren" },
  { id: "sport-performance", label: "Sport en prestaties" },
  { id: "energy-metabolism", label: "Energie en stofwisseling" },
  { id: "digestion", label: "Spijsvertering" },
  { id: "sleep-relaxation", label: "Slaap en ontspanning" },
  { id: "combination", label: "Combinatieproducten" },
  { id: "other", label: "Overig" },
];

export const DEFAULT_SUPPLEMENT_CATEGORIES = SUPPLEMENT_CATEGORIES.map(
  (category) => ({
    id: category.id,
    name: category.label,
    createdAt: "2026-01-01T00:00:00.000Z",
  }),
);

export const SUPPLEMENT_FORMS = [
  "capsule",
  "tablet",
  "softgel",
  "poeder",
  "vloeistof",
  "anders",
];

export const SUPPLEMENT_UNITS = ["mg", "g", "µg", "mcg", "ml", "IE", "IU", "anders"];

export function getSupplementCategoryLabel(
  categoryId,
  categories = DEFAULT_SUPPLEMENT_CATEGORIES,
) {
  return (
    categories.find((category) => category.id === categoryId)?.name ||
    SUPPLEMENT_CATEGORIES.find((category) => category.id === categoryId)
      ?.label ||
    "Overig"
  );
}

export function createIngredient(overrides = {}) {
  return { name: "", form: "", amount: "", unit: "mg", ...overrides };
}

export function parseSupplementPrice(value) {
  const normalized = String(value ?? "").trim().replace(/\s/g, "").replace("€", "").replace(",", ".");
  if (!normalized) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : NaN;
}

export function formatSupplementPrice(value) {
  const amount = parseSupplementPrice(value);
  return amount === null || Number.isNaN(amount) ? "" : amount.toFixed(2).replace(".", ",");
}

export function createSupplement(overrides = {}) {
  const now = new Date().toISOString();
  const base = {
    id: "",
    source: { type: "personal", owner: "me" },
    product: {
      name: "",
      brand: "",
      productName: "",
      categoryId: "other",
      categoryIds: ["other"],
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
    },
    personal: {
      status: "active",
      dosage: "",
      dosageUnit: "",
      usageMoment: "",
      purpose: "",
      notes: "",
    },
    meta: { createdAt: now, updatedAt: now },
  };

  const productOverrides = overrides.product || {};
  const product = { ...base.product, ...productOverrides };
  if (
    Object.prototype.hasOwnProperty.call(productOverrides, "categoryId") &&
    !Object.prototype.hasOwnProperty.call(productOverrides, "categoryIds")
  ) {
    product.categoryIds = productOverrides.categoryId
      ? [productOverrides.categoryId]
      : [];
  }

  return {
    ...base,
    ...overrides,
    source: { ...base.source, ...(overrides.source || {}) },
    product,
    personal: { ...base.personal, ...(overrides.personal || {}) },
    meta: { ...base.meta, ...(overrides.meta || {}) },
  };
}

export function validateSupplement(supplement) {
  const errors = {};
  const product = supplement?.product || {};

  if (!product.name?.trim()) errors.name = "Naam is verplicht.";
  if (!product.form) errors.form = "Vorm is verplicht.";

  [
    ["amountPerUnit", product.amountPerUnit],
    ["unitsPerPackage", product.unitsPerPackage],
    ["price", parseSupplementPrice(product.price)],
    ["dosage", supplement?.personal?.dosage],
  ].forEach(([key, value]) => {
    if (value !== "" && value !== null && (Number.isNaN(Number(value)) || Number(value) < 0)) {
      errors[key] = "Waarde mag niet negatief zijn.";
    }
  });

  (product.ingredients || []).forEach((ingredient, index) => {
    if (ingredient.amount !== "" && Number(ingredient.amount) < 0) {
      errors[`ingredient-${index}-amount`] = "Waarde mag niet negatief zijn.";
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

export function sanitizeSupplement(supplement) {
  const now = new Date().toISOString();
  return createSupplement({
    ...supplement,
    id: supplement.id || `supp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    product: {
      ...supplement.product,
      name: supplement.product.name.trim(),
      price: formatSupplementPrice(supplement.product.price),
      categoryIds: [
        ...new Set(
          (supplement.product.categoryIds || [])
            .map(String)
            .filter(Boolean),
        ),
      ],
      images: Array.isArray(supplement.product.images)
        ? supplement.product.images
        : [],
      ingredients: (supplement.product.ingredients || []).filter(
        (ingredient) =>
          ingredient.name?.trim() ||
          ingredient.form?.trim() ||
          ingredient.amount !== "",
      ),
    },
    meta: {
      createdAt: supplement.meta?.createdAt || now,
      updatedAt: now,
    },
  });
}

export function supplementMatchesQuery(supplement, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("nl");
  if (!normalizedQuery) return true;
  const product = supplement.product || {};
  const values = [
    product.name,
    product.brand,
    product.productName,
    product.alternativeName,
    ...(product.ingredients || []).map((ingredient) => ingredient.name),
  ];
  return values.some((value) =>
    String(value || "").toLocaleLowerCase("nl").includes(normalizedQuery),
  );
}

function migrateLegacySupplement(item, categories = DEFAULT_SUPPLEMENT_CATEGORIES) {
  if (item?.product && item?.personal) {
    const existingIds = Array.isArray(item.product.categoryIds)
      ? item.product.categoryIds
      : [];
    const legacyId = item.product.categoryId;
    return createSupplement({
      ...item,
      product: {
        ...item.product,
        categoryIds: [...new Set([...existingIds, legacyId].filter(Boolean))],
        images: Array.isArray(item.product.images)
          ? item.product.images
          : item.product.imageUrl
            ? [
                {
                  id: `legacy-image-${item.id || "supplement"}`,
                  src: item.product.imageUrl,
                  name: "Bestaande afbeelding",
                  caption: "",
                  createdAt: item.meta?.createdAt || new Date().toISOString(),
                  isPrimary: true,
                  storage: "url",
                },
              ]
            : [],
      },
    });
  }
  const categoryMap = { performance: "sport-performance" };
  const categoryId = categoryMap[item.categoryId] || item.categoryId || "other";
  return createSupplement({
    id: item.id,
    product: {
      name: item.name || "",
      categoryId,
      categoryIds: categories.some((category) => category.id === categoryId)
        ? [categoryId]
        : [],
      form: String(item.form || "").toLocaleLowerCase("nl"),
      ingredients: item.activeIngredient
        ? [createIngredient({ name: item.activeIngredient })]
        : [],
      description: item.description || "",
      imageUrl: item.imageUrl || "",
    },
    personal: {
      dosage: item.dosage === "Nog in te vullen" ? "" : item.dosage || "",
      usageMoment: item.usage === "Nog in te vullen" ? "" : item.usage || "",
      notes: item.personalNotes || "",
    },
  });
}

export function migrateSupplements(
  items,
  categories = DEFAULT_SUPPLEMENT_CATEGORIES,
  { includeStarters = true } = {},
) {
  const migrated = Array.isArray(items)
    ? items.map((item) => migrateLegacySupplement(item, categories))
    : [];
  const unique = [];
  const seen = new Set();
  [...migrated, ...(includeStarters ? STARTER_SUPPLEMENTS : [])].forEach((item) => {
    const identity = item.id || item.product.name.trim().toLocaleLowerCase("nl");
    if (!identity || seen.has(identity)) return;
    seen.add(identity);
    unique.push(item);
  });
  return unique;
}

export function migrateSupplementCatalog(raw) {
  const sourceItems = Array.isArray(raw) ? raw : raw?.items;
  const hasStoredItems = Array.isArray(sourceItems);
  const sourceCategories = Array.isArray(raw?.categories)
    ? raw.categories
    : DEFAULT_SUPPLEMENT_CATEGORIES;
  const categories = [];
  const seenNames = new Set();
  const seenIds = new Set();
  const inferredCategories = (sourceItems || [])
    .map((item) => item?.product?.category || item?.category)
    .filter(Boolean)
    .map((name) => ({
      id: `supp-category-${String(name)
        .trim()
        .toLocaleLowerCase("nl")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
      name: String(name).trim(),
    }));

  [...DEFAULT_SUPPLEMENT_CATEGORIES, ...sourceCategories, ...inferredCategories].forEach((category) => {
    const name = String(category?.name || category?.label || "").trim();
    const normalized = name.toLocaleLowerCase("nl");
    if (!name || seenNames.has(normalized)) return;
    seenNames.add(normalized);
    const fallbackId = `supp-category-${normalized.replace(/[^a-z0-9]+/g, "-")}`;
    const requestedId = String(category?.id || "").trim() || fallbackId;
    const id = seenIds.has(requestedId) ? `${requestedId}-${normalized.replace(/[^a-z0-9]+/g, "-")}` : requestedId;
    seenIds.add(id);
    categories.push({
      id,
      name,
      createdAt: category?.createdAt || new Date().toISOString(),
    });
  });

  const itemsWithResolvedCategoryNames = (sourceItems || []).map((item) => {
    const legacyName = item?.product?.category || item?.category;
    if (!legacyName) return item;
    const categoryId = categories.find(
      (category) =>
        category.name.toLocaleLowerCase("nl") ===
        String(legacyName).trim().toLocaleLowerCase("nl"),
    )?.id;
    return item?.product
      ? { ...item, product: { ...item.product, categoryId } }
      : { ...item, categoryId };
  });

  const items = migrateSupplements(
    itemsWithResolvedCategoryNames,
    categories,
    { includeStarters: !hasStoredItems },
  ).map((item) =>
    createSupplement({
      ...item,
      product: {
        ...item.product,
        categoryIds: (item.product.categoryIds || []).filter((id) =>
          categories.some((category) => category.id === id),
        ),
      },
    }),
  );
  return { categories, items };
}

export const STARTER_SUPPLEMENTS = [
  createSupplement({
    id: "supp-vitamin-d3",
    product: {
      name: "Vitamine D3",
      categoryId: "vitamins",
      form: "softgel",
      ingredients: [
        createIngredient({ name: "Cholecalciferol", unit: "µg" }),
      ],
      description: "Korte beschrijving volgt.",
    },
    personal: { notes: "Ruimte voor persoonlijke notities." },
  }),
  createSupplement({
    id: "supp-magnesium",
    product: {
      name: "Magnesium",
      categoryId: "minerals",
      form: "capsule",
      ingredients: [
        createIngredient({ name: "Magnesium", form: "Magnesiumbisglycinaat" }),
      ],
    },
  }),
  createSupplement({
    id: "supp-omega-3",
    product: {
      name: "Omega 3",
      categoryId: "fatty-acids",
      form: "softgel",
      ingredients: [
        createIngredient({ name: "EPA" }),
        createIngredient({ name: "DHA" }),
      ],
    },
  }),
  createSupplement({
    id: "supp-creatine",
    product: {
      name: "Creatine",
      categoryId: "sport-performance",
      form: "poeder",
      ingredients: [
        createIngredient({
          name: "Creatine",
          form: "Creatinemonohydraat",
          unit: "g",
        }),
      ],
    },
  }),
  createSupplement({
    id: "supp-multivitamin",
    product: {
      name: "Multivitamine",
      categoryId: "combination",
      form: "tablet",
    },
  }),
];
