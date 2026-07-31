import {
  createSupplement,
  SUPPLEMENT_STORAGE_KEY,
} from "../data/supplements";
import {
  loadSupplements,
  saveSupplements,
} from "./supplementStorageService";

beforeEach(() => localStorage.clear());

test("saves and reads supplements from versioned local storage", () => {
  const item = createSupplement({
    id: "personal-1",
    product: { name: "Eigen supplement", categoryId: "other", form: "capsule" },
  });

  expect(saveSupplements([item])).toBe(true);
  expect(loadSupplements().find((supplement) => supplement.id === item.id))
    .toMatchObject(item);
});

test("uses a safe fallback for invalid local storage data", () => {
  localStorage.setItem(SUPPLEMENT_STORAGE_KEY, "{invalid");
  const loaded = loadSupplements();

  expect(loaded.length).toBeGreaterThan(0);
  expect(loaded.some((item) => item.id === "supp-vitamin-d3")).toBe(true);
});
