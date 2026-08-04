import React, { useEffect, useRef, useState } from "react";
import LibraryWorkspace from "./library/LibraryWorkspace";
import SupplementDetailEditor from "./supplements/SupplementDetailEditor";
import {
  createSupplement,
  getSupplementCategoryLabel,
  sanitizeSupplement,
  supplementMatchesQuery,
  validateSupplement,
} from "../data/supplements";
import {
  loadSupplementCatalog,
  saveSupplementCatalog,
} from "../services/supplementStorageService";
import SupplementCategoryManager from "./supplements/SupplementCategoryManager";
import { deleteSupplementImageBlob } from "../services/supplementImageService";
import { getPrimarySupplementImage } from "../services/supplementImageService";
import { SupplementImage } from "./supplements/SupplementImageManager";

function makeSupplementLibraryConfig(categories) {
  return {
  title: "Supplementen",
  singularLabel: "supplement",
  listTitle: "Mijn supplementen",
  searchPlaceholder: "Zoek op naam, merk of werkzame stof",
  emptyMessage: "Geen supplementen gevonden.",
  getCategoryIds: (item) => item.product.categoryIds || [],
  matchesQuery: supplementMatchesQuery,
  searchableFields: [],
  getItemTitle: (item) => item.product.name || "Naam nog invullen",
  getItemMeta: (item) => {
    const productLabel = item.product.brand || item.product.productName;
    const category = (item.product.categoryIds || [])
      .map((id) => getSupplementCategoryLabel(id, categories))
      .join(", ");
    const status = item.personal.status === "active" ? "Actief" : "Niet actief";
    return [productLabel, category, status].filter(Boolean).join(" · ");
  },
  renderItemContent: (item) => {
    const names = (item.product.categoryIds || [])
      .map((id) => getSupplementCategoryLabel(id, categories));
    const visible = names.slice(0, 2);
    return (
      <div className="supplement-list-card">
        <div className="supplement-list-card__image">
          <SupplementImage
            image={getPrimarySupplementImage(item.product.images)}
            alt=""
          />
        </div>
        <div>
          <strong>{item.product.name || "Naam nog invullen"}</strong>
          <small>{item.product.brand || item.product.productName}</small>
          <span className="supplement-list-card__categories">
            {visible.map((name) => <em key={name}>{name}</em>)}
            {names.length > 2 && <em>+{names.length - 2}</em>}
          </span>
        </div>
      </div>
    );
  },
  };
}

function timelineDateTime(date, usageMoment) {
  const match = String(usageMoment || "").match(/(?:^|\s)([01]\d|2[0-3]):([0-5]\d)(?:\s|$)/);
  if (match) return `${date}T${match[1]}:${match[2]}`;
  const now = new Date();
  return `${date}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function SupplementsTab({ selectedDate, onAddToTimeline, catalog: controlledCatalog, onCatalogChange, createRequestId }) {
  const [localCatalog, setLocalCatalog] = useState(() => loadSupplementCatalog());
  const catalog = controlledCatalog || localCatalog;
  const { items: supplements, categories } = catalog;
  const [selectedId, setSelectedId] = useState(() => catalog.items[0]?.id || null);
  const [draft, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCategories, setShowCategories] = useState(false);
  const timelineCandidateRef = useRef(null);
  const handledCreateRequestRef = useRef(null);

  useEffect(() => {
    if (!controlledCatalog) saveSupplementCatalog(localCatalog);
  }, [controlledCatalog, localCatalog]);

  const setCatalog = (update) => {
    if (onCatalogChange) {
      onCatalogChange(update);
    } else {
      setLocalCatalog(update);
    }
  };

  const setSupplements = (update) =>
    setCatalog((current) => ({
      ...current,
      items: typeof update === "function" ? update(current.items) : update,
    }));

  function selectSupplement(id) {
    setSelectedId(id);
    setDraft(null);
    setIsNew(false);
    setErrors({});
    timelineCandidateRef.current = null;
  }

  function startNewSupplement() {
    const next = createSupplement();
    setSelectedId(null);
    setDraft(next);
    setIsNew(true);
    setErrors({});
    timelineCandidateRef.current = null;
  }

  useEffect(() => {
    if (createRequestId === null || createRequestId === undefined || handledCreateRequestRef.current === createRequestId) return;
    handledCreateRequestRef.current = createRequestId;
    startNewSupplement();
  }, [createRequestId]);

  function saveDraft(candidate = draft) {
    const result = validateSupplement(candidate);
    if (!result.valid) {
      setErrors(result.errors);
      return null;
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
    timelineCandidateRef.current = null;
    return saved;
  }

  function cancelEditing() {
    if (draft && !window.confirm("Niet-opgeslagen wijzigingen verwerpen?")) return;
    if (isNew && !selectedId) setSelectedId(supplements[0]?.id || null);
    setDraft(null);
    setIsNew(false);
    setErrors({});
    timelineCandidateRef.current = null;
  }

  async function deleteSupplement(candidate = draft) {
    const name = candidate?.product?.name || "Dit supplement";
    if (!window.confirm(
      `${name} verwijderen?\n\nHet supplement verdwijnt uit Mijn catalogi.\nBestaande registraties op de Tijdlijn blijven bewaard.`,
    )) {
      return;
    }
    await Promise.all(
      (candidate.product.images || [])
        .filter((image) => image.storage === "indexeddb")
        .map((image) => deleteSupplementImageBlob(image.storageKey).catch(() => {})),
    );
    const remaining = supplements.filter((item) => item.id !== candidate.id);
    setSupplements(remaining);
    setSelectedId(remaining[0]?.id || null);
    setDraft(null);
    setErrors({});
    timelineCandidateRef.current = null;
  }

  function openTimelinePanel(candidate) {
    let saved = candidate;
    if (draft || isNew) saved = saveDraft(candidate);
    timelineCandidateRef.current = saved || null;
    return Boolean(saved);
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
        onOpenTimelinePanel={() => openTimelinePanel(editingItem)}
        onTimelineSubmit={(values) => {
          const snapshot = timelineCandidateRef.current || editingItem;
          onAddToTimeline?.({
            date: values.eventTime.slice(0, 10),
            eventTime: values.eventTime,
            name: values.name,
            dosage: values.dosage,
            unit: values.unit,
            note: values.note,
            supplementId: snapshot.id,
            supplementName: snapshot.product.name,
            brand: snapshot.product.brand,
            productName: snapshot.product.productName,
          });
          timelineCandidateRef.current = null;
        }}
        timelineDefaults={{
          date: selectedDate,
          eventTime: timelineDateTime(selectedDate, editingItem.personal.usageMoment),
          values: {
            name: editingItem.product.name,
            dosage: editingItem.personal.dosage,
            unit: editingItem.personal.dosageUnit,
            note: editingItem.personal.notes,
          },
        }}
        isDirty={Boolean(draft)}
        categories={categories}
      />
    );
  }

  return (
    <LibraryWorkspace
      config={makeSupplementLibraryConfig(categories)}
      items={supplements}
      categories={categories}
      selectedId={selectedId}
      onSelect={selectSupplement}
      renderDetail={renderDetail}
      layout="supplements"
      categorySectionOpen={showCategories}
      onToggleCategorySection={() => setShowCategories((visible) => !visible)}
      onAddItem={startNewSupplement}
      categoryAction={
        <div className="companion-library__header-actions">
          <button
            type="button"
            className="companion-library__add-button"
            onClick={() => setShowCategories((visible) => !visible)}
          >
          Categorieën beheren
          </button>
          <button
            type="button"
            className="companion-library__add-button"
            onClick={startNewSupplement}
          >
            Nieuw supplement
          </button>
        </div>
      }
    >
      {showCategories && (
        <SupplementCategoryManager
          categories={categories}
          supplements={supplements}
          onChange={({ categories: nextCategories, supplements: nextSupplements }) =>
            setCatalog({ categories: nextCategories, items: nextSupplements })
          }
          onClose={() => setShowCategories(false)}
        />
      )}
    </LibraryWorkspace>
  );
}
