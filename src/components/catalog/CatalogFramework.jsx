import React, { useEffect, useMemo, useRef, useState } from "react";
import CatalogToolbar from "./CatalogToolbar";
import "./catalogFramework.css";

export default function CatalogFramework({ config, items, categories = [], onPutOnTimeline, onAddToRoutine, onSave }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [reversed, setReversed] = useState(false);
  const [draft, setDraft] = useState(null);
  const rowRefs = useRef(new Map());
  const editorRef = useRef(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    const result = items.filter((item) => {
      const itemCategories = config.getCategoryIds(item);
      return (categoryId === "all" || itemCategories.includes(categoryId)) &&
        (!normalizedQuery || config.getSearchText(item).toLocaleLowerCase("nl").includes(normalizedQuery));
    }).sort((a, b) => config.getName(a).localeCompare(config.getName(b), "nl", { sensitivity: "base" }) * (sortDirection === "asc" ? 1 : -1));
    return reversed ? result.reverse() : result;
  }, [items, query, categoryId, config, sortDirection, reversed]);

  useEffect(() => {
    if (openId && !items.some(({ id }) => id === openId)) {
      setOpenId(null);
      setDraft(null);
    }
  }, [items, openId]);

  useEffect(() => {
    if (!openId) return;
    const frame = window.requestAnimationFrame(() => editorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }));
    return () => window.cancelAnimationFrame(frame);
  }, [openId]);

  function select(item) {
    setSelectedId(item.id);
  }

  function open(item) {
    setSelectedId(item.id);
    setOpenId(item.id);
    setDraft(config.toDraft(item));
  }

  function toggle(item) {
    if (openId === item.id) {
      setOpenId(null);
      setDraft(null);
    } else {
      open(item);
    }
  }

  function handleListKeyDown(event, index) {
    if (!["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Escape") {
      setOpenId(null);
      setDraft(null);
      return;
    }
    if (event.key === "Enter") {
      open(filteredItems[index]);
      return;
    }
    const nextIndex = event.key === "ArrowDown" ? Math.min(index + 1, filteredItems.length - 1) : Math.max(index - 1, 0);
    const next = filteredItems[nextIndex];
    if (next) {
      select(next);
      rowRefs.current.get(next.id)?.focus();
    }
  }

  function save(item) {
    onSave?.(item, draft);
    setOpenId(null);
    setDraft(null);
  }

  function expandSelected() {
    const item = items.find(({ id }) => id === selectedId) || filteredItems[0];
    if (item) open(item);
  }

  return (
    <section className="catalog-framework" aria-label={`${config.title} catalogus`}>
      <header className="catalog-framework__heading"><span>Mijn catalogi</span><h1>{config.icon} {config.title}</h1></header>
      <CatalogToolbar
        query={query}
        onQueryChange={setQuery}
        sortDirection={sortDirection}
        onToggleAlphabetical={() => setSortDirection((value) => value === "asc" ? "desc" : "asc")}
        onReverse={() => setReversed((value) => !value)}
        onExpand={expandSelected}
        onCollapse={() => { setOpenId(null); setDraft(null); }}
        searchPlaceholder={`Zoek in ${config.title.toLowerCase()}`}
      />
      <nav className="catalog-framework__filters" aria-label="Catalogusfilters">
        <button type="button" className={categoryId === "all" ? "is-active" : ""} onClick={() => setCategoryId("all")}>Alles <small>{items.length}</small></button>
        {categories.map((category) => {
          const count = items.filter((item) => config.getCategoryIds(item).includes(category.id)).length;
          return <button type="button" key={category.id} className={categoryId === category.id ? "is-active" : ""} onClick={() => setCategoryId(category.id)}>{category.name || category.label} <small>{count}</small></button>;
        })}
      </nav>
      <div className="catalog-framework__summary"><span>{filteredItems.length} van {items.length} items</span><span>Klik: openen/sluiten · ↑↓ navigeren · Enter openen · Esc sluiten</span></div>
      <div className="catalog-framework__list" role="listbox" aria-label={`${config.title} selectielijst`}>
        {!filteredItems.length && <div className="catalog-framework__empty">{config.emptyMessage || "Geen items gevonden."}</div>}
        {filteredItems.map((item, index) => {
          const selected = item.id === selectedId;
          const isOpen = item.id === openId;
          const categoryLabel = config.getCategoryLabel(item, categories);
          return (
            <React.Fragment key={item.id}>
              <div
                ref={(node) => node ? rowRefs.current.set(item.id, node) : rowRefs.current.delete(item.id)}
                className={`catalog-framework__row${selected ? " is-selected" : ""}${isOpen ? " is-open" : ""}`}
                role="option"
                aria-selected={selected}
                aria-expanded={isOpen}
                tabIndex={selected || (!selectedId && index === 0) ? 0 : -1}
                onClick={() => toggle(item)}
                onKeyDown={(event) => handleListKeyDown(event, index)}
              >
                <span className="catalog-framework__item-icon" aria-hidden="true">{config.itemIcon}</span>
                <strong title={config.getName(item)}>{config.getName(item)}</strong>
                {categoryLabel && <small className="catalog-framework__badge">{categoryLabel}</small>}
                <div className="catalog-framework__row-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => onPutOnTimeline(item)} aria-label={`Zet ${config.getName(item)} op tijdlijn`}>➜ Zet op tijdlijn</button>
                  <button type="button" onClick={() => onAddToRoutine(item)} aria-label={`Voeg ${config.getName(item)} toe aan routine`}>🔄 Routine</button>
                </div>
              </div>
              {isOpen && draft && (
                <article ref={editorRef} className="catalog-framework__inline-editor" aria-label={`${config.editorTitle || "Editor"} ${config.getName(item)}`}>
                  <header>
                    <div><span>{config.editorTitle || "Cataloguseditor"}</span><h2>{config.itemIcon} {config.getName(item)}</h2></div>
                    <div className="catalog-framework__editor-actions">
                      <button type="button" onClick={() => { setOpenId(null); setDraft(null); }}>Annuleren</button>
                      <button type="button" className="is-save" onClick={() => save(item)} disabled={!onSave}>Wijzigingen bewaren</button>
                      <button type="button" className="is-primary" onClick={() => onPutOnTimeline(item)}>Zet op tijdlijn</button>
                      <button type="button" onClick={() => onAddToRoutine(item)}>Toevoegen aan routine</button>
                    </div>
                  </header>
                  <div className="catalog-framework__edit-form">
                    {config.editFields.map((field) => (
                      <label key={field.key} className={field.wide ? "is-wide" : ""}>{field.label}
                        {field.multiline ? <textarea rows="3" value={draft[field.key] ?? ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} /> : <input type={field.type || "text"} value={draft[field.key] ?? ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />}
                      </label>
                    ))}
                  </div>
                  <dl>{config.detailFields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value(item) || "—"}</dd></div>)}</dl>
                </article>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
