import React, { useMemo, useState } from "react";
import SelectionBuilder from "../builders/SelectionBuilder";
import { createId } from "../../services/idService";
import { calculateMealRows } from "../../services/mealRowCalculationService";
import { calculateMealTotals } from "../../services/mealTotalsService";
import { parseDecimalInput } from "../../utils/numberUtils";
import { getTimingMinutes } from "../../services/uiHelpers";
import { timingOptions } from "../../data/appOptions";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export function createMealDraft(meal) {
  return {
    id: meal?.id || createId("saved-meal"),
    name: meal?.name || "",
    description: meal?.description || "",
    category: meal?.category || "",
    servings: Number(meal?.servings) || 1,
    rows: (meal?.rows || []).filter((row) => row.productId).map((row) => ({ ...row, id: row.id || createId("meal-builder-row") })),
  };
}

export default function MealBuilder({ meal, draft: controlledDraft, onDraftChange, products, categories, settings, onSave, onCancel }) {
  const [internalDraft, setInternalDraft] = useState(() => createMealDraft(meal));
  const draft = controlledDraft || internalDraft;
  const setDraft = (update) => {
    const next = typeof update === "function" ? update(draft) : update;
    if (controlledDraft) onDraftChange?.(next);
    else setInternalDraft(next);
  };
  const rowsWithCalc = useMemo(() => calculateMealRows(draft.rows, products, parseDecimalInput, round2), [draft.rows, products]);
  const totals = useMemo(() => calculateMealTotals({ rowsWithCalc, settings, timingOptions, getTimingMinutes, round2, toNumber: (value) => Number(value) || 0 }), [rowsWithCalc, settings]);

  function addProduct(product) {
    const defaultGrams = Number(product.portionGram) > 0 ? Number(product.portionGram) : 100;
    setDraft((current) => {
      const existing = current.rows.find((row) => row.productId === product.id);
      if (!existing) return { ...current, rows: [...current.rows, { id: createId("meal-builder-row"), productId: product.id, mode: "gram", amount: String(defaultGrams) }] };
      return current;
    });
  }

  function updateRow(id, changes) {
    setDraft((current) => ({ ...current, rows: current.rows.map((row) => row.id === id ? { ...row, ...changes } : row) }));
  }

  function removeRow(id) {
    setDraft((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
  }

  function quantityStep(row) {
    return row.mode === "portion" ? 1 : (Number(row.product?.portionGram) > 0 ? Number(row.product.portionGram) : 10);
  }

  function adjustRow(row, direction) {
    const step = quantityStep(row);
    const current = parseDecimalInput(row.amount);
    if (direction < 0 && current <= step) return;
    updateRow(row.id, { amount: String(round2(current + step * direction)) });
  }

  return <SelectionBuilder
    title={meal ? `Maaltijd wijzigen` : "Nieuwe maaltijd"}
    eyebrow="Meal Builder"
    fields={<><label>Naam<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Bijvoorbeeld ontbijt" autoFocus /></label><label>Omschrijving<textarea rows="2" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Optionele toelichting" /></label><label>Categorie<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Bijvoorbeeld ontbijt" /></label></>}
    selectedItems={rowsWithCalc}
    catalogItems={products}
    categories={categories}
    onAddItem={addProduct}
    isItemSelected={(product) => draft.rows.some((row) => row.productId === product.id)}
    renderSelectedItem={(row) => <div className="selection-builder__selected-row" key={row.id}><button type="button" className="selection-builder__quantity" onClick={() => adjustRow(row, -1)} disabled={parseDecimalInput(row.amount) <= quantityStep(row)} aria-label={`Verlaag ${row.product?.name || "product"}`}>−</button><div><strong>{row.product?.name || "Onbekend product"}</strong><small>{row.grams} g · {row.kcal} kcal</small></div><input type="number" min="0" step="any" value={row.amount} onChange={(event) => updateRow(row.id, { amount: event.target.value })} aria-label={`Hoeveelheid ${row.product?.name || "product"}`} /><select value={row.mode} onChange={(event) => updateRow(row.id, { mode: event.target.value })} aria-label={`Eenheid ${row.product?.name || "product"}`}><option value="gram">Gram</option><option value="portion">Porties</option></select><button type="button" className="selection-builder__quantity" onClick={() => adjustRow(row, 1)} aria-label={`Verhoog ${row.product?.name || "product"}`}>＋</button><button type="button" className="selection-builder__remove" onClick={() => removeRow(row.id)} aria-label={`Verwijder ${row.product?.name || "product"}`}>×</button></div>}
    renderSummary={() => <div className="selection-builder__summary"><span>Live maaltijdtotaal</span><div className="selection-builder__summary-grid"><div><small>🔥 Energie</small><strong>{totals.kcal} kcal</strong></div><div><small>🥖 Koolhydraten</small><strong>{totals.kh} g</strong></div><div><small>🥩 Eiwit</small><strong>{totals.protein} g</strong></div><div><small>🥑 Vet</small><strong>{totals.fat} g</strong></div></div><div className="selection-builder__advice"><div><span>💊 Creonadvies</span><strong>{totals.best?.description || "0"}</strong></div><div><span>💉 Insulineadvies</span><strong>{totals.insulin} E</strong></div></div></div>}
    onSave={() => onSave({ ...draft, name: draft.name.trim(), rows: draft.rows.map(({ product, grams, kh, protein, fat, kcal, ...row }) => row) })}
    onCancel={onCancel}
    saveDisabled={!draft.name.trim() || !draft.rows.length}
  />;
}
