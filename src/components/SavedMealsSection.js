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
    saveCurrentMeal,
    loadSavedMeal,
    deleteSavedMeal,
    products,
    cardStyle,
    buttonStyle,
    inputStyle,
  } = props;

  return (
    <div style={{ ...cardStyle, marginBottom: 16 }}>
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
        }}
      >
        <span>Standaardmaaltijden ({savedMeals.length})</span>
        <span>{showSavedMeals ? "▲" : "▼"}</span>
      </button>

      {showSavedMeals && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr auto",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <input
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              style={inputStyle}
              placeholder="Naam van maaltijd, bv. Ontbijt standaard"
            />

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
                onDelete={deleteSavedMeal}
                buttonStyle={buttonStyle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
