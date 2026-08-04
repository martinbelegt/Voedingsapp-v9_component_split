import React from "react";
import "./catalogToolbar.css";

export default function CatalogToolbar({
  query,
  onQueryChange,
  sortDirection,
  favoritesOnly,
  onToggleFavorites,
  activeView,
  showMeals,
  onShowMeals,
  onShowCategories,
  catalogLabel,
  addLabel,
  onAddNew,
  onToggleAlphabetical,
  searchPlaceholder,
}) {
  return (
    <div className="catalog-toolbar" role="toolbar" aria-label="Catalogusbediening">
      <button type="button" onClick={onToggleAlphabetical} title="Alfabetisch sorteren" aria-label={`Alfabetisch ${sortDirection === "asc" ? "A tot Z" : "Z tot A"}`}>{sortDirection === "asc" ? "A–Z" : "Z–A"}</button>
      <button type="button" className={favoritesOnly ? "is-active" : ""} aria-pressed={favoritesOnly} onClick={onToggleFavorites} title="Alleen favorieten" aria-label="Alleen favorieten">★</button>
      {showMeals && <button type="button" className={`catalog-toolbar__meal-switch${activeView === "meals" ? " is-active" : ""}`} aria-pressed={activeView === "meals"} onClick={onShowMeals}>{activeView === "meals" ? "Producten" : "Maaltijden"}</button>}
      <button type="button" className={activeView === "categories" ? "is-active" : ""} aria-pressed={activeView === "categories"} onClick={onShowCategories}>{activeView === "categories" ? catalogLabel : "Categorieën"}</button>
      {onAddNew && <button type="button" className="catalog-toolbar__add" onClick={onAddNew}>＋ {addLabel}</button>}
      <label>
        <span className="catalog-toolbar__sr-only">Zoeken</span>
        <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={searchPlaceholder} />
      </label>
    </div>
  );
}
