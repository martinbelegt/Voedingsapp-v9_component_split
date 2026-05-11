import React, { useState } from "react";
import { ResultCard } from "./ResultCard";
import { SavedMealCard } from "./SavedMealCard";
import { MealRowCard } from "./MealRowCard";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";
import { TestLogSection } from "./TestLogSection";
import { SavedMealsSection } from "./SavedMealsSection";

export function DashboardTab(props) {
  const {
    dayMealName,
    setDayMealName,
    addCurrentMealToSelectedDay,
    addCurrentMealToSelectedDayAndClear,
    categories,
    products,
    savedMeals,
    showSavedMeals,
    setShowSavedMeals,
    mealName,
    setMealName,
    saveCurrentMeal,
    loadSavedMeal,
    deleteSavedMeal,
    favoriteProducts,
    showFavorites,
    setShowFavorites,
    quickAddProduct,
    categoryFilter,
    setCategoryFilter,
    categoryFilterOptions,
    rowsWithCalc,
    filteredProducts,
    updateRow,
    removeRow,
    addRow,
    clearMeal,
    newRowRef,
    totals,
    quickSearch,
    setQuickSearch,
    quickSearchResults,
    testLog,
    testLogForm,
    setTestLogForm,
    bristolOptions,
    addTestLogEntry,
    deleteTestLogEntry,
    cardStyle,
    buttonStyle,
    primaryButtonStyle,
    inputStyle,
    labelStyle,
  } = props;

  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  return (
    <>
      <div
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 16,
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#f8fafc",
          paddingBottom: 8,
        }}
      >
        <ResultCard totals={totals} rowsWithCalc={rowsWithCalc} />

        <SavedMealsSection
          categories={categories}
          savedMeals={savedMeals}
          showSavedMeals={showSavedMeals}
          setShowSavedMeals={setShowSavedMeals}
          mealName={mealName}
          setMealName={setMealName}
          saveCurrentMeal={saveCurrentMeal}
          loadSavedMeal={loadSavedMeal}
          deleteSavedMeal={deleteSavedMeal}
          products={products}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          inputStyle={inputStyle}
        />

        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <button
            onClick={() => setShowFavorites((v) => !v)}
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#9a3412",
              fontWeight: 700,
            }}
          >
            <span>Favorieten ({favoriteProducts.length})</span>
            <span>{showFavorites ? "▲" : "▼"}</span>
          </button>

          {showFavorites && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 12,
              }}
            >
              {favoriteProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => quickAddProduct(p.id)}
                  style={{
                    ...buttonStyle,
                    background: getCategoryColor(categories, p.categoryId),
                    border: "1px solid rgba(148,163,184,0.35)",
                    color: "#0f172a",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    padding: "10px 12px",
                    fontWeight: 700,
                  }}
                  title={`${getCategoryName(categories, p.categoryId)} | ${
                    p.name
                  }`}
                >
                  ★ {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

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
      </div>

      <div style={{ display: "grid", gap: 16 }}>
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

        <div style={cardStyle}>
          <button
            onClick={() => setShowCategoryFilter((v) => !v)}
            style={{
              ...buttonStyle,
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Categorie filter</span>
            <span>{showCategoryFilter ? "▲" : "▼"}</span>
          </button>

          {showCategoryFilter && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {categoryFilterOptions.map((c) => {
                const isActive = c.id === categoryFilter;
                const bg = c.id === "all" ? "#f8fafc" : c.color;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    style={{
                      ...buttonStyle,
                      background: isActive ? "#0f172a" : bg,
                      color: isActive ? "white" : "#0f172a",
                      border: isActive
                        ? "1px solid #0f172a"
                        : "1px solid #dbe3ee",
                    }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <TestLogSection
          testLog={testLog}
          testLogForm={testLogForm}
          setTestLogForm={setTestLogForm}
          bristolOptions={bristolOptions}
          addTestLogEntry={addTestLogEntry}
          deleteTestLogEntry={deleteTestLogEntry}
          cardStyle={cardStyle}
          inputStyle={inputStyle}
          buttonStyle={buttonStyle}
          primaryButtonStyle={primaryButtonStyle}
          labelStyle={labelStyle}
        />
      </div>
    </>
  );
}
