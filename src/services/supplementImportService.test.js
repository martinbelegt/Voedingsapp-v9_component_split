import {
  createSupplement,
  DEFAULT_SUPPLEMENT_CATEGORIES,
} from "../data/supplements";
import {
  parseSupplementImportJson,
  assertSingleSupplementObject,
  normalizeSupplementImport,
  findSupplementDuplicate,
  buildSupplementImportResult,
  createNewSupplementVariant,
  appendSupplementToCatalog,
} from "./supplementImportService";

describe("supplementImportService", () => {
  test("parseert geldige JSON", () => {
    expect(parseSupplementImportJson('{"product": {"name": "Zink"}}')).toEqual({ product: { name: "Zink" } });
  });

  test("faalt op ongeldige JSON", () => {
    expect(() => parseSupplementImportJson("{naam: zink}")).toThrow("Ongeldige JSON. Kies een geldig supplementbestand.");
  });

  test("faalt wanneer JSON geen enkel supplementobject bevat", () => {
    expect(() => assertSingleSupplementObject([{ id: "a" }])).toThrow("Het bestand moet precies één supplementobject bevatten.");
    expect(() => assertSingleSupplementObject(null)).toThrow("Het bestand moet precies één supplementobject bevatten.");
  });

  test("valideert ontbrekende naam en vorm", () => {
    const raw = { product: { brand: "Merk", productName: "Zink Picolinaat" } };
    const { candidate, validation } = buildSupplementImportResult(raw, DEFAULT_SUPPLEMENT_CATEGORIES, []);
    expect(validation.valid).toBe(false);
    expect(validation.errors.name).toBe("Naam is verplicht.");
    expect(validation.errors.form).toBe("Vorm is verplicht.");
    expect(candidate.id).toMatch(/^supp-/);
  });

  test("detecteert duplicaat op id", () => {
    const existing = [createSupplement({ id: "supp-1", product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } })];
    const raw = { id: "supp-1", product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } };
    const { candidate, duplicate } = buildSupplementImportResult(raw, DEFAULT_SUPPLEMENT_CATEGORIES, existing);
    expect(duplicate).toEqual(expect.objectContaining({ type: "id" }));
    expect(candidate.id).toBe("supp-1");
  });

  test("detecteert duplicaat op merk en productnaam", () => {
    const existing = [createSupplement({ id: "supp-2", product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } })];
    const raw = { product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } };
    const { candidate, duplicate } = buildSupplementImportResult(raw, DEFAULT_SUPPLEMENT_CATEGORIES, existing);
    expect(duplicate).toEqual(expect.objectContaining({ type: "brandProduct" }));
    expect(candidate.id).toMatch(/^supp-/);
  });

  test("importeert nieuwe imports standaard als niet actief als er geen status is opgegeven", () => {
    const raw = { product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } };
    const { candidate } = buildSupplementImportResult(raw, DEFAULT_SUPPLEMENT_CATEGORIES, []);
    expect(candidate.personal.status).toBe("inactive");
  });

  test("importeert als nieuw supplement met nieuw id", () => {
    const existing = [createSupplement({ id: "supp-3", product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } })];
    const raw = { id: "supp-3", product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet" } };
    const importResult = buildSupplementImportResult(raw, DEFAULT_SUPPLEMENT_CATEGORIES, existing);
    const newSupplement = createNewSupplementVariant(importResult);
    expect(newSupplement.id).not.toBe("supp-3");
    expect(newSupplement.product.name).toBe("Zink");
    expect(newSupplement.product.brand).toBe("OstroVit");
  });

  test("filtert onbekende categorieën en gebruikt other wanneer geen geldige categorie overblijft", () => {
    const raw = { product: { name: "Zink", brand: "OstroVit", productName: "Zinc Picolinate", form: "tablet", categoryIds: ["unknown", "other"] } };
    const { candidate, unknownCategoryIds } = normalizeSupplementImport(raw, DEFAULT_SUPPLEMENT_CATEGORIES);
    expect(candidate.product.categoryIds).toEqual(["other"]);
    expect(unknownCategoryIds).toEqual(["unknown"]);
  });

  test("slaat supplement op via de catalogus-bijvoegfunctie", () => {
    const catalog = { categories: DEFAULT_SUPPLEMENT_CATEGORIES, items: [] };
    const supplement = createSupplement({ product: { name: "Zink", form: "tablet", categoryId: "other" } });
    const nextCatalog = appendSupplementToCatalog(catalog, supplement);
    expect(nextCatalog.items[0]).toBe(supplement);
    expect(nextCatalog.items).toHaveLength(1);
  });

  test("annuleert import zonder wijziging", () => {
    const catalog = { categories: DEFAULT_SUPPLEMENT_CATEGORIES, items: [] };
    expect(catalog.items).toHaveLength(0);
  });
});
