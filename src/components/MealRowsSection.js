import React, { useState } from "react";
import { ResultCard } from "./ResultCard";
import { MealRowCard } from "./MealRowCard";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";

export function MealRowsSection(props) {
  const {
    rowsWithCalc,
    filteredProducts,
    categories,
    updateRow,
    removeRow,
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
    children,
  } = props;

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const [showMealAnalysis, setShowMealAnalysis] = useState(false);

  const totalsChip = (bg, color) => ({
    background: bg,
    color,
    padding: isMobile ? "3px 8px" : "4px 9px",
    borderRadius: 999,
    fontSize: isMobile ? 11 : 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  });

  const dashboardInputStyle = {
    ...inputStyle,
    ...(isMobile
      ? {
          padding: "5px 8px",
          minHeight: 34,
          fontSize: 16,
          lineHeight: 1.1,
          borderRadius: 6,
        }
      : {}),
  };

  const quickSearchInputStyle = {
    ...dashboardInputStyle,
    background: "#ffffff",
    border: "1px solid #86efac",
  };

  const dashboardButtonStyle = {
    ...buttonStyle,
    ...(isMobile
      ? {
          padding: "4px 8px",
          minHeight: 32,
          fontSize: 12,
          lineHeight: 1.05,
          borderRadius: 6,
        }
      : {}),
  };

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
      <div
        style={{
          ...cardStyle,
          padding: isMobile ? 7 : cardStyle?.padding,
          border: "1px solid #bbf7d0",
          background: "#f0fdf4",
        }}
      >
        <div
          style={{
            marginBottom: isMobile ? 5 : 8,
            fontSize: isMobile ? 13 : 15,
            fontWeight: 900,
            color: "#166534",
          }}
        >
          Snel product kiezen
        </div>

        <input
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          placeholder="Zoek product..."
          style={quickSearchInputStyle}
        />

        {quickSearch && (
          <div
            style={{
              marginTop: isMobile ? 4 : 6,
              display: "grid",
              gap: isMobile ? 3 : 4,
            }}
          >
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
                  ...dashboardButtonStyle,
                  textAlign: "left",
                  background: getCategoryColor(categories, p.categoryId),
                }}
              >
                {getCategoryName(categories, p.categoryId)} | {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

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

      {children}

      <div
        style={{
          ...cardStyle,
          padding: isMobile ? 7 : cardStyle?.padding,
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 13 : 15,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: isMobile ? 5 : 8,
          }}
        >
          Dagtotaal
        </div>

        <div
          style={{
            display: "flex",
            gap: isMobile ? 4 : 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
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
      </div>

      <button
        onClick={() => setShowMealAnalysis((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          marginTop: isMobile ? 4 : 8,
          marginBottom: isMobile ? 5 : 10,
          ...(isMobile
            ? {
                padding: "4px 8px",
                minHeight: 32,
                fontSize: 12,
                lineHeight: 1.05,
                borderRadius: 6,
              }
            : {}),
          background: showMealAnalysis ? "#dbeafe" : "#f8fafc",
          border: "1px solid #93c5fd",
          color: "#1d4ed8",
          fontWeight: 800,
          textAlign: "center",
        }}
      >
        {showMealAnalysis ? "Maaltijdanalyse verbergen" : "Maaltijdanalyse"}
      </button>

      {showMealAnalysis && (
        <ResultCard
          totals={totals}
          rowsWithCalc={rowsWithCalc}
          buttonStyle={buttonStyle}
          forceDetailOpen={true}
          onForceClose={() => setShowMealAnalysis(false)}
        />
      )}
    </>
  );
}
