import React from "react";
import { SavedMealsSection } from "./SavedMealsSection";
import { FavoritesSection } from "./FavoritesSection";
import { QuickAddSection } from "./QuickAddSection";
import { MealRowsSection } from "./MealRowsSection";

export function DashboardTab(props) {
  const {
    categories,
    products,
    dayMealTime,
    setDayMealTime,
    savedMealProps,
    favoritesProps,
    quickAddProps,
    mealRowsProps,
    dailyMealProps,
    totals,
    uiStyles,
  } = props;

  const { cardStyle, buttonStyle, inputStyle, labelStyle } = uiStyles;

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const dashboardGap = isMobile ? 8 : 16;

  return (
    <>
      <div
        style={{
          display: "grid",
          gap: dashboardGap,
          marginTop: isMobile ? 8 : 12,
          marginBottom: dashboardGap,
        }}
      >
        {isMobile ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.35fr 0.85fr",
              gap: 4,
              alignItems: "start",
            }}
          >
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
          </div>
        ) : (
          <>
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
          </>
        )}
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
          settings={props.settings}
        >
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
        </MealRowsSection>
      </div>
    </>
  );
}
