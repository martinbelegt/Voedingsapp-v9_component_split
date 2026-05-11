import React from "react";
import { DailyMealCard } from "./DailyMealCard";

export function DailyTab({
  selectedDate,
  setSelectedDate,
  sortedDates,
  dayTotals,
  selectedDay,
  clearDailyLog,
  products,
  deleteMealFromDay,
  cardStyle,
  inputStyle,
  buttonStyle,
}) {
  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Dag / Archief</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>Datum</div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ fontSize: 13, color: "#475569" }}>
          Opgeslagen dagen: {sortedDates.length}
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Dagtotaal</h2>
        <div>KH: {dayTotals.kh} g</div>
        <div>Eiwit: {dayTotals.protein} g</div>
        <div>Vet: {dayTotals.fat} g</div>
        <div>kcal: {dayTotals.kcal}</div>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Maaltijden van deze dag</h2>

          <button
            onClick={() => {
              if (!selectedDay || !selectedDay.meals?.length) return;

              const ok = window.confirm(
                `Alle maaltijden van ${selectedDate} verwijderen?`,
              );

              if (!ok) return;

              clearDailyLog();
            }}
            style={{
              ...buttonStyle,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
            }}
          >
            Wis deze dag
          </button>
        </div>

        {!selectedDay && (
          <div style={{ color: "#64748b" }}>
            Geen maaltijden opgeslagen voor deze dag.
          </div>
        )}

        {selectedDay &&
          selectedDay.meals.map((meal, index) => (
            <DailyMealCard
              key={meal.id}
              meal={meal}
              index={index}
              products={products}
              onDelete={deleteMealFromDay}
              buttonStyle={buttonStyle}
            />
          ))}
      </div>
    </div>
  );
}
