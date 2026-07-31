import { createSupplement } from "../data/supplements";
import {
  addSupplementCategory,
  removeSupplementCategory,
  renameSupplementCategory,
} from "./supplementCategoryService";

describe("supplementcategorieën", () => {
  const categories = [{ id: "a", name: "Antioxidanten", createdAt: "2026-01-01" }];

  test("voegt een getrimde categorie toe en weigert leeg of dubbel", () => {
    const added = addSupplementCategory(categories, "  Zenuwstelsel  ", {
      id: "b",
      createdAt: "2026-01-02",
    });
    expect(added.category).toEqual({
      id: "b",
      name: "Zenuwstelsel",
      createdAt: "2026-01-02",
    });
    expect(addSupplementCategory(categories, "   ").error).toMatch(/verplicht/i);
    expect(addSupplementCategory(categories, "antioxidanten").error).toMatch(/bestaat al/i);
  });

  test("hernoemt stabiel en verwijdert alleen koppelingen", () => {
    const renamed = renameSupplementCategory(categories, "a", "Vrije radicalen");
    expect(renamed.categories[0]).toMatchObject({ id: "a", name: "Vrije radicalen" });

    const supplement = createSupplement({
      id: "s1",
      product: { name: "ALA", categoryIds: ["a", "b"] },
    });
    const removed = removeSupplementCategory(categories, [supplement], "a");
    expect(removed.categories).toEqual([]);
    expect(removed.supplements[0].product.categoryIds).toEqual(["b"]);
    expect(removed.supplements[0].id).toBe("s1");
  });
});
