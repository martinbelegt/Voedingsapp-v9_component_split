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
    categories,
    products,

    savedMealProps,
    favoritesProps,
    quickAddProps,
    categoryFilterProps,
    mealRowsProps,
    dailyMealProps,
    timerProps,

    totals,
    uiStyles,
  } = props;

  const { cardStyle, buttonStyle, primaryButtonStyle, inputStyle, labelStyle } =
    uiStyles;

  return (
    <>
      {/* Bovenste dashboardblok: totalen, timers en snelle acties */}
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
        {/* Maaltijdtotalen en berekende uitkomsten */}
        <ResultCard totals={totals} rowsWithCalc={mealRowsProps.rowsWithCalc} />

        {/* Maaltijd-timers: verzadiging, eetpauze, glucose en vertering */}
        <MealTimersCard
          {...timerProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          primaryButtonStyle={primaryButtonStyle}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />

        {/* Opgeslagen maaltijden */}
        <SavedMealsSection
          categories={categories}
          {...savedMealProps}
          products={products}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          inputStyle={inputStyle}
        />

        {/* Favoriete producten */}
        <FavoritesSection
          categories={categories}
          {...favoritesProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />

        {/* Snel producten zoeken en maaltijd toevoegen aan dag */}
        <QuickAddSection
          {...dailyMealProps}
          {...quickAddProps}
          categories={categories}
          cardStyle={cardStyle}
          inputStyle={inputStyle}
          buttonStyle={buttonStyle}
        />
      </div>

      {/* Onderste dashboardblok: categoriefilter en maaltijdregels */}
      <div style={{ display: "grid", gap: 16 }}>
        {/* Categoriefilter voor de productlijst */}
        <CategoryFilterSection
          {...categoryFilterProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />

        {/* Huidige maaltijdregels */}
        <MealRowsSection
          {...mealRowsProps}
          categories={categories}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />
      </div>
    </>
  );
}
