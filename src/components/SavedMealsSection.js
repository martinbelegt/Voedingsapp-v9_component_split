import React from "react";
import { SavedMealCard } from "./SavedMealCard";
import { getCategoryColor } from "../services/productHelpers";

export function SavedMealsSection(props) {
  const {
    categories,
    savedMeals,
    showSavedMeals,
    setShowSavedMeals,
    mealName,
    setMealName,
    mealServings,
    setMealServings,
    saveCurrentMeal,
    loadSavedMeal,
    appendSavedMeal,
    deleteSavedMeal,
    overwriteSavedMeal,
    products,
    cardStyle,
    buttonStyle,
    inputStyle,
  } = props;

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

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

  function editSavedMeal(id) {
    const meal = savedMeals.find((m) => m.id === id);
    if (!meal) return;

    const newName = window.prompt("Nieuwe naam:", meal.name);
    if (newName === null) return;

    overwriteSavedMeal(id, meal.rows, newName);
  }

  return (
    <div
      style={{
        ...cardStyle,
        marginBottom: isMobile ? 0 : 16,
        padding: isMobile ? 4 : cardStyle?.padding,
        border: isMobile ? "1px solid #e5e7eb" : cardStyle?.border,
      }}
    >
      <button
        onClick={() => setShowSavedMeals((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          height: isMobile ? 32 : undefined,
          minHeight: isMobile ? 32 : undefined,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: getCategoryColor(categories, "cat-maaltijden"),
          border: "1px solid #d8b4fe",
          color: "#4c1d95",
          fontWeight: 700,
          padding: isMobile ? "4px 8px" : undefined,
          fontSize: isMobile ? 12 : undefined,
          lineHeight: isMobile ? 1.05 : undefined,
          borderRadius: isMobile ? 6 : buttonStyle?.borderRadius,
          boxSizing: "border-box",
        }}
      >
        <span>Standaardmaaltijden ({savedMeals.length})</span>
        <span>{showSavedMeals ? "▲" : "▼"}</span>
      </button>

      {showSavedMeals && (
        <div style={{ marginTop: isMobile ? 4 : 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "2fr auto",
              gap: isMobile ? 4 : 8,
              marginBottom: isMobile ? 5 : 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 90px",
                gap: isMobile ? 4 : 6,
              }}
            >
              <input
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                style={dashboardInputStyle}
                placeholder="Naam van maaltijd"
              />

              <input
                type="number"
                min="1"
                value={mealServings}
                onChange={(e) => setMealServings(Number(e.target.value) || 1)}
                style={dashboardInputStyle}
                placeholder="Porties"
              />
            </div>

            <button
              onClick={saveCurrentMeal}
              style={{
                ...dashboardButtonStyle,
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                fontWeight: 700,
              }}
            >
              Opslaan huidige maaltijd
            </button>
          </div>

          <div style={{ display: "grid", gap: isMobile ? 4 : 8 }}>
            {savedMeals.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Nog geen standaardmaaltijden opgeslagen.
              </div>
            )}

            {savedMeals.map((meal, index) => (
              <SavedMealCard
                key={meal.id}
                meal={meal}
                index={index}
                products={products}
                onLoad={loadSavedMeal}
                onAppend={appendSavedMeal}
                onDelete={deleteSavedMeal}
                onEdit={editSavedMeal}
                buttonStyle={buttonStyle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
