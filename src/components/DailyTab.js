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
  const mealsForDay = selectedDay?.meals || [];

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
      {/* Dagkeuze */}
      <div
        style={{
          ...cardStyle,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Dag / Archief</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 220px 1fr",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 700, color: "#1e3a8a" }}>Datum</div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />

          <div style={{ fontSize: 13, color: "#475569" }}>
            Opgeslagen dagen: {sortedDates.length}
          </div>
        </div>
      </div>

      {/* Compact dagtotaal */}
      <div
        style={{
          ...cardStyle,
          padding: 12,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <div style={{ fontWeight: 800, color: "#166534", marginBottom: 8 }}>
          Dagtotaal
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
            fontSize: 13,
            color: "#334155",
          }}
        >
          <span>
            <strong>KH</strong> {dayTotals.kh} g
          </span>
          <span>
            <strong>Eiwit</strong> {dayTotals.protein} g
          </span>
          <span>
            <strong>Vet</strong> {dayTotals.fat} g
          </span>
          <span>
            <strong>Kcal</strong> {dayTotals.kcal}
          </span>

          {dayTotals.insulin != null && (
            <span>
              <strong>Insuline</strong> {dayTotals.insulin} E
            </span>
          )}

          {dayTotals.creon25 != null && (
            <span>
              <strong>Creon</strong> {dayTotals.creon25}x25k +{" "}
              {dayTotals.creon10 || 0}x10k
            </span>
          )}
        </div>
      </div>

      {/* Maaltijden/snacks van deze dag */}
      <div
        style={{
          ...cardStyle,
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Eetmomenten van deze dag</h2>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {mealsForDay.length} item(s), nieuwste bovenaan
            </div>
          </div>

          <button
            onClick={() => {
              if (!selectedDay || !selectedDay.meals?.length) return;

              const ok = window.confirm(
                `Alle eetmomenten van ${selectedDate} verwijderen?`,
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
            Geen eetmomenten opgeslagen voor deze dag.
          </div>
        )}

        {[...mealsForDay].reverse().map((meal, index) => (
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
