import React from "react";
import { MealRowCard } from "./MealRowCard";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";

export function MealRowsSection(props) {
  const {
    rowsWithCalc,
    filteredProducts,
    categories,
    updateRow,
    removeRow,
    addRow,
    clearMeal,
    newRowRef,
    cardStyle,
    buttonStyle,
    inputStyle,
    labelStyle,

    quickSearch,
    setQuickSearch,
    quickSearchResults,
    quickAddProduct,
  } = props;

  return (
    <>
      {/* Knoppen voor huidige maaltijd */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
        >
          <button onClick={addRow} style={buttonStyle}>
            Rij toevoegen
          </button>

          <button
            onClick={clearMeal}
            style={{
              ...buttonStyle,
              background: "#dbeafe",
              color: "#1d4ed8",
              border: "1px solid #93c5fd",
              fontWeight: 700,
            }}
          >
            Nieuwe maaltijd
          </button>
        </div>
      </div>

      {/* Snel product toevoegen */}
      <div style={cardStyle}>
        <input
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder="Snel product toevoegen..."
          style={inputStyle}
        />

        {quickSearch && (
          <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
            {quickSearchResults.length === 0 && (
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Geen resultaten
              </div>
            )}

            {quickSearchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  quickAddProduct(p.id);
                  setQuickSearch("");
                }}
                style={{
                  ...buttonStyle,
                  textAlign: "left",
                  padding: "6px 8px",
                  fontSize: 13,
                  background: getCategoryColor(categories, p.categoryId),
                }}
              >
                {getCategoryName(categories, p.categoryId)} | {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Productregels van de huidige maaltijd */}
      {rowsWithCalc.map((r, idx) => (
        <MealRowCard
          key={r.id}
          index={idx}
          row={r}
          products={filteredProducts}
          categories={categories}
          onChange={updateRow}
          onRemove={removeRow}
          newRowRef={newRowRef}
          isLastRow={idx === rowsWithCalc.length - 1}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
          buttonStyle={buttonStyle}
          getCategoryColor={getCategoryColor}
        />
      ))}
    </>
  );
}
