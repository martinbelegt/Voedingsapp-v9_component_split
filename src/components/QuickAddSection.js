import React, { useState } from "react";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";

export function QuickAddSection(props) {
  const {
    dayMealMoment,
    setDayMealMoment,
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

  const [flashAction, setFlashAction] = useState(null);

  function flash(name) {
    setFlashAction(name);
    setTimeout(() => setFlashAction(null), 650);
  }

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "170px 1fr 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <select
          value={dayMealMoment}
          onChange={(e) => setDayMealMoment(e.target.value)}
          style={inputStyle}
        >
          <option value="breakfast">Ontbijt</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Diner</option>
          <option value="snack">Snack</option>
          <option value="sport">Sport</option>
          <option value="dessert">Toetje</option>
          <option value="fruit">Fruit</option>
          <option value="neutral">Algemeen</option>
        </select>

        <button
          onClick={() => {
            addCurrentMealToSelectedDay();
            flash("add");
          }}
          style={{
            ...buttonStyle,
            background: flashAction === "add" ? "#22c55e" : "#dcfce7",
            color: flashAction === "add" ? "white" : "#166534",
            border: "1px solid #86efac",
            fontWeight: 700,
          }}
        >
          Voeg toe aan dag
        </button>

        <button
          onClick={() => {
            addCurrentMealToSelectedDayAndClear();
            flash("addClear");
          }}
          style={{
            ...buttonStyle,
            background: flashAction === "addClear" ? "#2563eb" : "#eff6ff",
            color: flashAction === "addClear" ? "white" : "#1d4ed8",
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
