import React, { useEffect, useState } from "react";
import {
  createStoredSupplementImage,
  deleteSupplementImageBlob,
  moveSupplementImage,
  removeSupplementImageMetadata,
  resolveSupplementImageUrl,
  setPrimarySupplementImage,
  SUPPLEMENT_IMAGE_MAX_FILES,
  validateSupplementImageFile,
} from "../../services/supplementImageService";

export function SupplementImage({ image, alt = "" }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    let objectUrl = null;
    resolveSupplementImageUrl(image).then((nextUrl) => {
      if (!active) {
        if (nextUrl?.startsWith("blob:")) URL.revokeObjectURL(nextUrl);
        return;
      }
      objectUrl = nextUrl;
      setUrl(nextUrl);
    }).catch(() => setUrl(null));
    return () => {
      active = false;
      if (objectUrl?.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
    };
  }, [image]);
  return url ? <img src={url} alt={alt} /> : <span className="supplement-image__empty">Geen voorbeeld</span>;
}

export default function SupplementImageManager({ images = [], onChange }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event) {
    const files = [...event.target.files];
    event.target.value = "";
    if (images.length + files.length > SUPPLEMENT_IMAGE_MAX_FILES) {
      setError(`Gebruik maximaal ${SUPPLEMENT_IMAGE_MAX_FILES} afbeeldingen.`);
      return;
    }
    const invalid = files.map(validateSupplementImageFile).find(Boolean);
    if (invalid) return setError(invalid);
    setBusy(true);
    try {
      const added = [];
      for (const file of files) added.push(await createStoredSupplementImage(file));
      const next = [...images, ...added];
      onChange(next.some((image) => image.isPrimary) ? next : setPrimarySupplementImage(next, next[0]?.id));
      setError("");
    } catch (uploadError) {
      setError(uploadError.message || "Uploaden is niet gelukt.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(image) {
    if (image.storage === "indexeddb") await deleteSupplementImageBlob(image.storageKey);
    onChange(removeSupplementImageMetadata(images, image.id));
  }

  return (
    <div className="supplement-images">
      <label className="supplement-images__upload">
        {busy ? "Verwerken…" : "+ Afbeeldingen toevoegen"}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={upload} />
      </label>
      <small>JPG, PNG of WebP · maximaal {SUPPLEMENT_IMAGE_MAX_FILES}</small>
      {error && <p className="supplement-field__error">{error}</p>}
      <div className="supplement-images__grid">
        {images.map((image, index) => (
          <article key={image.id} className={image.isPrimary ? "is-primary" : ""}>
            <div className="supplement-images__preview"><SupplementImage image={image} alt={image.caption || image.name} /></div>
            <input
              value={image.caption || ""}
              onChange={(event) => onChange(images.map((item) => item.id === image.id ? { ...item, caption: event.target.value } : item))}
              placeholder="Bijschrift"
              aria-label={`Bijschrift ${index + 1}`}
            />
            <div>
              <button type="button" disabled={index === 0} onClick={() => onChange(moveSupplementImage(images, image.id, -1))}>←</button>
              <button type="button" disabled={index === images.length - 1} onClick={() => onChange(moveSupplementImage(images, image.id, 1))}>→</button>
              <button type="button" disabled={image.isPrimary} onClick={() => onChange(setPrimarySupplementImage(images, image.id))}>Hoofd</button>
              <button type="button" className="is-danger" onClick={() => remove(image)}>Verwijder</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
