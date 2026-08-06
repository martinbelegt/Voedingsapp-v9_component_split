import React from "react";

export default function CatalogActionBar({
  onAdd,
  onImport,
  onExport,
  message,
  addLabel = "＋ Supplement toevoegen",
  importLabel = "Importeren",
  exportLabel = "Exporteren",
  routineActions = null,
}) {
  return (
    <div className="catalog-action-bar" role="group" aria-label="Catalogusacties">
      <div className="catalog-action-bar__group catalog-action-bar__group--left">
        <button type="button" className="catalog-action-bar__button catalog-action-bar__button--primary" onClick={onAdd}>
          {addLabel}
        </button>
        <button type="button" className="catalog-action-bar__button" onClick={onImport}>
          {importLabel}
        </button>
        <button type="button" className="catalog-action-bar__button" onClick={onExport}>
          {exportLabel}
        </button>
      </div>
      {routineActions ? (
        <div className="catalog-action-bar__group catalog-action-bar__group--right">
          {routineActions}
        </div>
      ) : null}
      {message ? (
        <div className="catalog-action-bar__message" role="status">
          {message}
        </div>
      ) : null}
    </div>
  );
}
