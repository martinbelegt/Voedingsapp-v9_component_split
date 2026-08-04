import React, { useMemo, useState } from "react";
import "./selectionBuilder.css";

export default function SelectionBuilder({
  title,
  eyebrow = "Selection Builder",
  fields,
  selectedItems,
  catalogItems,
  categories = [],
  getItemId = (item) => item.id,
  getItemName = (item) => item.name,
  getItemCategoryId = (item) => item.categoryId,
  isItemFavorite = (item) => Boolean(item.favorite),
  onAddItem,
  isItemSelected = () => false,
  renderSelectedItem,
  renderSummary,
  onSave,
  onCancel,
  saveDisabled = false,
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortDirection, setSortDirection] = useState("asc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nl");
    return catalogItems
      .filter((item) => (categoryId === "all" || getItemCategoryId(item) === categoryId) &&
        (!favoritesOnly || isItemFavorite(item)) &&
        (!normalizedQuery || getItemName(item).toLocaleLowerCase("nl").includes(normalizedQuery)))
      .sort((a, b) => getItemName(a).localeCompare(getItemName(b), "nl", { sensitivity: "base" }) * (sortDirection === "asc" ? 1 : -1));
  }, [catalogItems, categoryId, favoritesOnly, getItemCategoryId, getItemName, isItemFavorite, query, sortDirection]);

  return (
    <section className="selection-builder" aria-label={title}>
      <div className="selection-builder__workspace">
        <header className="selection-builder__header">
          <div><span>{eyebrow}</span><h2>{title}</h2></div>
          <div><button type="button" onClick={onCancel}>Annuleren</button><button type="button" className="is-primary" onClick={onSave} disabled={saveDisabled}>Opslaan</button></div>
        </header>
        <div className="selection-builder__fields">{fields}</div>
        <div className="selection-builder__parts">
          <div className="selection-builder__section-title"><span>Onderdelen</span><strong>{selectedItems.length}</strong></div>
          {!selectedItems.length && <div className="selection-builder__empty"><strong>Nog geen onderdelen</strong><span>Voeg producten toe vanuit de catalogus.</span></div>}
          <div className="selection-builder__selected-list">{selectedItems.map(renderSelectedItem)}</div>
        </div>
        {renderSummary?.()}
      </div>

      <aside className="selection-builder__catalog" aria-label="Beschikbare catalogusitems">
        <header><div><span>Catalogus</span><h3>Producten toevoegen</h3></div><strong>{visibleItems.length}</strong></header>
        <div className="selection-builder__catalog-tools" role="toolbar" aria-label="Buildercatalogus bedienen">
          <button type="button" onClick={() => setSortDirection((value) => value === "asc" ? "desc" : "asc")} aria-label="Alfabetisch sorteren">{sortDirection === "asc" ? "A–Z" : "Z–A"}</button>
          <button type="button" className={favoritesOnly ? "is-active" : ""} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((value) => !value)}>★ Favorieten</button>
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Filter op categorie"><option value="all">Alle categorieën</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name || category.label}</option>)}</select>
          <label><span>Zoeken</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek product..." /></label>
        </div>
        <div className="selection-builder__catalog-list">
          {!visibleItems.length && <div className="selection-builder__empty"><strong>Geen producten gevonden</strong><span>Pas je zoekopdracht of filters aan.</span></div>}
          {visibleItems.map((item) => { const selected = isItemSelected(item); return <button key={getItemId(item)} type="button" className="selection-builder__catalog-row" onClick={() => onAddItem(item)} aria-label={selected ? `${getItemName(item)} is toegevoegd` : `Voeg ${getItemName(item)} toe`} disabled={selected}><span aria-hidden="true">{selected ? "✓" : "＋"}</span><strong>{getItemName(item)}</strong>{isItemFavorite(item) && <em aria-label="Favoriet">★</em>}</button>; })}
        </div>
      </aside>
    </section>
  );
}
