import React from "react";

export function MealTotalsCard({ totals, cardStyle }) {
  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Maaltijd totaal</h2>

      <div>KH: {totals.kh} g</div>
      <div>Eiwit: {totals.protein} g</div>
      <div>Vet: {totals.fat} g</div>
      <div>kcal: {totals.kcal}</div>
    </div>
  );
}
