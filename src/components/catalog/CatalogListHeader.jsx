import React from "react";
import "./catalogListHeader.css";

export default function CatalogListHeader({
  actionLabel,
  onAction,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onClearSearch,
  itemLabel,
  totalCount,
  visibleCount,
  filterLabel,
}) {
  return (
    <section className="catalog-list-header">
      <div className="catalog-list-header__toolbar">
        <label className="catalog-list-header__search">
          <span>Zoeken</span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </label>
        <button
          type="button"
          className="catalog-list-header__primary"
          onClick={onAction}
        >
          {actionLabel}
        </button>
        <button
          type="button"
          className="catalog-list-header__clear"
          onClick={onClearSearch}
          disabled={!searchValue}
        >
          Wis zoekveld
        </button>
      </div>

      <p className="catalog-list-header__hint">
        Tik op een {itemLabel} voor details.
      </p>

      <div className="catalog-list-header__total">
        Totaal {itemLabel === "product" ? "producten" : "supplementen"}:{" "}
        <strong>{totalCount}</strong>
        <span> • </span>
        Getoond: <strong>{visibleCount}</strong>
        <span> • </span>
        Filter: <strong>{filterLabel}</strong>
      </div>
    </section>
  );
}
