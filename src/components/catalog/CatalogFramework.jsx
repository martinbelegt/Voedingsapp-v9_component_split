import React, { useEffect, useMemo, useRef, useState } from "react";
import CatalogToolbar from "./CatalogToolbar";
import "./catalogFramework.css";

export default function CatalogFramework({ config, items, categories = [], savedMeals = [], onPutOnTimeline, onPutMealOnTimeline, onAddToRoutine, onToggleFavorite, onAddNew, onSave, onDelete, renderEditor }) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [catalogView, setCatalogView] = useState("products");
  const [draft, setDraft] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newItem, setNewItem] = useState(null);
  const rowRefs = useRef(new Map());
  const editorRef = useRef(null);

  const catalogItems = useMemo(() => newItem ? [newItem, ...items] : items, [items, newItem]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    const result = catalogItems.filter((item) => {
      const itemCategories = config.getCategoryIds(item);
      return (categoryId === "all" || itemCategories.includes(categoryId)) &&
        (!favoritesOnly || config.isFavorite(item)) &&
        (!normalizedQuery || config.getSearchText(item).toLocaleLowerCase("nl").includes(normalizedQuery));
    }).sort((a, b) => config.getName(a).localeCompare(config.getName(b), "nl", { sensitivity: "base" }) * (sortDirection === "asc" ? 1 : -1));
    return result;
  }, [catalogItems, query, categoryId, config, sortDirection, favoritesOnly]);

  const filteredMeals = useMemo(() => {
    if (catalogView !== "meals") return [];
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    const result = savedMeals
      .filter((meal) => !normalizedQuery || meal.name.toLocaleLowerCase("nl").includes(normalizedQuery))
      .sort((a, b) => a.name.localeCompare(b.name, "nl", { sensitivity: "base" }) * (sortDirection === "asc" ? 1 : -1));
    return result;
  }, [savedMeals, query, catalogView, sortDirection]);

  const filteredCategories = useMemo(() => {
    if (catalogView !== "categories") return [];
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    return categories
      .filter((category) => !normalizedQuery || (category.name || category.label || "").toLocaleLowerCase("nl").includes(normalizedQuery))
      .sort((a, b) => (a.name || a.label || "").localeCompare(b.name || b.label || "", "nl", { sensitivity: "base" }) * (sortDirection === "asc" ? 1 : -1));
  }, [categories, query, catalogView, sortDirection]);

  const showingMeals = catalogView === "meals";
  const showingCategories = catalogView === "categories";
  const visibleCount = showingMeals ? filteredMeals.length : showingCategories ? filteredCategories.length + 1 : filteredItems.length;
  const totalCount = showingMeals ? savedMeals.length : showingCategories ? categories.length + 1 : items.length;

  useEffect(() => {
    if (openId && newItem?.id !== openId && !items.some(({ id }) => id === openId)) {
      setOpenId(null);
      setDraft(null);
    }
  }, [items, newItem, openId]);

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

  function startNew() {
    if (!config.createItem) {
      onAddNew?.();
      return;
    }
    const item = config.createItem();
    setCatalogView("products");
    setQuery("");
    setCategoryId("all");
    setNewItem(item);
    setSelectedId(item.id);
    setOpenId(item.id);
    setDraft(config.toDraft(item));
  }

  function toggle(item) {
    setDeleteConfirmId(null);
    if (openId === item.id) {
      if (newItem?.id === item.id) setNewItem(null);
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
      setNewItem(null);
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
    setNewItem(null);
    setOpenId(null);
    setDraft(null);
  }

  function showCatalogView(view) {
    setCatalogView((current) => current === view ? "products" : view);
    setNewItem(null);
    setOpenId(null);
    setDraft(null);
  }

  function safeExternalUrl(value) {
    const input = String(value || "").trim();
    if (!input) return "";
    try {
      const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  return (
    <section className="catalog-framework" aria-label={`${config.title} catalogus`}>
      <CatalogToolbar
        query={query}
        onQueryChange={setQuery}
        sortDirection={sortDirection}
        favoritesOnly={favoritesOnly}
        onToggleFavorites={() => setFavoritesOnly((value) => !value)}
        activeView={catalogView}
        showMeals={Boolean(onPutMealOnTimeline)}
        onShowMeals={() => showCatalogView("meals")}
        onShowCategories={() => showCatalogView("categories")}
        catalogLabel={config.title}
        addLabel={`${config.title === "Supplementen" ? "Supplement" : config.title} toevoegen`}
        onAddNew={startNew}
        onToggleAlphabetical={() => setSortDirection((value) => value === "asc" ? "desc" : "asc")}
        searchPlaceholder={showingMeals ? "Zoek in maaltijden" : showingCategories ? "Zoek in categorieën" : `Zoek in ${config.title.toLowerCase()}`}
      />
      <div className="catalog-framework__summary"><span>★ favoriet · T tijdlijn · R routine</span><span>{visibleCount} van {totalCount} items</span><span>Klik: openen/sluiten · ↑↓ navigeren · Enter openen · Esc sluiten</span></div>
      <div className="catalog-framework__list" role="listbox" aria-label={`${config.title} selectielijst`}>
        {!visibleCount && <div className="catalog-framework__empty">{showingMeals ? "Geen samengestelde maaltijden gevonden." : showingCategories ? "Geen categorieën gevonden." : (config.emptyMessage || "Geen items gevonden.")}</div>}
        {showingCategories && (
          <>
            <div className={`catalog-framework__row catalog-framework__category-row${categoryId === "all" ? " is-selected" : ""}`} role="option" aria-selected={categoryId === "all"} tabIndex="0" onClick={() => { setCategoryId("all"); setCatalogView("products"); }}>
              <div className="catalog-framework__category-icon" aria-hidden="true">#</div><strong>Alles</strong><small className="catalog-framework__badge">{items.length} items</small>
            </div>
            {filteredCategories.map((category) => {
              const count = items.filter((item) => config.getCategoryIds(item).includes(category.id)).length;
              return <div key={category.id} className={`catalog-framework__row catalog-framework__category-row${categoryId === category.id ? " is-selected" : ""}`} role="option" aria-selected={categoryId === category.id} tabIndex="0" onClick={() => { setCategoryId(category.id); setCatalogView("products"); }}><div className="catalog-framework__category-icon" aria-hidden="true">#</div><strong>{category.name || category.label}</strong><small className="catalog-framework__badge">{count} items</small></div>;
            })}
          </>
        )}
        {showingMeals && filteredMeals.map((meal) => (
          <div key={meal.id} className="catalog-framework__row catalog-framework__meal-row" role="option" aria-selected="false" tabIndex="-1">
            <div className="catalog-framework__row-actions" onClick={(event) => event.stopPropagation()}>
              <span aria-hidden="true" />
              <button type="button" onClick={() => onPutMealOnTimeline?.(meal)} aria-label={`Zet ${meal.name} op tijdlijn`} title="Zet op tijdlijn">T</button>
            </div>
            <strong title={meal.name}>{meal.name}</strong>
            <small className="catalog-framework__badge">{meal.rows?.filter((row) => row.productId).length || 0} onderdelen</small>
          </div>
        ))}
        {!showingMeals && !showingCategories && filteredItems.map((item, index) => {
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
                <div className="catalog-framework__row-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" className={config.isFavorite(item) ? "is-favorite" : ""} onClick={() => onToggleFavorite(item)} aria-label={config.isFavorite(item) ? `Verwijder ${config.getName(item)} uit favorieten` : `Voeg ${config.getName(item)} toe aan favorieten`} title={config.isFavorite(item) ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}>{config.isFavorite(item) ? "★" : "☆"}</button>
                  <button type="button" onClick={() => onPutOnTimeline(item)} aria-label={`Zet ${config.getName(item)} op tijdlijn`} title="Zet op tijdlijn">T</button>
                  <button type="button" onClick={() => onAddToRoutine(item)} aria-label={`Voeg ${config.getName(item)} toe aan routine`} title="Toevoegen aan routine">R</button>
                </div>
                <strong title={config.getName(item)}>{config.getName(item)}</strong>
                {categoryLabel && <small className="catalog-framework__badge">{categoryLabel}</small>}
              </div>
              {isOpen && draft && (
                <article ref={editorRef} className="catalog-framework__inline-editor" aria-label={`${config.editorTitle || "Editor"} ${config.getName(item)}`}>
                  {renderEditor ? renderEditor({
                    item,
                    isNew: newItem?.id === item.id,
                    draft,
                    setDraft,
                    save: (candidate = draft) => {
                      onSave?.(item, candidate);
                      setNewItem(null);
                      setOpenId(null);
                      setDraft(null);
                    },
                    cancel: () => {
                      setNewItem(null);
                      setOpenId(null);
                      setDraft(null);
                    },
                  }) : <>
                  <header>
                    <div><span>{config.editorTitle || "Cataloguseditor"}</span><h2>{config.itemIcon} {config.getName(item)}</h2></div>
                    <div className="catalog-framework__editor-actions">
                      <button type="button" onClick={() => { setNewItem(null); setOpenId(null); setDraft(null); }}>Annuleren</button>
                      <button type="button" className="is-save" onClick={() => save(item)} disabled={!onSave}>Wijzigingen bewaren</button>
                      {safeExternalUrl(draft.orderUrl) && <a className="is-order" href={safeExternalUrl(draft.orderUrl)} target="_blank" rel="noreferrer">Bestellen</a>}
                      <button type="button" className="is-primary" onClick={() => onPutOnTimeline(item)}>Zet op tijdlijn</button>
                      <button type="button" onClick={() => onAddToRoutine(item)}>Toevoegen aan routine</button>
                      {onDelete && <button type="button" className="is-danger" onClick={() => {
                        if (deleteConfirmId === item.id) {
                          onDelete(item);
                          setDeleteConfirmId(null);
                        } else {
                          setDeleteConfirmId(item.id);
                        }
                      }}>{deleteConfirmId === item.id ? "Zeker weten?" : "Verwijderen"}</button>}
                    </div>
                  </header>
                  <div className="catalog-framework__edit-form">
                    {config.editFields.map((field) => (
                      <label key={field.key} className={field.wide ? "is-wide" : ""}>{field.label}
                        {field.multiline ? <textarea rows="3" value={draft[field.key] ?? ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} /> : <span className={field.prefix ? "catalog-framework__prefixed-input" : undefined}>{field.prefix && <b>{field.prefix}</b>}<input type={field.type || "text"} inputMode={field.inputMode} min={field.min} step={field.step} value={draft[field.key] ?? ""} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} onBlur={() => field.format && setDraft({ ...draft, [field.key]: field.format(draft[field.key]) })} /></span>}
                      </label>
                    ))}
                  </div>
                  <dl>{config.detailFields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value(item) || "—"}</dd></div>)}</dl>
                  </>}
                </article>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
