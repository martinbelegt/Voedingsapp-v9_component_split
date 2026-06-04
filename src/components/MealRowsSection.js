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
    totals,
    dayTotals,
    settings,

    quickSearch,
    setQuickSearch,
    quickSearchResults,
    quickAddProduct,
  } = props;

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const totalsChip = (bg, color) => ({
    background: bg,
    color,
    padding: isMobile ? "3px 8px" : "4px 9px",
    borderRadius: 999,
    fontSize: isMobile ? 11 : 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  });

  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  const previewTotals = {
    kh: round2((dayTotals?.kh || 0) + (totals?.kh || 0)),
    protein: round2((dayTotals?.protein || 0) + (totals?.protein || 0)),
    fat: round2((dayTotals?.fat || 0) + (totals?.fat || 0)),
    kcal: round2((dayTotals?.kcal || 0) + (totals?.kcal || 0)),
  };

  const dailyTargets = settings?.dailyTargets || {};
  const proteinGoal = Number(dailyTargets.proteinGoal) || 0;
  const targetKcal = Number(dailyTargets.targetKcal) || 0;

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

      {/* Snel product toevoegen + dagtotaal */}
      <div style={cardStyle}>
        <input
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder="Snel product toevoegen..."
          style={inputStyle}
        />

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#64748b",
              marginRight: 2,
            }}
          >
            Dagtotaal
          </span>

          <span style={totalsChip("#dbeafe", "#1d4ed8")}>
            KH {previewTotals.kh}g
          </span>

          <span style={totalsChip("#ede9fe", "#6d28d9")}>
            Eiwit {previewTotals.protein}g van {proteinGoal}g
          </span>

          <span style={totalsChip("#ffedd5", "#c2410c")}>
            Vet {previewTotals.fat}g
          </span>

          <span style={totalsChip("#dcfce7", "#166534")}>
            {previewTotals.kcal} van {targetKcal} kcal
          </span>
        </div>

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
