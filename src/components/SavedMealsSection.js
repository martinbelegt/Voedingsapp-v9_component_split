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
        marginBottom: window.innerWidth < 900 ? 4 : 16,
        padding: window.innerWidth < 900 ? 4 : cardStyle?.padding,
        border:
          window.innerWidth < 900 ? "1px solid #e5e7eb" : cardStyle?.border,
      }}
    >
      <button
        onClick={() => setShowSavedMeals((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: getCategoryColor(categories, "cat-maaltijden"),
          border: "1px solid #d8b4fe",
          color: "#4c1d95",
          fontWeight: 700,
          fontWeight: 700,
          padding: window.innerWidth < 900 ? "2px 8px" : undefined,
          fontSize: window.innerWidth < 900 ? 12 : undefined,
          lineHeight: window.innerWidth < 900 ? 1.1 : undefined,
          borderRadius: window.innerWidth < 900 ? 2 : buttonStyle?.borderRadius,
        }}
      >
        <span>Standaardmaaltijden ({savedMeals.length})</span>
        <span>{showSavedMeals ? "▲" : "▼"}</span>
      </button>

      {showSavedMeals && (
        <div style={{ marginTop: window.innerWidth < 900 ? 5 : 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: window.innerWidth < 900 ? "1fr" : "2fr auto",
              gap: window.innerWidth < 900 ? 5 : 8,
              marginBottom: window.innerWidth < 900 ? 6 : 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 90px",
                gap: 6,
              }}
            >
              <input
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                style={inputStyle}
                placeholder="Naam van maaltijd"
              />

              <input
                type="number"
                min="1"
                value={mealServings}
                onChange={(e) => setMealServings(Number(e.target.value) || 1)}
                style={inputStyle}
                placeholder="Porties"
              />
            </div>

            <button
              onClick={saveCurrentMeal}
              style={{
                ...buttonStyle,
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                fontWeight: 700,
              }}
            >
              Opslaan huidige maaltijd
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
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
