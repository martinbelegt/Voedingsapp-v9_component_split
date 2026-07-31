import React from "react";
import "./catalogCategoryManager.css";

const FALLBACK_COLORS = [
  "#fef3c7",
  "#fde68a",
  "#dbeafe",
  "#dcfce7",
  "#bbf7d0",
  "#fee2e2",
  "#e9d5ff",
  "#fef9c3",
  "#e0f2fe",
  "#ede9fe",
];

export default function CatalogCategoryManager({
  categories,
  value,
  onValueChange,
  onAdd,
  onRename,
  onDelete,
  isProtected = () => false,
  error,
}) {
  return (
    <section className="catalog-category-manager" aria-label="Categoriebeheer">
      <form
        className="catalog-category-manager__form"
        onSubmit={(event) => {
          event.preventDefault();
          onAdd();
        }}
      >
        <input
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Nieuwe categorienaam"
          aria-label="Nieuwe categorienaam"
        />
        <button type="submit">Categorie toevoegen</button>
      </form>
      {error && <p className="catalog-category-manager__error">{error}</p>}
      <div className="catalog-category-manager__items">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="catalog-category-manager__item"
            style={{ background: category.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
          >
            <strong>{category.name}</strong>
            {!isProtected(category) && (
              <>
                <button type="button" onClick={() => onRename(category)}>Wijzigen</button>
                <button type="button" className="is-danger" onClick={() => onDelete(category)}>Verwijder</button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
