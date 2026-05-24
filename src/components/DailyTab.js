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
  updateMealTime,
  updateMealMedicalLog,
  cardStyle,
  inputStyle,
  buttonStyle,
}) {
  const mealsForDay = selectedDay?.meals || [];

  const today = new Date().toISOString().slice(0, 10);

  const dayMode =
    selectedDate > today
      ? "Geplande dag"
      : selectedDate === today
        ? "Vandaag"
        : "Archiefdag";

  const dayTotalTitle =
    dayMode === "Geplande dag"
      ? "Gepland totaal"
      : dayMode === "Vandaag"
        ? "Dagtotaal vandaag"
        : "Dagtotaal archief";

  const dayTotalHint =
    dayMode === "Geplande dag"
      ? "Je plant vooruit. Gebruik dit totaal om eerder op de dag bij te sturen op eiwit, kcal, KH, insuline en Creon."
      : dayMode === "Vandaag"
        ? "Gebruik dit totaal om gedurende de dag bij te sturen."
        : "Terugblik op deze dag.";

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <h2 style={{ margin: 0 }}>Dag / Archief</h2>

          <span
            style={{
              padding: "4px 9px",
              borderRadius: 999,
              background:
                dayMode === "Geplande dag"
                  ? "#ede9fe"
                  : dayMode === "Vandaag"
                    ? "#dcfce7"
                    : "#e2e8f0",
              border:
                dayMode === "Geplande dag"
                  ? "1px solid #c4b5fd"
                  : dayMode === "Vandaag"
                    ? "1px solid #86efac"
                    : "1px solid #cbd5e1",
              color:
                dayMode === "Geplande dag"
                  ? "#5b21b6"
                  : dayMode === "Vandaag"
                    ? "#166534"
                    : "#475569",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {dayMode}
          </span>
        </div>

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
            onClick={(e) => {
              if (e.currentTarget.showPicker) {
                e.currentTarget.showPicker();
              }
            }}
            style={{
              ...inputStyle,
              cursor: "pointer",
              minHeight: 38,
            }}
          />

          <div style={{ fontSize: 13, color: "#475569" }}>
            Opgeslagen dagen: {sortedDates.length}
          </div>
        </div>
      </div>

      {/* Dagtotaal duidelijk */}
      <div
        style={{
          ...cardStyle,
          padding: 14,
          background: "#ecfdf5",
          border: "1px solid #86efac",
          boxShadow: "0 2px 6px rgba(22, 101, 52, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 900, color: "#14532d", fontSize: 17 }}>
            {dayTotalTitle}
          </div>

          <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>
            {selectedDate}
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#14532d",
            marginBottom: 10,
            lineHeight: 1.45,
            fontWeight: 700,
            background: "rgba(255,255,255,0.65)",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "7px 9px",
          }}
        >
          {dayTotalHint}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 8,
          }}
        >
          {[
            ["KH", `${dayTotals.kh} g`],
            ["Eiwit", `${dayTotals.protein} g`],
            ["Vet", `${dayTotals.fat} g`],
            ["Kcal", dayTotals.kcal],
            ["Insuline", `${dayTotals.insulin || 0} E`],
            [
              "Creon",
              `${dayTotals.creon25 || 0}x25k + ${dayTotals.creon10 || 0}x10k`,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.82)",
                border: "1px solid #bbf7d0",
                borderRadius: 12,
                padding: "9px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  marginBottom: 3,
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: "#14532d",
                  lineHeight: 1.1,
                }}
              >
                {value}
              </div>
            </div>
          ))}
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
      </div>
    </div>
  );
}
