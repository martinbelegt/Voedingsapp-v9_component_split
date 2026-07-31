import React, { useMemo, useState } from "react";
import "./libraryWorkspace.css";
import CatalogListHeader from "../catalog/CatalogListHeader";

function matchesQuery(item, query, searchableFields) {
  const normalizedQuery = query.trim().toLocaleLowerCase("nl");
  if (!normalizedQuery) return true;

  return searchableFields.some((field) =>
    String(item[field] || "")
      .toLocaleLowerCase("nl")
      .includes(normalizedQuery),
  );
}

function LibrarySidebar({
  title,
  searchPlaceholder,
  query,
  onQueryChange,
  categories,
  activeCategory,
  onCategoryChange,
  itemCount,
  action,
  compact,
  children,
  categorySectionOpen,
  onToggleCategorySection,
  visibleItemCount,
  singularLabel,
  activeCategoryLabel,
  onAddItem,
}) {
  return (
    <aside className={`companion-library__panel companion-library__sidebar${compact ? " is-compact" : ""}`}>
      {!compact && <div className="companion-library__panel-heading">
        <div>
          <p className="companion-library__eyebrow">Bibliotheek</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>}

      {!compact && <label className="companion-library__search">
        <span>Zoeken</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
      </label>}

      {compact && onToggleCategorySection && (
        <button
          type="button"
          className="companion-library__category-toggle catalog-category-toggle"
          onClick={onToggleCategorySection}
          aria-expanded={categorySectionOpen}
        >
          <span>Categoriebeheer</span>
          <span>{categorySectionOpen ? "▲" : "▼"}</span>
        </button>
      )}

      {!compact && <div className="companion-library__filter-group">
        <div className="companion-library__filter-heading">
          <span>Categorieën</span>
          {!compact && <small>{itemCount}</small>}
        </div>
        <div className="companion-library__categories">
          <button
            type="button"
            className={activeCategory === "all" ? "is-active" : ""}
            onClick={() => onCategoryChange("all")}
          >
            <span>Alle items</span>
            {!compact && <span>{itemCount}</span>}
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={activeCategory === category.id ? "is-active" : ""}
              onClick={() => onCategoryChange(category.id)}
            >
              <span>{category.name || category.label}</span>
              {!compact && <span>{category.count}</span>}
            </button>
          ))}
        </div>
      </div>}

      {!compact && <div className="companion-library__future-filters">
        <span>Filters</span>
        <p>Ruimte voor toekomstige filters</p>
      </div>}
      {(!compact || categorySectionOpen) && children}

      {compact && (
        <CatalogListHeader
          actionLabel="Nieuw supplement"
          onAction={onAddItem}
          searchPlaceholder={searchPlaceholder}
          searchValue={query}
          onSearchChange={onQueryChange}
          onClearSearch={() => onQueryChange("")}
          itemLabel={singularLabel}
          totalCount={itemCount}
          visibleCount={visibleItemCount}
          filterLabel={activeCategoryLabel}
        />
      )}
    </aside>
  );
}

function LibraryList({
  title,
  items,
  selectedId,
  onSelect,
  getItemTitle,
  getItemMeta,
  emptyMessage,
  headerAction,
  renderItemContent,
}) {
  return (
    <section className="companion-library__panel companion-library__list-panel">
      <header className="companion-library__list-header">
        <div>
          <p className="companion-library__eyebrow">Overzicht</p>
          <h2>{title}</h2>
        </div>
        <div className="companion-library__list-actions">
          <span>{items.length} items</span>
          {headerAction}
        </div>
      </header>

      <div className="companion-library__list" role="listbox" aria-label={title}>
        {items.length === 0 ? (
          <div className="companion-library__empty">{emptyMessage}</div>
        ) : (
          items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <button
                type="button"
                role="option"
                aria-selected={selected}
                key={item.id}
                className={`companion-library__list-item${
                  selected ? " is-selected" : ""
                }`}
                onClick={() => onSelect(item.id)}
              >
                {renderItemContent ? (
                  renderItemContent(item)
                ) : (
                  <>
                    <span>{getItemTitle(item)}</span>
                    <small>{getItemMeta(item)}</small>
                  </>
                )}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

function EmptyDetail({ singularLabel }) {
  return (
    <div className="companion-library__detail-empty">
      <div aria-hidden="true">◇</div>
      <h2>Selecteer een {singularLabel}</h2>
      <p>Kies een item uit de lijst om de details te bekijken.</p>
    </div>
  );
}

function LibraryDetail({ item, detailConfig, singularLabel }) {
  if (!item) return <EmptyDetail singularLabel={singularLabel} />;

  return (
    <article className="companion-library__detail">
      <header className="companion-library__detail-header">
        <div>
          <p className="companion-library__eyebrow">{singularLabel}</p>
          <h1>{item[detailConfig.titleField] || "Naam nog invullen"}</h1>
          <span>
            {item[detailConfig.categoryField] || "Categorie nog invullen"}
          </span>
        </div>
        <div className="companion-library__image-placeholder">
          {item[detailConfig.imageField] ? (
            <img
              src={item[detailConfig.imageField]}
              alt={item[detailConfig.titleField]}
            />
          ) : (
            <>
              <span aria-hidden="true">＋</span>
              <small>Afbeelding</small>
            </>
          )}
        </div>
      </header>

      <dl className="companion-library__detail-fields">
        {detailConfig.fields.map((field) => (
          <div key={field.key} className={field.wide ? "is-wide" : ""}>
            <dt>{field.label}</dt>
            <dd>{item[field.key] || field.placeholder}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export default function LibraryWorkspace({
  config,
  items,
  categories,
  selectedId,
  onSelect,
  renderDetail,
  listHeaderAction,
  categoryAction,
  layout,
  children,
  categorySectionOpen,
  onToggleCategorySection,
  onAddItem,
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        count: items.filter(
          (item) =>
            (config.getCategoryIds
              ? config.getCategoryIds(item)
              : [
                  config.getCategoryId
                    ? config.getCategoryId(item)
                    : item[config.categoryIdField],
                ]
            ).includes(category.id),
        ).length,
      })),
    [categories, config.categoryIdField, config.getCategoryId, config.getCategoryIds, items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeCategory === "all" ||
            (config.getCategoryIds
              ? config.getCategoryIds(item)
              : [
                  config.getCategoryId
                    ? config.getCategoryId(item)
                    : item[config.categoryIdField],
                ]
            ).includes(activeCategory)) &&
          (config.matchesQuery
            ? config.matchesQuery(item, query)
            : matchesQuery(item, query, config.searchableFields)),
      ),
    [
      activeCategory,
      config.categoryIdField,
      config.getCategoryId,
      config.getCategoryIds,
      config.searchableFields,
      config.matchesQuery,
      items,
      query,
    ],
  );

  const selectedItem = items.find((item) => item.id === selectedId) || null;

  return (
    <main className={`companion-library${layout ? ` is-${layout}` : ""}`} aria-label={`${config.title}bibliotheek`}>
      <LibrarySidebar
        title={config.title}
        searchPlaceholder={config.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        categories={categoryOptions}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        itemCount={items.length}
        action={categoryAction}
        compact={layout === "supplements"}
        categorySectionOpen={categorySectionOpen}
        onToggleCategorySection={onToggleCategorySection}
        visibleItemCount={filteredItems.length}
        singularLabel={config.singularLabel}
        activeCategoryLabel={
          activeCategory === "all"
            ? "all"
            : categoryOptions.find((category) => category.id === activeCategory)
                ?.name ||
              categoryOptions.find((category) => category.id === activeCategory)
                ?.label ||
              activeCategory
        }
        onAddItem={onAddItem}
      >
        {children}
      </LibrarySidebar>
      <LibraryList
        title={config.listTitle}
        items={filteredItems}
        selectedId={selectedId}
        onSelect={onSelect}
        getItemTitle={config.getItemTitle}
        getItemMeta={config.getItemMeta}
        emptyMessage={config.emptyMessage}
        headerAction={listHeaderAction}
        renderItemContent={config.renderItemContent}
      />
      <section className="companion-library__panel companion-library__detail-panel">
        {renderDetail ? (
          renderDetail(selectedItem)
        ) : (
          <LibraryDetail
            item={selectedItem}
            detailConfig={config.detail}
            singularLabel={config.singularLabel}
          />
        )}
      </section>
    </main>
  );
}
