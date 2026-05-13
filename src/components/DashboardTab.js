import React from "react";
import { ResultCard } from "./ResultCard";
import { TestLogSection } from "./TestLogSection";
import { SavedMealsSection } from "./SavedMealsSection";
import { FavoritesSection } from "./FavoritesSection";
import { QuickAddSection } from "./QuickAddSection";
import { MealRowsSection } from "./MealRowsSection";
import { CategoryFilterSection } from "./CategoryFilterSection";

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

        <CategoryFilterSection
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categoryFilterOptions={categoryFilterOptions}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />

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
