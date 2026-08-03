import React from "react";
import "./catalogToolbar.css";

export default function CatalogToolbar({
  query,
  onQueryChange,
  sortDirection,
  onToggleAlphabetical,
  onReverse,
  onExpand,
  onCollapse,
  searchPlaceholder,
}) {
  return (
    <div className="catalog-toolbar" role="toolbar" aria-label="Catalogusbediening">
      <button type="button" onClick={onReverse} title="Huidige volgorde omkeren">⇅ Omkeren</button>
      <button type="button" onClick={onToggleAlphabetical} title="Alfabetische sorteerrichting wijzigen">{sortDirection === "asc" ? "A–Z" : "Z–A"}</button>
      <button type="button" onClick={onExpand} title="Geselecteerde regel uitklappen">▼ Alles uitklappen</button>
      <button type="button" onClick={onCollapse}>▲ Alles inklappen</button>
      <label>
        <span className="catalog-toolbar__sr-only">Zoeken</span>
        <input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={searchPlaceholder} />
      </label>
    </div>
  );
}
