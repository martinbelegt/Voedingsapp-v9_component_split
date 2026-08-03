import React, { useEffect, useMemo, useRef, useState } from "react";
import "./catalogFramework.css";

export default function CatalogFramework({
  config,
  items,
  categories = [],
  onPutOnTimeline,
  onAddToRoutine,
  onSave,
  onDelete,
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const rowRefs = useRef(new Map());

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    return items.filter((item) => {
      const itemCategories = config.getCategoryIds(item);
      return (categoryId === "all" || itemCategories.includes(categoryId)) &&
        (!normalizedQuery || config.getSearchText(item).toLocaleLowerCase("nl").includes(normalizedQuery));
    });
  }, [items, query, categoryId, config]);

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  useEffect(() => {
    if (selectedId && !selectedItem) {
      setSelectedId(null);
      setDetailsOpen(false);
    }
  }, [selectedId, selectedItem]);

  function select(item, openDetails = false) {
    setSelectedId(item.id);
    setDetailsOpen(openDetails);
    setEditing(false);
    setDraft(null);
  }

  function handleListKeyDown(event, index) {
    if (!["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Escape") {
      setDetailsOpen(false);
      return;
    }
    if (event.key === "Enter") {
      select(filteredItems[index], true);
      return;
    }
    const nextIndex = event.key === "ArrowDown"
      ? Math.min(index + 1, filteredItems.length - 1)
      : Math.max(index - 1, 0);
    const next = filteredItems[nextIndex];
    if (next) {
      select(next);
      rowRefs.current.get(next.id)?.focus();
    }
  }

  function startEditing() {
    setDraft(config.toDraft(selectedItem));
    setEditing(true);
  }

  function saveDetails() {
    onSave?.(selectedItem, draft);
    setEditing(false);
    setDraft(null);
  }

  return (
    <section className="catalog-framework" aria-label={`${config.title} catalogus`}>
      <header className="catalog-framework__toolbar">
        <div>
          <span>Mijn catalogi</span>
          <h1>{config.icon} {config.title}</h1>
        </div>
        <label className="catalog-framework__search">
          <span>Zoeken</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Zoek in ${config.title.toLowerCase()}`} />
        </label>
      </header>

      <nav className="catalog-framework__filters" aria-label="Catalogusfilters">
        <button type="button" className={categoryId === "all" ? "is-active" : ""} onClick={() => setCategoryId("all")}>Alles <small>{items.length}</small></button>
        {categories.map((category) => {
          const count = items.filter((item) => config.getCategoryIds(item).includes(category.id)).length;
          return <button type="button" key={category.id} className={categoryId === category.id ? "is-active" : ""} onClick={() => setCategoryId(category.id)}>{category.name || category.label} <small>{count}</small></button>;
        })}
      </nav>

      <div className="catalog-framework__summary"><span>{filteredItems.length} van {items.length} items</span><span>↑↓ navigeren · Enter details · Esc sluiten</span></div>

      <div className="catalog-framework__list" role="listbox" aria-label={`${config.title} selectielijst`}>
        {!filteredItems.length && <div className="catalog-framework__empty">{config.emptyMessage || "Geen items gevonden."}</div>}
        {filteredItems.map((item, index) => {
          const selected = item.id === selectedId;
          const categoryLabel = config.getCategoryLabel(item, categories);
          return (
            <div
              key={item.id}
              ref={(node) => node ? rowRefs.current.set(item.id, node) : rowRefs.current.delete(item.id)}
              className={`catalog-framework__row${selected ? " is-selected" : ""}`}
              role="option"
              aria-selected={selected}
              tabIndex={selected || (!selectedId && index === 0) ? 0 : -1}
              onClick={() => select(item)}
              onKeyDown={(event) => handleListKeyDown(event, index)}
            >
              <span className="catalog-framework__item-icon" aria-hidden="true">{config.itemIcon}</span>
              <strong title={config.getName(item)}>{config.getName(item)}</strong>
              {categoryLabel && <small className="catalog-framework__badge">{categoryLabel}</small>}
              <div className="catalog-framework__row-actions" onClick={(event) => event.stopPropagation()}>
                <button type="button" onClick={() => onPutOnTimeline(item)} aria-label={`Zet ${config.getName(item)} op tijdlijn`}>Zet op tijdlijn</button>
                <button type="button" onClick={() => onAddToRoutine(item)} aria-label={`Voeg ${config.getName(item)} toe aan routine`}>Toevoegen aan routine</button>
                <button type="button" onClick={() => select(item, true)} aria-label={`Details van ${config.getName(item)}`}>Details</button>
              </div>
            </div>
          );
        })}
      </div>

      {detailsOpen && selectedItem && (
        <aside className="catalog-framework__details" aria-label={`Details van ${config.getName(selectedItem)}`}>
          <header>
            <div><span>Details</span><h2>{config.itemIcon} {config.getName(selectedItem)}</h2></div>
            <button type="button" aria-label="Details sluiten" onClick={() => setDetailsOpen(false)}>×</button>
          </header>
          {editing ? (
            <div className="catalog-framework__edit-form">
              {config.editFields.map((field) => (
                <label key={field.key}>{field.label}<input value={draft[field.key] || ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} /></label>
              ))}
            </div>
          ) : (
            <dl>{config.detailFields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value(selectedItem) || "—"}</dd></div>)}</dl>
          )}
          <footer>
            {editing ? <><button type="button" onClick={() => setEditing(false)}>Annuleren</button><button type="button" className="is-primary" onClick={saveDetails}>Wijzigingen bewaren</button></> : <><button type="button" onClick={() => onAddToRoutine(selectedItem)}>Toevoegen aan routine</button><button type="button" onClick={startEditing} disabled={!onSave}>Wijzigen</button>{onDelete && <button type="button" className="is-danger" onClick={() => onDelete(selectedItem)}>Verwijderen</button>}<button type="button" className="is-primary" onClick={() => onPutOnTimeline(selectedItem)}>Zet op tijdlijn</button></>}
          </footer>
        </aside>
      )}
    </section>
  );
}
