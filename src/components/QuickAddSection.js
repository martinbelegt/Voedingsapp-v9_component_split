import React from "react";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";

export function QuickAddSection(props) {
  const {
    dayMealName,
    setDayMealName,
    addCurrentMealToSelectedDay,
    addCurrentMealToSelectedDayAndClear,
    quickSearch,
    setQuickSearch,
    quickSearchResults,
    quickAddProduct,
    categories,
    cardStyle,
    inputStyle,
    buttonStyle,
  } = props;

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          value={dayMealName}
          onChange={(e) => setDayMealName(e.target.value)}
          style={inputStyle}
          placeholder="Naam voor daglog, bv. Ontbijt / Lunch / Avondeten"
        />

        <button
          onClick={addCurrentMealToSelectedDay}
          style={{
            ...buttonStyle,
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #86efac",
            fontWeight: 700,
          }}
        >
          Voeg toe aan dag
        </button>

        <button
          onClick={addCurrentMealToSelectedDayAndClear}
          style={{
            ...buttonStyle,
            background: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            fontWeight: 700,
          }}
        >
          Voeg toe en start nieuwe maaltijd
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
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
    </div>
  );
}
