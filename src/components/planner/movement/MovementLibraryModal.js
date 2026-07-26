import React, { useEffect, useState } from "react";
import { CompanionNumberInput } from "../../../ui/inputs/CompanionInput";

export default function MovementLibraryModal({
  open,
  onClose,
  onSave,
  editingItem,
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("strength");
  const [subCategory, setSubCategory] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState("");
  const [intensity, setIntensity] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editingItem) {
      setName(editingItem.name || "");
      setCategory(editingItem.category || "strength");
      setSubCategory(editingItem.subCategory || "");
      setMuscleGroup(editingItem.muscleGroup || "");
      setDefaultDurationMinutes(editingItem.defaultDurationMinutes || "");
      setIntensity(editingItem.intensity || "");
      setNote(editingItem.note || "");
    } else {
      setName("");
      setCategory("strength");
      setSubCategory("");
      setMuscleGroup("");
      setDefaultDurationMinutes("");
      setIntensity("");
      setNote("");
    }
  }, [open, editingItem]);

  if (!open) return null;

  const isEditing = Boolean(editingItem);

  function handleSave() {
    if (!name.trim()) return;

    onSave({
      id: editingItem?.id || crypto.randomUUID(),
      name,
      category,
      subCategory,
      muscleGroup,
      defaultDurationMinutes,
      intensity,
      note,
      active: editingItem?.active ?? true,
    });

    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 16,
          padding: 16,
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>
          {isEditing ? "✏️ Beweging bewerken" : "➕ Nieuwe beweging"}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Naam, bv. Borsttraining"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="strength">Krachttraining</option>
            <option value="cardio">Cardio</option>
            <option value="mobility">Mobiliteit / herstel</option>
          </select>

          <input
            placeholder="Subcategorie, bv. Borst"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          />

          <input
            placeholder="Spiergroep, bv. Borst"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
          />

          <CompanionNumberInput
            decimal={false}
            placeholder="Standaardduur in minuten"
            value={defaultDurationMinutes}
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                setDefaultDurationMinutes(e.target.value);
              }
            }}
          />

          <input
            placeholder="Intensiteit"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          />

          <textarea
            rows={3}
            placeholder="Notitie"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 6,
            }}
          >
            <button onClick={onClose}>Annuleren</button>
            <button onClick={handleSave}>
              {isEditing ? "Wijzigingen opslaan" : "Opslaan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
