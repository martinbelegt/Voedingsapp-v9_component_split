import {
  createStoredSupplementImage,
  getPrimarySupplementImage,
  moveSupplementImage,
  removeSupplementImageMetadata,
  setPrimarySupplementImage,
  validateSupplementImageFile,
} from "./supplementImageService";

test("weigert een niet-ondersteund afbeeldingsbestand", () => {
  expect(validateSupplementImageFile({ type: "image/gif", size: 10 })).toMatch(/JPG/i);
});

test("bewaart meerdere metadata-items en beheert hoofdafbeelding en volgorde", async () => {
  const stored = [];
  const make = (name, id) =>
    createStoredSupplementImage(
      { name, type: "image/png", size: 100 },
      {
        id,
        createdAt: "2026-07-31T10:00:00.000Z",
        optimize: async () => new Blob(["image"], { type: "image/webp" }),
        saveBlob: async (key) => stored.push(key),
      },
    );
  const images = [await make("voor.png", "front"), await make("achter.png", "back")];

  const primary = setPrimarySupplementImage(images, "back");
  expect(getPrimarySupplementImage(primary).id).toBe("back");
  expect(moveSupplementImage(primary, "back", -1).map((image) => image.id)).toEqual(["back", "front"]);
  expect(removeSupplementImageMetadata(primary, "back")).toMatchObject([
    { id: "front", isPrimary: true },
  ]);
  expect(stored).toEqual([
    "supplement-images/front.webp",
    "supplement-images/back.webp",
  ]);
});
