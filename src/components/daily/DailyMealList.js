import React from "react";
import { DailyMealCard } from "./DailyMealCard";

export function DailyMealList({
  mealsForDay = [],
  insulinEventsForDay = [],
  selectedDay,
  products,
  deleteMealFromDay,
  updateMealTime,
  updateMealMedicalLog,
  updateInsulinEvent,
  deleteInsulinEvent,
  glucoseEventsForDay = [],
  updateGlucoseEvent,
  deleteGlucoseEvent,
  buttonStyle,
}) {
  if (!selectedDay) {
    return (
      <div style={{ color: "#64748b" }}>
        Geen eetmomenten opgeslagen voor deze dag.
      </div>
    );
  }

  const timelineItems = [
    ...mealsForDay.map((meal) => ({
      itemType: "meal",
      time: meal.eatenAt || "",
      meal,
    })),
    ...insulinEventsForDay.map((event) => ({
      itemType: "insulin",
      time: event.eventTime || "",
      event,
    })),
    ...glucoseEventsForDay.map((event) => ({
      itemType: "glucose",
      time: event.eventTime || "",
      event,
    })),
  ].sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));

  return (
    <>
      {/* Chronologische tijdlijn: eetmomenten + insuline-events */}
      {timelineItems.map((item, index) => {
        if (item.itemType === "meal") {
          return (
            <DailyMealCard
              key={item.meal.id}
              meal={item.meal}
              index={index}
              products={products}
              onDelete={deleteMealFromDay}
              onUpdateTime={updateMealTime}
              onUpdateMedicalLog={updateMealMedicalLog}
              buttonStyle={buttonStyle}
            />
          );
        }

        if (item.itemType === "insulin") {
          const event = item.event;

          return (
            <div
              key={event.id}
              style={{
                marginBottom: 7,
                marginLeft: 10,
                marginRight: 10,
                padding: "7px 10px",
                borderRadius: 999,
                background: "#e0e7ff",
                border: "1px solid #a5b4fc",
                color: "#312e81",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 1px 3px rgba(49, 46, 129, 0.08)",
              }}
            >
              {/* Compact insuline-event in de tijdlijn */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>💉 Insuline</strong> ·{" "}
                  {new Date(event.eventTime).toLocaleString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {event.insulinType} {event.units}E
                  {event.note ? ` · ${event.note}` : ""}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      const units = window.prompt(
                        "Aantal eenheden:",
                        event.units || "",
                      );

                      if (units === null) return;

                      const note = window.prompt("Notitie:", event.note || "");

                      if (note === null) return;

                      updateInsulinEvent(event.id, {
                        units,
                        note,
                      });
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "white",
                      border: "1px solid #c7d2fe",
                      color: "#3730a3",
                    }}
                  >
                    Wijzig
                  </button>

                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        "Dit insuline-event verwijderen?",
                      );

                      if (!ok) return;

                      deleteInsulinEvent(event.id);
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      color: "#991b1b",
                    }}
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            </div>
          );
        }
        if (item.itemType === "glucose") {
          const event = item.event;

          return (
            <div
              key={event.id}
              style={{
                marginBottom: 7,
                marginLeft: 10,
                marginRight: 10,
                padding: "7px 10px",
                borderRadius: 999,
                background: "#e0f2fe",
                border: "1px solid #7dd3fc",
                color: "#075985",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 1px 3px rgba(7, 89, 133, 0.08)",
              }}
            >
              {/* Compact glucose-event in de tijdlijn */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>📈 Glucose</strong> ·{" "}
                  {new Date(event.eventTime).toLocaleString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {event.glucoseValue} mmol/L
                  {event.note ? ` · ${event.note}` : ""}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      const glucoseValue = window.prompt(
                        "Glucosewaarde (mmol/L):",
                        event.glucoseValue || "",
                      );
                      if (glucoseValue === null) return;

                      const note = window.prompt("Notitie:", event.note || "");
                      if (note === null) return;

                      updateGlucoseEvent(event.id, {
                        glucoseValue,
                        note,
                      });
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "white",
                      border: "1px solid #bae6fd",
                      color: "#0369a1",
                    }}
                  >
                    Wijzig
                  </button>

                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        "Dit glucosemoment verwijderen?",
                      );
                      if (!ok) return;

                      deleteGlucoseEvent(event.id);
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "#fee2e2",
                      border: "1px solid #fecaca",
                      color: "#991b1b",
                    }}
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}
