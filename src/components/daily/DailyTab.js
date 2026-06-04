import React, { useEffect, useState } from "react";
import { DailyMealList } from "./DailyMealList";
import { DailyEventAddModal } from "./DailyEventAddModal";

export function DailyTab({
  settings,
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
  addInsulinEventToDay,
  updateInsulinEvent,
  deleteInsulinEvent,
  addGlucoseEventToDay,
  updateGlucoseEvent,
  deleteGlucoseEvent,
  addGlucoseBoostEventToDay,
  updateGlucoseBoostEvent,
  deleteGlucoseBoostEvent,
  addMovementEventToDay,
  updateMovementEvent,
  deleteMovementEvent,
  addBowelEventToDay,
  updateBowelEvent,
  deleteBowelEvent,
  activeTimers = [],
}) {
  const [addEventType, setAddEventType] = useState(null);

  const mealsForDay = selectedDay?.meals || [];
  const insulinEventsForDay = selectedDay?.insulinEvents || [];
  const glucoseEventsForDay = selectedDay?.glucoseEvents || [];
  const glucoseBoostEventsForDay = selectedDay?.glucoseBoostEvents || [];
  const movementEventsForDay = selectedDay?.movementEvents || [];
  const bowelEventsForDay = selectedDay?.bowelEvents || [];

  const totalTimelineItems =
    mealsForDay.length +
    insulinEventsForDay.length +
    glucoseEventsForDay.length +
    glucoseBoostEventsForDay.length +
    movementEventsForDay.length +
    bowelEventsForDay.length;

  const dailyTargets = settings?.dailyTargets || {};
  const maintenanceKcal = Number(dailyTargets.maintenanceKcal) || 0;
  const targetKcal = Number(dailyTargets.targetKcal) || 0;
  const proteinGoal = Number(dailyTargets.proteinGoal) || 0;
  const proteinMealGoal = Number(dailyTargets.proteinMealGoal) || 0;

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

  const totalsChip = (bg, color) => ({
    background: bg,

    color,

    padding: window.innerWidth < 900 ? "3px 8px" : "4px 9px",

    borderRadius: 999,

    fontSize: window.innerWidth < 900 ? 11 : 13,

    fontWeight: 800,

    whiteSpace: "nowrap",
  });

  function saveAddedEvent({ eventType, eventTime, value1, value2, value3 }) {
    const date = eventTime.slice(0, 10);

    if (eventType === "insulin") {
      addInsulinEventToDay({
        date,
        eventTime,
        units: value1,
        insulinType: "Novorapid",
        note: value2,
      });
    }

    if (eventType === "glucose") {
      addGlucoseEventToDay({
        date,
        eventTime,
        glucoseValue: value1,
        note: value2,
      });
    }

    if (eventType === "glucoseBoost") {
      addGlucoseBoostEventToDay({
        date,
        eventTime,
        kh: value1,
        source: value2,
        note: value3,
      });
    }

    if (eventType === "movement") {
      addMovementEventToDay({
        date,
        eventTime,
        activityType: value1,
        intensityType: value2,
        durationMinutes: value3,
        note: "",
      });
    }

    if (eventType === "bowel") {
      addBowelEventToDay({
        date,
        eventTime,
        bristolScore: value1,
        urgency: value2,
        note: value3,
      });
    }
  }

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
      {/* Dagkeuze */}
      <div
        style={{
          ...cardStyle,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          padding: window.innerWidth < 900 ? "6px 8px" : 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              window.innerWidth < 900 ? "auto 1fr" : "auto 220px 1fr",
            gap: window.innerWidth < 900 ? 6 : 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#1e3a8a",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Datum
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: "#dcfce7",
                border: "1px solid #86efac",
                color: "#166534",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {dayMode}
            </span>
          </div>

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
              minWidth: 0,
              cursor: "pointer",
              minHeight: 38,
            }}
          />

          <div />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#64748b",
            marginRight: 2,
          }}
        >
          Dagtotaal
        </span>

        <span style={totalsChip("#dbeafe", "#1d4ed8")}>
          KH {dayTotals?.kh || 0}g
        </span>

        <span style={totalsChip("#ede9fe", "#6d28d9")}>
          Eiwit {dayTotals?.protein || 0}g
        </span>

        <span style={totalsChip("#ffedd5", "#c2410c")}>
          Vet {dayTotals?.fat || 0}g
        </span>

        <span style={totalsChip("#dcfce7", "#166534")}>
          {dayTotals?.kcal || 0} kcal
        </span>

        <span style={totalsChip("#eff6ff", "#2563eb")}>
          💉 {dayTotals?.insulin || 0}E
        </span>

        <span style={totalsChip("#fef3c7", "#a16207")}>
          Creon {dayTotals?.creon25 || 0}x25k + {dayTotals?.creon10 || 0}x10k
        </span>
      </div>

      {/* Tijdlijn van deze dag */}
      <div
        style={{
          ...cardStyle,
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
        }}
      >
        {/* Tijdlijnkop + eventknoppen */}
        <div
          style={{
            display: "grid",
            gap: 12,
            marginBottom: 10,
          }}
        >
          {/* Titel */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: window.innerWidth < 900 ? 18 : 30,
                  fontWeight: 700,
                  color: "#0f766e",
                }}
              >
                Vandaag ({totalTimelineItems} items)
              </h2>

              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginTop: 2,
                }}
              >
                {totalTimelineItems} item(s), nieuwste bovenaan
              </div>
            </div>

            {/* Dag wissen */}
            <button
              onClick={() => {
                if (!selectedDay) return;

                const ok = window.confirm(
                  `Alle tijdlijnmomenten van ${selectedDate} verwijderen?`,
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

          {/* Event knoppen */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setAddEventType("insulin")}
              style={{
                ...buttonStyle,
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                color: "#3730a3",
              }}
            >
              + Insuline
            </button>

            <button
              onClick={() => setAddEventType("glucose")}
              style={{
                ...buttonStyle,
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                color: "#0369a1",
              }}
            >
              + Glucose
            </button>

            <button
              onClick={() => setAddEventType("glucoseBoost")}
              style={{
                ...buttonStyle,
                background: "#fff7ed",
                border: "1px solid #fdba74",
                color: "#c2410c",
              }}
            >
              ⚡ Glucoseboost
            </button>

            <button
              onClick={() => setAddEventType("movement")}
              style={{
                ...buttonStyle,
                background: "#ecfeff",
                border: "1px solid #67e8f9",
                color: "#0e7490",
              }}
            >
              + Beweging/sport
            </button>

            <button
              onClick={() => setAddEventType("bowel")}
              style={{
                ...buttonStyle,
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                color: "#92400e",
              }}
            >
              + Stoelgang
            </button>
          </div>
        </div>

        {/* Chronologische lijst */}
        <DailyMealList
          mealsForDay={mealsForDay}
          selectedDay={selectedDay}
          products={products}
          deleteMealFromDay={deleteMealFromDay}
          updateMealTime={updateMealTime}
          updateMealMedicalLog={updateMealMedicalLog}
          insulinEventsForDay={insulinEventsForDay}
          updateInsulinEvent={updateInsulinEvent}
          deleteInsulinEvent={deleteInsulinEvent}
          glucoseEventsForDay={glucoseEventsForDay}
          updateGlucoseEvent={updateGlucoseEvent}
          deleteGlucoseEvent={deleteGlucoseEvent}
          glucoseBoostEventsForDay={glucoseBoostEventsForDay}
          updateGlucoseBoostEvent={updateGlucoseBoostEvent}
          deleteGlucoseBoostEvent={deleteGlucoseBoostEvent}
          movementEventsForDay={movementEventsForDay}
          updateMovementEvent={updateMovementEvent}
          deleteMovementEvent={deleteMovementEvent}
          bowelEventsForDay={bowelEventsForDay}
          updateBowelEvent={updateBowelEvent}
          deleteBowelEvent={deleteBowelEvent}
          buttonStyle={buttonStyle}
        />
      </div>

      {/* Uniform event toevoegen */}
      {addEventType && (
        <DailyEventAddModal
          eventType={addEventType}
          selectedDate={selectedDate}
          buttonStyle={buttonStyle}
          onClose={() => setAddEventType(null)}
          onSave={saveAddedEvent}
        />
      )}
    </div>
  );
}
