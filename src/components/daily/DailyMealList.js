import React from "react";
import { DailyMealCard } from "./DailyMealCard";

export function DailyMealList({
  mealsForDay,
  selectedDay,
  products,
  deleteMealFromDay,
  updateMealTime,
  updateMealMedicalLog,
  buttonStyle,
}) {
  if (!selectedDay) {
    return (
      <div style={{ color: "#64748b" }}>
        Geen eetmomenten opgeslagen voor deze dag.
      </div>
    );
  }

  return (
    <>
      {[...mealsForDay]
        .sort((a, b) => {
          const aTime = String(a.eatenAt || "");
          const bTime = String(b.eatenAt || "");

          return bTime.localeCompare(aTime);
        })
        .map((meal, index) => (
          <DailyMealCard
            key={meal.id}
            meal={meal}
            index={index}
            products={products}
            onDelete={deleteMealFromDay}
            onUpdateTime={updateMealTime}
            onUpdateMedicalLog={updateMealMedicalLog}
            buttonStyle={buttonStyle}
          />
        ))}
    </>
  );
}
