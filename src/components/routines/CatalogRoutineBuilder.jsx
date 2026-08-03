import React, { useEffect, useMemo, useState } from "react";
import { createRoutineItem } from "../../services/routineService";
import "./catalogRoutineBuilder.css";

const TYPE_BY_MODULE = {
  food: "food",
  supplements: "supplement",
  medication: "medication",
  exercises: "exercise",
};

export function CatalogRoutineBuilder({
  activeModuleId,
  products,
  supplements,
  onCreateRoutine,
  initialSelection,
}) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [step, setStep] = useState("select");
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#557a5b",
    icon: "☀️",
  });

  const type = TYPE_BY_MODULE[activeModuleId];

  useEffect(() => {
    if (!initialSelection?.catalogItemId || initialSelection.type !== type) return;
    setSelectedIds([initialSelection.catalogItemId]);
    setStep("details");
    setOpen(true);
  }, [initialSelection, type]);
  const options = useMemo(() => {
    if (type === "food") return products.map((item) => ({ id: item.id, label: item.name }));
    if (type === "supplement") return supplements.map((item) => ({ id: item.id, label: item.product?.name || "Supplement" }));
    return [];
  }, [type, products, supplements]);

  function close() {
    setOpen(false);
    setStep("select");
    setSelectedIds([]);
  }

  function save() {
    const items = selectedIds.map((catalogItemId, order) =>
      createRoutineItem({ type, catalogItemId, order }),
    );
    onCreateRoutine({ ...form, items });
    close();
  }

  return (
    <section className="catalog-routine-builder">
      <div>
        <strong>Routines</strong>
        <span>Catalogi bouwen routines. Mijn routines voert routines uit.</span>
      </div>
      <div className="catalog-routine-builder__actions">
        <button type="button" onClick={() => { setOpen(true); setStep("select"); }}>Toevoegen aan routine</button>
        <button type="button" className="is-primary" onClick={() => { setSelectedIds([]); setOpen(true); setStep("details"); }}>Nieuwe routine maken</button>
      </div>

      {open && (
        <div className="catalog-routine-builder__panel" role="dialog" aria-label="Routine maken">
          <div className="catalog-routine-builder__panel-heading">
            <div><span>Routine Builder</span><h2>{step === "select" ? "Kies catalogusitems" : "Nieuwe routine"}</h2></div>
            <button type="button" onClick={close} aria-label="Sluiten">×</button>
          </div>
          {step === "select" ? (
            <>
              {options.length ? (
                <div className="catalog-routine-builder__options">
                  {options.map((option) => (
                    <label key={option.id}>
                      <input type="checkbox" checked={selectedIds.includes(option.id)} onChange={() => setSelectedIds((current) => current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id])} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="catalog-routine-builder__empty">Deze catalogus wordt in een volgende sprint gevuld. De routineactie staat alvast op de vaste plek.</p>
              )}
              <div className="catalog-routine-builder__footer">
                <span>{selectedIds.length} geselecteerd</span>
                <button type="button" className="is-primary" disabled={!selectedIds.length} onClick={() => setStep("details")}>Maak routine</button>
              </div>
            </>
          ) : (
            <div className="catalog-routine-builder__form">
              <label>Naam<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoFocus /></label>
              <label>Beschrijving<textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <div>
                <label>Kleur<input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
                <label>Icoon<input value={form.icon} maxLength="4" onChange={(event) => setForm({ ...form, icon: event.target.value })} /></label>
              </div>
              <div className="catalog-routine-builder__footer">
                <span>{selectedIds.length ? `${selectedIds.length} onderdelen` : "Lege routine"}</span>
                <button type="button" className="is-primary" disabled={!form.name.trim()} onClick={save}>Opslaan</button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
