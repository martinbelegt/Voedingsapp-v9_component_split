export const SUPPLEMENT_STORAGE_KEY = "companion_supplements_v2";
export const SUPPLEMENT_DATA_VERSION = 2;

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

export const SUPPLEMENT_FORMS = [
  "capsule",
  "tablet",
  "softgel",
  "poeder",
  "vloeistof",
  "anders",
];

export const SUPPLEMENT_UNITS = ["mg", "g", "µg", "ml", "IE", "anders"];

export function getSupplementCategoryLabel(categoryId) {
  return (
    SUPPLEMENT_CATEGORIES.find((category) => category.id === categoryId)
      ?.label || "Overig"
  );
}

export function createIngredient(overrides = {}) {
  return { name: "", form: "", amount: "", unit: "mg", ...overrides };
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
      alternativeName: "",
      form: "",
      amountPerUnit: "",
      unit: "mg",
      unitsPerPackage: "",
      ingredients: [],
      description: "",
      barcode: "",
      imageUrl: "",
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

  return {
    ...base,
    ...overrides,
    source: { ...base.source, ...(overrides.source || {}) },
    product: { ...base.product, ...(overrides.product || {}) },
    personal: { ...base.personal, ...(overrides.personal || {}) },
    meta: { ...base.meta, ...(overrides.meta || {}) },
  };
}

export function validateSupplement(supplement) {
  const errors = {};
  const product = supplement?.product || {};

  if (!product.name?.trim()) errors.name = "Naam is verplicht.";
  if (!product.categoryId) errors.categoryId = "Categorie is verplicht.";
  if (!product.form) errors.form = "Vorm is verplicht.";

  [
    ["amountPerUnit", product.amountPerUnit],
    ["unitsPerPackage", product.unitsPerPackage],
    ["dosage", supplement?.personal?.dosage],
  ].forEach(([key, value]) => {
    if (value !== "" && Number(value) < 0) {
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

function migrateLegacySupplement(item) {
  if (item?.product && item?.personal) return createSupplement(item);
  const categoryMap = { performance: "sport-performance" };
  return createSupplement({
    id: item.id,
    product: {
      name: item.name || "",
      categoryId: categoryMap[item.categoryId] || item.categoryId || "other",
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

export function migrateSupplements(items) {
  const migrated = Array.isArray(items) ? items.map(migrateLegacySupplement) : [];
  const unique = [];
  const seen = new Set();
  [...migrated, ...STARTER_SUPPLEMENTS].forEach((item) => {
    const identity = item.id || item.product.name.trim().toLocaleLowerCase("nl");
    if (!identity || seen.has(identity)) return;
    seen.add(identity);
    unique.push(item);
  });
  return unique;
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
