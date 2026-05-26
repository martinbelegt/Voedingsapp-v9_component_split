import React, { useState } from "react";
import { DailyMealCard } from "./DailyMealCard";
import { DailyTimelineItem } from "./DailyTimelineItem";

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
  const timelineItems = [
    ...mealsForDay.map((meal) => ({
      id: meal.id,
      itemType: "meal",
      time: meal.eatenAt || "",
      meal,
    })),
    ...insulinEventsForDay.map((event) => ({
      id: event.id,
      itemType: "insulin",
      time: event.eventTime || "",
      event,
    })),
    ...glucoseEventsForDay.map((event) => ({
      id: event.id,
      itemType: "glucose",
      time: event.eventTime || "",
      event,
    })),
  ].sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));

  const [expandedIds, setExpandedIds] = useState([]);

  function toggleExpanded(id) {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  }

  function expandAll() {
    setExpandedIds(timelineItems.map((item) => item.id));
  }

  function collapseAll() {
    setExpandedIds([]);
  }
  if (!selectedDay) {
    return (
      <div style={{ color: "#64748b" }}>
        Geen eetmomenten opgeslagen voor deze dag.
      </div>
    );
  }

  return (
    <>
      {/* Tijdlijnbediening */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <button onClick={expandAll} style={buttonStyle}>
          Alles uitklappen
        </button>

        <button onClick={collapseAll} style={buttonStyle}>
          Alles inklappen
        </button>
      </div>

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
            <DailyTimelineItem
              key={event.id}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              icon="💉"
              title={`${event.insulinType} ${event.units}E`}
              subtitle={`${new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}${event.note ? ` · ${event.note}` : ""}`}
              accentColor="#312e81"
              backgroundColor="#eef2ff"
              borderColor="#c7d2fe"
              actions={
                <>
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
                </>
              }
              detailContent={
                <div style={{ fontSize: 13, color: "#334155" }}>
                  Werkelijk toegediende insuline.
                  {event.note ? (
                    <div style={{ marginTop: 6 }}>
                      <strong>Context:</strong> {event.note}
                    </div>
                  ) : null}
                </div>
              }
            />
          );
        }
        if (item.itemType === "glucose") {
          const event = item.event;

          return (
            <DailyTimelineItem
              key={event.id}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              icon="📈"
              title={`${event.glucoseValue} mmol/L`}
              subtitle={`${new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}${event.note ? ` · ${event.note}` : ""}`}
              accentColor="#075985"
              backgroundColor="#f0f9ff"
              borderColor="#7dd3fc"
              actions={
                <>
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
                </>
              }
              detailContent={
                <div style={{ fontSize: 13, color: "#334155" }}>
                  Glucosemeting opgeslagen in metabole tijdlijn.
                  {event.note ? (
                    <div style={{ marginTop: 6 }}>
                      <strong>Context:</strong> {event.note}
                    </div>
                  ) : null}
                </div>
              }
            />
          );
        }

        return null;
      })}
    </>
  );
}
