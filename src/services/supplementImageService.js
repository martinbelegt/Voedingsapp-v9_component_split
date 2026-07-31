export const SUPPLEMENT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const SUPPLEMENT_IMAGE_MAX_FILES = 8;
export const SUPPLEMENT_IMAGE_MAX_SOURCE_BYTES = 12 * 1024 * 1024;
export const SUPPLEMENT_IMAGE_MAX_SIDE = 2400;
export const SUPPLEMENT_IMAGE_QUALITY = 0.86;

const DB_NAME = "companion-supplement-images";
const DB_VERSION = 1;
const STORE_NAME = "images";

export function validateSupplementImageFile(file) {
  if (!SUPPLEMENT_IMAGE_TYPES.includes(file?.type)) {
    return "Gebruik een JPG-, PNG- of WebP-afbeelding.";
  }
  if (file.size > SUPPLEMENT_IMAGE_MAX_SOURCE_BYTES) {
    return "De afbeelding is groter dan 12 MB.";
  }
  return null;
}

function openImageDatabase() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB is niet beschikbaar."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, action) {
  const db = await openImageDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function saveSupplementImageBlob(storageKey, blob) {
  return withStore("readwrite", (store) => store.put(blob, storageKey));
}

export function loadSupplementImageBlob(storageKey) {
  return withStore("readonly", (store) => store.get(storageKey));
}

export function deleteSupplementImageBlob(storageKey) {
  if (!storageKey) return Promise.resolve();
  return withStore("readwrite", (store) => store.delete(storageKey));
}

export async function optimizeSupplementImage(file) {
  const validationError = validateSupplementImageFile(file);
  if (validationError) throw new Error(validationError);

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(
    1,
    SUPPLEMENT_IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("De afbeelding kon niet worden verwerkt.")),
      "image/webp",
      SUPPLEMENT_IMAGE_QUALITY,
    );
  });
}

export async function createStoredSupplementImage(file, options = {}) {
  const blob = options.optimize
    ? await options.optimize(file)
    : await optimizeSupplementImage(file);
  const id =
    options.id ||
    `supp-image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const storageKey = `supplement-images/${id}.webp`;
  await (options.saveBlob || saveSupplementImageBlob)(storageKey, blob);
  return {
    id,
    storageKey,
    name: file.name,
    caption: "",
    createdAt: options.createdAt || new Date().toISOString(),
    isPrimary: false,
    storage: "indexeddb",
    mimeType: "image/webp",
    size: blob.size,
  };
}

export function setPrimarySupplementImage(images, id) {
  return images.map((image) => ({ ...image, isPrimary: image.id === id }));
}

export function moveSupplementImage(images, id, direction) {
  const index = images.findIndex((image) => image.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= images.length) return images;
  const next = [...images];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function removeSupplementImageMetadata(images, id) {
  const next = images.filter((image) => image.id !== id);
  if (next.length > 0 && !next.some((image) => image.isPrimary)) {
    next[0] = { ...next[0], isPrimary: true };
  }
  return next;
}

export function getPrimarySupplementImage(images = []) {
  return images.find((image) => image.isPrimary) || images[0] || null;
}

export async function resolveSupplementImageUrl(image) {
  if (!image) return null;
  if (image.src) return image.src;
  const blob = await loadSupplementImageBlob(image.storageKey);
  return blob ? URL.createObjectURL(blob) : null;
}
