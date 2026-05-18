import React from "react";
import { ResultCard } from "./ResultCard";
import { SavedMealsSection } from "./SavedMealsSection";
import { FavoritesSection } from "./FavoritesSection";
import { QuickAddSection } from "./QuickAddSection";
import { MealRowsSection } from "./MealRowsSection";
import { CategoryFilterSection } from "./CategoryFilterSection";
import { MealTimersCard } from "./MealTimersCard";

export function DashboardTab(props) {
  const {
    dailyMealProps,

    categories,
    products,

    savedMealProps,

    favoritesProps,

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

    timerProps,

    uiStyles,
  } = props;

  const { cardStyle, buttonStyle, primaryButtonStyle, inputStyle, labelStyle } =
    uiStyles;

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

        <MealTimersCard
          {...timerProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          primaryButtonStyle={primaryButtonStyle}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />

        <SavedMealsSection
          categories={categories}
          {...savedMealProps}
          products={products}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          inputStyle={inputStyle}
        />

        <FavoritesSection
          categories={categories}
          {...favoritesProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />

        <QuickAddSection
          {...dailyMealProps}
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

        <CategoryFilterSection
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categoryFilterOptions={categoryFilterOptions}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />
      </div>
    </>
  );
}
