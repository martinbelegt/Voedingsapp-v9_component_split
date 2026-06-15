import React, { useEffect, useState } from "react";

export default function IntakeLibraryModal({
  open,
  onClose,
  onSave,
  editingItem,
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("supplement");
  const [subCategory, setSubCategory] = useState("");
  const [defaultDosage, setDefaultDosage] = useState("");
  const [defaultTime, setDefaultTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editingItem) {
      setName(editingItem.name || "");
      setCategory(editingItem.category || "supplement");
      setSubCategory(editingItem.subCategory || "");
      setDefaultDosage(editingItem.defaultDosage || "");
      setDefaultTime(editingItem.defaultTime || "");
      setNote(editingItem.note || "");
    } else {
      setName("");
      setCategory("supplement");
      setSubCategory("");
      setDefaultDosage("");
      setDefaultTime("");
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
      defaultDosage,
      defaultTime,
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
          {isEditing ? "✏️ Inname-item bewerken" : "➕ Nieuw inname-item"}
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Naam"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="supplement">Supplement</option>
            <option value="enzyme">Enzym</option>
            <option value="medication">Medicatie</option>
          </select>

          <input
            placeholder="Subcategorie"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
          />

          <input
            placeholder="Standaarddosering"
            value={defaultDosage}
            onChange={(e) => setDefaultDosage(e.target.value)}
          />

          <input
            type="time"
            value={defaultTime}
            onChange={(e) => setDefaultTime(e.target.value)}
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
