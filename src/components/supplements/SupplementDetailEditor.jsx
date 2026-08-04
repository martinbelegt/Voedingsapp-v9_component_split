import React, { useState } from "react";
import {
  createIngredient,
  formatSupplementPrice,
  SUPPLEMENT_FORMS,
  SUPPLEMENT_UNITS,
} from "../../data/supplements";
import SupplementImageManager, {
  SupplementImage,
} from "./SupplementImageManager";
import { getPrimarySupplementImage } from "../../services/supplementImageService";
import SupplementTimelinePanel from "./SupplementTimelinePanel";

function Field({ label, error, wide, children }) {
  return (
    <label className={`supplement-field${wide ? " is-wide" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small className="supplement-field__error">{error}</small>}
    </label>
  );
}

function updatePath(draft, path, value) {
  const [group, key] = path;
  return { ...draft, [group]: { ...draft[group], [key]: value } };
}

function getSafeOrderUrl(value) {
  const input = String(value || "").trim();
  if (!input) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export default function SupplementDetailEditor({
  draft,
  errors,
  isNew,
  onChange,
  onSave,
  onCancel,
  onDelete,
  onOpenTimelinePanel,
  onTimelineSubmit,
  timelineDefaults,
  isDirty,
  categories,
}) {
  const product = draft.product;
  const personal = draft.personal;
  const [timelinePanelOpen, setTimelinePanelOpen] = useState(false);
  const set = (path) => (event) =>
    onChange(updatePath(draft, path, event.target.value));

  function updateIngredient(index, key, value) {
    const ingredients = product.ingredients.map((ingredient, itemIndex) =>
      itemIndex === index ? { ...ingredient, [key]: value } : ingredient,
    );
    onChange(updatePath(draft, ["product", "ingredients"], ingredients));
  }

  function removeIngredient(index) {
    onChange(
      updatePath(draft, [
        "product",
        "ingredients",
      ], product.ingredients.filter((_, itemIndex) => itemIndex !== index)),
    );
  }

  function toggleCategory(id) {
    const current = product.categoryIds || [];
    const categoryIds = current.includes(id)
      ? current.filter((categoryId) => categoryId !== id)
      : [...current, id];
    onChange(updatePath(draft, ["product", "categoryIds"], categoryIds));
  }

  const primaryImage = getPrimarySupplementImage(product.images);
  const orderUrl = getSafeOrderUrl(product.orderUrl);

  return (
    <form
      className="supplement-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <header className="supplement-editor__header">
        <div>
          <p className="companion-library__eyebrow">
            {isNew ? "Nieuw supplement" : "Supplement wijzigen"}
          </p>
          <h1>{product.name || "Naam nog invullen"}</h1>
          <span>Persoonlijke supplementenbibliotheek</span>
        </div>
        <div className="supplement-editor__image">
          {primaryImage ? (
            <SupplementImage image={primaryImage} alt={product.name} />
          ) : (
            <><b>＋</b><small>Afbeelding</small></>
          )}
        </div>
      </header>

      <div className="supplement-editor__actions" aria-label="Supplementacties">
        {!isNew && (
          <button className="is-danger" type="button" onClick={onDelete}>
            Verwijderen
          </button>
        )}
        <span />
        <button type="button" onClick={onCancel}>Annuleren</button>
        <button className="is-save" type="submit">Wijzigingen bewaren</button>
        {orderUrl && (
          <a className="supplement-editor__order" href={orderUrl} target="_blank" rel="noreferrer">
            Bestellen
          </a>
        )}
        <button className="is-primary" type="button" onClick={() => {
          if (onOpenTimelinePanel?.() !== false) setTimelinePanelOpen(true);
        }}>
          {isDirty ? "Wijzigingen bewaren en op tijdlijn zetten" : "Zet op tijdlijn"}
        </button>
      </div>

      {timelinePanelOpen && (
        <SupplementTimelinePanel
          initialEventTime={timelineDefaults.eventTime}
          initialValues={timelineDefaults.values}
          onCancel={() => {
            setTimelinePanelOpen(false);
          }}
          onSubmit={(values) => {
            onTimelineSubmit?.(values);
            setTimelinePanelOpen(false);
          }}
        />
      )}

      <section className="supplement-editor__section">
        <h2>Identiteit</h2>
        <div className="supplement-editor__grid">
          <Field label="Naam *" error={errors.name}>
            <input value={product.name} onChange={set(["product", "name"])} />
          </Field>
          <div className="supplement-field is-wide">
            <span>Categorieën</span>
            <div className="supplement-category-choices">
              {categories.map((category) => (
                <label key={category.id}>
                  <input
                    type="checkbox"
                    checked={(product.categoryIds || []).includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Merk">
            <input value={product.brand} onChange={set(["product", "brand"])} />
          </Field>
          <Field label="Productnaam">
            <input value={product.productName} onChange={set(["product", "productName"])} />
          </Field>
          <Field label="Alternatieve naam">
            <input value={product.alternativeName} onChange={set(["product", "alternativeName"])} />
          </Field>
          <Field label="Persoonlijke status">
            <select value={personal.status} onChange={set(["personal", "status"])}>
              <option value="active">Actief</option>
              <option value="inactive">Niet actief</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="supplement-editor__section">
        <h2>Productvorm</h2>
        <div className="supplement-editor__grid">
          <Field label="Vorm *" error={errors.form}>
            <select value={product.form} onChange={set(["product", "form"])}>
              <option value="">Kies een vorm</option>
              {SUPPLEMENT_FORMS.map((form) => <option key={form}>{form}</option>)}
            </select>
          </Field>
          <Field label="Hoeveelheid per eenheid" error={errors.amountPerUnit}>
            <input type="number" min="0" step="any" value={product.amountPerUnit} onChange={set(["product", "amountPerUnit"])} />
          </Field>
          <Field label="Eenheid">
            <select value={product.unit} onChange={set(["product", "unit"])}>
              {SUPPLEMENT_UNITS.map((unit) => <option key={unit}>{unit}</option>)}
            </select>
          </Field>
          <Field label="Eenheden per verpakking" error={errors.unitsPerPackage}>
            <input type="number" min="0" step="1" value={product.unitsPerPackage} onChange={set(["product", "unitsPerPackage"])} />
          </Field>
          <Field label="Prijs per verpakking" error={errors.price}>
            <span className="supplement-price-input"><b>€</b><input type="text" inputMode="decimal" value={product.price} onChange={set(["product", "price"])} onBlur={() => onChange(updatePath(draft, ["product", "price"], formatSupplementPrice(product.price)))} placeholder="0,00" /></span>
          </Field>
          <Field label="Besteladres">
            <input type="url" value={product.orderUrl} onChange={set(["product", "orderUrl"])} placeholder="https://webwinkel.nl/product" />
          </Field>
        </div>
      </section>

      <section className="supplement-editor__section">
        <div className="supplement-editor__section-title">
          <h2>Werkzame stoffen</h2>
          <button type="button" onClick={() => onChange(updatePath(draft, ["product", "ingredients"], [...product.ingredients, createIngredient()]))}>+ Werkzame stof</button>
        </div>
        {product.ingredients.length === 0 && <p className="supplement-editor__hint">Nog geen werkzame stoffen toegevoegd.</p>}
        <div className="supplement-ingredients">
          {product.ingredients.map((ingredient, index) => (
            <div className="supplement-ingredient" key={`${index}-${ingredient.name}`}>
              <Field label="Stof">
                <input value={ingredient.name} onChange={(event) => updateIngredient(index, "name", event.target.value)} />
              </Field>
              <Field label="Vorm / verbinding">
                <input value={ingredient.form} onChange={(event) => updateIngredient(index, "form", event.target.value)} />
              </Field>
              <Field label="Hoeveelheid" error={errors[`ingredient-${index}-amount`]}>
                <input type="number" min="0" step="any" value={ingredient.amount} onChange={(event) => updateIngredient(index, "amount", event.target.value)} />
              </Field>
              <Field label="Eenheid">
                <select value={ingredient.unit} onChange={(event) => updateIngredient(index, "unit", event.target.value)}>
                  {SUPPLEMENT_UNITS.map((unit) => <option key={unit}>{unit}</option>)}
                </select>
              </Field>
              <button className="supplement-ingredient__remove" type="button" onClick={() => removeIngredient(index)} aria-label={`Verwijder werkzame stof ${index + 1}`}>×</button>
            </div>
          ))}
        </div>
      </section>

      <section className="supplement-editor__section">
        <h2>Persoonlijk gebruik</h2>
        <div className="supplement-editor__grid">
          <Field label="Eigen dosering" error={errors.dosage}>
            <input type="number" min="0" step="any" value={personal.dosage} onChange={set(["personal", "dosage"])} />
          </Field>
          <Field label="Eigen doseereenheid">
            <input value={personal.dosageUnit} onChange={set(["personal", "dosageUnit"])} placeholder="bijv. capsules" />
          </Field>
          <Field label="Gebruiksmoment">
            <input value={personal.usageMoment} onChange={set(["personal", "usageMoment"])} />
          </Field>
          <Field label="Gebruiksdoel">
            <input value={personal.purpose} onChange={set(["personal", "purpose"])} />
          </Field>
          <Field label="Persoonlijke notities" wide>
            <textarea rows="3" value={personal.notes} onChange={set(["personal", "notes"])} />
          </Field>
        </div>
      </section>

      <section className="supplement-editor__section">
        <h2>Productinformatie</h2>
        <div className="supplement-editor__grid">
          <Field label="Korte omschrijving" wide>
            <textarea rows="3" value={product.description} onChange={set(["product", "description"])} />
          </Field>
          <Field label="Barcode">
            <input value={product.barcode} onChange={set(["product", "barcode"])} />
          </Field>
          <Field label="Afbeeldingen" wide>
            <SupplementImageManager
              images={product.images}
              onChange={(images) => onChange(updatePath(draft, ["product", "images"], images))}
            />
          </Field>
        </div>
      </section>

    </form>
  );
}
