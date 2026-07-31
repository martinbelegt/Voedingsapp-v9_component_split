import {
  createIngredient,
  createSupplement,
  migrateSupplements,
  migrateSupplementCatalog,
  sanitizeSupplement,
  STARTER_SUPPLEMENTS,
  supplementMatchesQuery,
  validateSupplement,
} from "./supplements";

describe("supplement model", () => {
  test("validates required fields and negative values", () => {
    const invalid = createSupplement({
      product: {
        amountPerUnit: -1,
        ingredients: [createIngredient({ name: "Magnesium", amount: -2 })],
      },
      personal: { dosage: -1 },
    });
    const result = validateSupplement(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      name: expect.any(String),
      form: expect.any(String),
      amountPerUnit: expect.any(String),
      dosage: expect.any(String),
      "ingredient-0-amount": expect.any(String),
    });
  });

  test("searches nested active ingredients", () => {
    const supplement = createSupplement({
      product: {
        name: "Sportproduct",
        ingredients: [
          createIngredient({ name: "Creatine", form: "Creatinemonohydraat" }),
        ],
      },
    });
    expect(supplementMatchesQuery(supplement, "creatine")).toBe(true);
    expect(supplementMatchesQuery(supplement, "magnesium")).toBe(false);
  });

  test("migration adds starter data without duplicates", () => {
    const first = migrateSupplements(STARTER_SUPPLEMENTS);
    const second = migrateSupplements(first);
    const ids = second.map((item) => item.id);

    expect(second).toHaveLength(STARTER_SUPPLEMENTS.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("migreert enkelvoudige en benoemde categorieën idempotent", () => {
    const legacy = [{
      id: "legacy",
      name: "R-alfaliponzuur",
      category: "Glucoseondersteuning",
      form: "capsule",
    }];
    const first = migrateSupplementCatalog({ items: legacy });
    const second = migrateSupplementCatalog(first);
    const migrated = second.items.find((item) => item.id === "legacy");

    expect(migrated.product.categoryIds).toHaveLength(1);
    expect(new Set(migrated.product.categoryIds).size).toBe(1);
    expect(second.categories.filter((category) => category.name === "Glucoseondersteuning")).toHaveLength(1);
  });

  test("bewaart meerdere unieke categoriekoppelingen", () => {
    const sanitized = sanitizeSupplement(createSupplement({
      product: {
        name: "Combinatie",
        form: "capsule",
        categoryIds: ["vitamins", "minerals", "vitamins"],
      },
    }));
    expect(sanitized.product.categoryIds).toEqual(["vitamins", "minerals"]);
  });
});
