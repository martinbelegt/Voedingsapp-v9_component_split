import {
  createIngredient,
  createSupplement,
  migrateSupplements,
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
});
