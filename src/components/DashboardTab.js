import React, { useState } from "react";
import { ResultCard } from "./ResultCard";
import { SavedMealCard } from "./SavedMealCard";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";
import { TestLogSection } from "./TestLogSection";
import { SavedMealsSection } from "./SavedMealsSection";
import { FavoritesSection } from "./FavoritesSection";
import { QuickAddSection } from "./QuickAddSection";
import { MealRowsSection } from "./MealRowsSection";

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

        <FavoritesSection
          categories={categories}
          favoriteProducts={favoriteProducts}
          showFavorites={showFavorites}
          setShowFavorites={setShowFavorites}
          quickAddProduct={quickAddProduct}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />

        <QuickAddSection
          dayMealName={dayMealName}
          setDayMealName={setDayMealName}
          addCurrentMealToSelectedDay={addCurrentMealToSelectedDay}
          addCurrentMealToSelectedDayAndClear={
            addCurrentMealToSelectedDayAndClear
          }
          quickSearch={quickSearch}
          setQuickSearch={setQuickSearch}
          quickSearchResults={quickSearchResults}
          quickAddProduct={quickAddProduct}
          categories={categories}
          cardStyle={cardStyle}
          inputStyle={inputStyle}
          buttonStyle={buttonStyle}
        />
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <MealRowsSection
          rowsWithCalc={rowsWithCalc}
          filteredProducts={filteredProducts}
          categories={categories}
          updateRow={updateRow}
          removeRow={removeRow}
          addRow={addRow}
          clearMeal={clearMeal}
          newRowRef={newRowRef}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />

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
