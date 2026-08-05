import React from "react";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";

function formatCategoryList(categoryIds, categories = [], unknownCategoryIds) {
  const known = (categoryIds || [])
    .map((id) => categories.find((category) => category.id === id))
    .filter(Boolean)
    .map((category) => category.name || category.label)
    .filter(Boolean);
  const unknown = unknownCategoryIds || [];
  return [
    known.length ? `Geldige categorieën: ${known.join(", ")}` : null,
    unknown.length ? `Onbekende categorieën: ${unknown.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(". ");
}

export default function SupplementImportModal({
  open,
  onClose,
  importResult,
  categories = [],
  onConfirm,
  onImportAsNew,
}) {
  if (!open) return null;
  const { candidate, validation, duplicate, unknownCategoryIds, hasImageMetadata } = importResult || {};
  const product = candidate?.product || {};
  const categoryText = formatCategoryList(product.categoryIds, categories, unknownCategoryIds);

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title="Supplement importeren"
      subtitle="Controleer het supplement en bevestig voordat het wordt toegevoegd."
      footerStart={
        duplicate ? (
          <div style={{ color: "#92400e", fontSize: 13 }}>
            Dit supplement lijkt al te bestaan.
          </div>
        ) : null
      }
      footer={[
        <button key="cancel" type="button" onClick={onClose}>
          Annuleren
        </button>,
        duplicate ? (
          <button
            key="as-new"
            type="button"
            className="is-primary"
            onClick={onImportAsNew}
            disabled={!validation?.valid}
          >
            Als nieuw supplement importeren
          </button>
        ) : (
          <button
            key="confirm"
            type="button"
            className="is-primary"
            onClick={onConfirm}
            disabled={!validation?.valid}
          >
            Supplement importeren
          </button>
        ),
      ]}
    >
      {!candidate ? (
        <p>Geen supplementgegevens beschikbaar.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <strong>Naam</strong>
              <div>{product.name || "–"}</div>
            </div>
            <div>
              <strong>Merk</strong>
              <div>{product.brand || "–"}</div>
            </div>
            <div>
              <strong>Productnaam</strong>
              <div>{product.productName || "–"}</div>
            </div>
            <div>
              <strong>Vorm</strong>
              <div>{product.form || "–"}</div>
            </div>
            <div>
              <strong>Verpakkingseenheden</strong>
              <div>{product.unitsPerPackage || "–"}</div>
            </div>
            <div>
              <strong>Categorieën</strong>
              <div>{categoryText || (product.categoryIds || []).join(", ") || "–"}</div>
            </div>
            <div>
              <strong>Werkzame stoffen</strong>
              <div>
                {(Array.isArray(product.ingredients) && product.ingredients.length
                  ? product.ingredients.map((ingredient, index) => (
                    <div key={index}>
                      {ingredient.name || "(naam ontbreekt)"}
                      {ingredient.form ? ` – ${ingredient.form}` : ""}
                    </div>
                  ))
                  : "–")}
              </div>
            </div>
          </div>

          {hasImageMetadata && (
            <div style={{ padding: 12, border: "1px solid #d1d5db", borderRadius: 8, background: "#f8fafc" }}>
              <strong>Afbeeldingsmetadata:</strong> Alleen veilige externe URL-gegevens worden geaccepteerd. Lokale afbeeldingsbestanden worden niet geïmporteerd.
            </div>
          )}

          {validation && !validation.valid && (
            <div style={{ padding: 12, border: "1px solid #fecaca", borderRadius: 8, background: "#fff1f2" }}>
              <strong>Ongeldige supplementgegevens:</strong>
              <ul style={{ margin: 8, paddingLeft: 16 }}>
                {Object.entries(validation.errors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {unknownCategoryIds?.length > 0 && (
            <div style={{ color: "#92400e" }}>
              Onbekende categorieën worden genegeerd en niet aangemaakt: {unknownCategoryIds.join(", ")}.
            </div>
          )}
        </div>
      )}
    </CompanionModalShell>
  );
}
