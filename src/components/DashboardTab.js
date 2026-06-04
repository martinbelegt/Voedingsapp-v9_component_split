import React from "react";
import { ResultCard } from "./ResultCard";
import { SavedMealsSection } from "./SavedMealsSection";
import { FavoritesSection } from "./FavoritesSection";
import { QuickAddSection } from "./QuickAddSection";
import { MealRowsSection } from "./MealRowsSection";
import { CategoryFilterSection } from "./CategoryFilterSection";

export function DashboardTab(props) {
  const {
    categories,
    products,
    dayMealTime,
    setDayMealTime,
    savedMealProps,
    favoritesProps,
    quickAddProps,
    categoryFilterProps,
    mealRowsProps,
    dailyMealProps,
    totals,
    uiStyles,
  } = props;

  const { cardStyle, buttonStyle, inputStyle, labelStyle } = uiStyles;

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const dashboardGap = isMobile ? 8 : 16;

  const totalsChip = (bg, color) => ({
    background: bg,
    color,
    padding: isMobile ? "3px 8px" : "4px 9px",
    borderRadius: 999,
    fontSize: isMobile ? 11 : 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  });

  return (
    <>
      <div
        style={{
          display: "grid",
          gap: dashboardGap,
          marginBottom: isMobile ? 8 : 16,
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#f8fafc",
          paddingBottom: isMobile ? 4 : 8,
        }}
      >
        <ResultCard totals={totals} rowsWithCalc={mealRowsProps.rowsWithCalc} />

        <CategoryFilterSection
          {...categoryFilterProps}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
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
          dayMealTime={dayMealTime}
          setDayMealTime={setDayMealTime}
        />
      </div>

      <div style={{ display: "grid", gap: dashboardGap }}>
        <MealRowsSection
          {...mealRowsProps}
          {...quickAddProps}
          categories={categories}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
          totals={totals}
          dayTotals={props.dayTotals}
        />
      </div>
    </>
  );
}
