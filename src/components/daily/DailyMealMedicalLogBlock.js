import React from "react";

export function DailyMealMedicalLogBlock({ meal }) {
  if (
    !meal.mealNote &&
    !meal.actualInsulin &&
    !meal.actualCreon25 &&
    !meal.actualCreon10
  ) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 8,
        padding: "7px 9px",
        borderRadius: 10,
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        fontSize: 12,
        color: "#14532d",
        display: "grid",
        gap: 4,
      }}
    >
      {meal.actualInsulin && (
        <div>
          <strong>Werkelijk insuline:</strong> {meal.insulinType || "Insuline"}{" "}
          {meal.actualInsulin} E
          {meal.insulinTime ? ` om ${meal.insulinTime}` : ""}
        </div>
      )}

      {(meal.actualCreon25 || meal.actualCreon10) && (
        <div>
          <strong>Werkelijk Creon:</strong> {meal.actualCreon25 || 0}x25k +{" "}
          {meal.actualCreon10 || 0}x10k
          {meal.creonTime ? ` om ${meal.creonTime}` : ""}
        </div>
      )}
    </div>
  );
}
