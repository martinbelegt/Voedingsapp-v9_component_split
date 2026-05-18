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

    categoryFilterProps,

    mealRowsProps,

    totals,

    quickAddProps,

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
        <ResultCard totals={totals} rowsWithCalc={mealRowsProps.rowsWithCalc} />

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
          {...quickAddProps}
          categories={categories}
          cardStyle={cardStyle}
          inputStyle={inputStyle}
          buttonStyle={buttonStyle}
        />
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <CategoryFilterSection
          {...categoryFilterProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />

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
