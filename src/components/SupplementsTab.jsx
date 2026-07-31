import React, { useEffect, useState } from "react";
import LibraryWorkspace from "./library/LibraryWorkspace";
import SupplementDetailEditor from "./supplements/SupplementDetailEditor";
import {
  createSupplement,
  getSupplementCategoryLabel,
  sanitizeSupplement,
  supplementMatchesQuery,
  SUPPLEMENT_CATEGORIES,
  validateSupplement,
} from "../data/supplements";
import {
  loadSupplements,
  saveSupplements,
} from "../services/supplementStorageService";

const supplementLibraryConfig = {
  title: "Supplementen",
  singularLabel: "supplement",
  listTitle: "Mijn supplementen",
  searchPlaceholder: "Zoek op naam, merk of werkzame stof",
  emptyMessage: "Geen supplementen gevonden.",
  getCategoryId: (item) => item.product.categoryId,
  matchesQuery: supplementMatchesQuery,
  searchableFields: [],
  getItemTitle: (item) => item.product.name || "Naam nog invullen",
  getItemMeta: (item) => {
    const productLabel = item.product.brand || item.product.productName;
    const category = getSupplementCategoryLabel(item.product.categoryId);
    const status = item.personal.status === "active" ? "Actief" : "Niet actief";
    return [productLabel, category, status].filter(Boolean).join(" · ");
  },
};

export default function SupplementsTab() {
  const [supplements, setSupplements] = useState(() => loadSupplements());
  const [selectedId, setSelectedId] = useState(
    () => loadSupplements()[0]?.id || null,
  );
  const [draft, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    saveSupplements(supplements);
  }, [supplements]);

  function selectSupplement(id) {
    setSelectedId(id);
    setDraft(null);
    setIsNew(false);
    setErrors({});
  }

  function startNewSupplement() {
    const next = createSupplement();
    setSelectedId(null);
    setDraft(next);
    setIsNew(true);
    setErrors({});
  }

  function saveDraft(candidate = draft) {
    const result = validateSupplement(candidate);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    const saved = sanitizeSupplement(candidate);
    setSupplements((current) =>
      isNew
        ? [saved, ...current]
        : current.map((item) => (item.id === saved.id ? saved : item)),
    );
    setSelectedId(saved.id);
    setDraft(null);
    setIsNew(false);
    setErrors({});
  }

  function cancelEditing() {
    if (isNew && !selectedId) setSelectedId(supplements[0]?.id || null);
    setDraft(null);
    setIsNew(false);
    setErrors({});
  }

  function deleteSupplement(candidate = draft) {
    if (!window.confirm("Weet je zeker dat je dit supplement wilt verwijderen?")) {
      return;
    }
    const remaining = supplements.filter((item) => item.id !== candidate.id);
    setSupplements(remaining);
    setSelectedId(remaining[0]?.id || null);
    setDraft(null);
    setErrors({});
  }

  function renderDetail(selectedItem) {
    const editingItem = draft || selectedItem;
    if (!editingItem) {
      return (
        <div className="companion-library__detail-empty">
          <div aria-hidden="true">◇</div>
          <h2>Selecteer een supplement</h2>
          <p>Kies een item uit de lijst of voeg een nieuw supplement toe.</p>
        </div>
      );
    }

    return (
      <SupplementDetailEditor
        draft={draft || editingItem}
        errors={errors}
        isNew={isNew}
        onChange={(nextDraft) => {
          setDraft(nextDraft);
          setErrors({});
        }}
        onSave={() => saveDraft(editingItem)}
        onCancel={cancelEditing}
        onDelete={() => deleteSupplement(editingItem)}
      />
    );
  }

  return (
    <LibraryWorkspace
      config={supplementLibraryConfig}
      items={supplements}
      categories={SUPPLEMENT_CATEGORIES}
      selectedId={selectedId}
      onSelect={selectSupplement}
      renderDetail={renderDetail}
      listHeaderAction={
        <button
          type="button"
          className="companion-library__add-button"
          onClick={startNewSupplement}
        >
          + Nieuw
        </button>
      }
    />
  );
}
