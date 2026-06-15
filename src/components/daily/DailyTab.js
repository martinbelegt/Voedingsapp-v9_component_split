import React, { useEffect, useState } from "react";
import { DailyMealList } from "./DailyMealList";
import { DailyEventAddModal } from "./DailyEventAddModal";
import { requestNotificationPermission } from "../../services/notificationService";

import {
  scheduleLocalAlarm,
  clearLocalAlarm,
  snoozeLocalAlarm,
  enableAlarmSound,
} from "../../services/alarmService";

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
  addSupplementEventToDay,
  updateSupplementEvent,
  deleteSupplementEvent,
  addBowelEventToDay,
  updateBowelEvent,
  deleteBowelEvent,
  activeTimers = [],
  addNoteEventToDay,
  updateNoteEvent,
  deleteNoteEvent,
  noteEventsForDay = selectedDay?.noteEvents || [],
  addTrainingPlanEventToDay,
  updateTrainingPlanEvent,
  deleteTrainingPlanEvent,
}) {
  const [addEventType, setAddEventType] = useState(null);
  const [showAddButtons, setShowAddButtons] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);

  const mealsForDay = selectedDay?.meals || [];
  const insulinEventsForDay = selectedDay?.insulinEvents || [];
  const glucoseEventsForDay = selectedDay?.glucoseEvents || [];
  const glucoseBoostEventsForDay = selectedDay?.glucoseBoostEvents || [];
  const movementEventsForDay = selectedDay?.movementEvents || [];
  const bowelEventsForDay = selectedDay?.bowelEvents || [];
  const [showTimelineAnalysis, setShowTimelineAnalysis] = useState(false);

  const totalTimelineItems =
    mealsForDay.length +
    insulinEventsForDay.length +
    glucoseEventsForDay.length +
    glucoseBoostEventsForDay.length +
    movementEventsForDay.length +
    noteEventsForDay.length +
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

  function saveAddedEvent({
    eventType,
    eventTime,
    value1,
    value2,
    value3,
    bowelColor,
  }) {
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
    if (eventType === "supplement") {
      addSupplementEventToDay({
        date,
        eventTime,
        name: value1,
        dosage: value2,
        note: value3,
      });
    }

    if (eventType === "bowel") {
      addBowelEventToDay({
        date,
        eventTime,
        bristolScore: value1,
        bowelColor,
        urgency: value2,
        note: value3,
      });
    }
    if (eventType === "note") {
      const noteEvent = addNoteEventToDay({
        date,
        eventTime,
        note: value1,
        context: value2,

        alarmEnabled: true,
        alarmAt: eventTime,
      });

      scheduleLocalAlarm({
        id: noteEvent.id,
        alarmAt: noteEvent.alarmAt,
        title: "VoedingsApp reminder",
        body: noteEvent.note || "Geplande notitie",
      });
    }
  }

  const advisedInsulin = (selectedDay?.meals || []).reduce(
    (sum, meal) => sum + (Number(meal?.totals?.insulin) || 0),
    0,
  );

  const actualInsulin = Number(dayTotals?.insulin || 0);

  const insulinDiff = Math.round((actualInsulin - advisedInsulin) * 100) / 100;
  const proteinRemaining = Math.max(
    0,
    Math.round((proteinGoal - (dayTotals?.protein || 0)) * 100) / 100,
  );

  const kcalRemaining = Math.max(
    0,
    Math.round((targetKcal - (dayTotals?.kcal || 0)) * 100) / 100,
  );

  const insulinDiffLabel =
    insulinDiff === 0
      ? "gelijk aan advies"
      : insulinDiff > 0
        ? `${insulinDiff}E boven advies`
        : `${Math.abs(insulinDiff)}E onder advies`;

  useEffect(() => {
    function handleAlarm(event) {
      setActiveAlarm(event.detail);
    }

    window.addEventListener("voedingsapp-alarm", handleAlarm);

    return () => {
      window.removeEventListener("voedingsapp-alarm", handleAlarm);
    };
  }, []);

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
          Eiwit {dayTotals?.protein || 0}g van {proteinGoal}g
        </span>

        <span style={totalsChip("#ffedd5", "#c2410c")}>
          Vet {dayTotals?.fat || 0}g
        </span>

        <span style={totalsChip("#dcfce7", "#166534")}>
          {dayTotals?.kcal || 0} van {targetKcal} kcal
        </span>

        <span style={totalsChip("#eff6ff", "#2563eb")}>
          💉 {(Number(actualInsulin) || 0).toFixed(1)}E / advies{" "}
          {(Number(advisedInsulin) || 0).toFixed(1)}E /{" "}
          {insulinDiff >= 0 ? "+" : ""}
          {(Number(insulinDiff) || 0).toFixed(1)}E
        </span>
        <span style={totalsChip("#fef3c7", "#a16207")}>
          💊 Creon {dayTotals?.creon25 || 0}x25k + {dayTotals?.creon10 || 0}x10k
        </span>
      </div>
      {false && (
        <>
          <button
            onClick={requestNotificationPermission}
            style={{
              ...buttonStyle,
              width: "100%",
              marginBottom: 10,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#334155",
              textAlign: "center",
            }}
          >
            🔔 Test notificatie
          </button>

          <button
            onClick={enableAlarmSound}
            style={{
              ...buttonStyle,
              width: "100%",
              marginBottom: 10,
              background: "#fff7ed",
              border: "1px solid #fdba74",
              color: "#c2410c",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            🔊 Alarmgeluid activeren
          </button>
        </>
      )}

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

          {/* Hoofdknoppen */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
            }}
          >
            <button
              onClick={() => setShowTimelineAnalysis((v) => !v)}
              style={{
                ...buttonStyle,
                background: showTimelineAnalysis ? "#dbeafe" : "#f8fafc",
                border: showTimelineAnalysis
                  ? "1px solid #93c5fd"
                  : "1px solid #cbd5e1",
                color: showTimelineAnalysis ? "#1d4ed8" : "#334155",
                fontWeight: 800,
                fontSize: window.innerWidth < 900 ? 12 : 14,
                padding: window.innerWidth < 900 ? "6px 4px" : "8px 10px",
              }}
            >
              📈 Daganalyse
            </button>
            <button
              onClick={() => setShowAddButtons((v) => !v)}
              style={{
                ...buttonStyle,
                background: showAddButtons ? "#dcfce7" : "#f8fafc",
                border: showAddButtons
                  ? "1px solid #86efac"
                  : "1px solid #cbd5e1",
                color: showAddButtons ? "#166534" : "#334155",
                fontWeight: 800,
                fontSize: window.innerWidth < 900 ? 12 : 14,
                padding: window.innerWidth < 900 ? "6px 4px" : "8px 10px",
              }}
            >
              ➕ Nieuw
            </button>
          </div>

          {showTimelineAnalysis && (
            <div
              style={{
                ...cardStyle,
                marginBottom: 0,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1e3a8a",
                fontSize: 13,
                lineHeight: 1.25,
                padding: window.innerWidth < 900 ? 8 : 12,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px 12px",
                }}
              >
                <div>
                  <strong>Timing:</strong>{" "}
                  {dayTotals?.personalTimingAdvice ||
                    dayTotals?.timingAdvice ||
                    "Nog geen advies"}
                </div>

                <div
                  style={{
                    borderLeft: "1px solid #bfdbfe",
                    paddingLeft: 10,
                  }}
                >
                  <strong>Insuline:</strong> {actualInsulin}E werkelijk /{" "}
                  {advisedInsulin}E advies · {insulinDiffLabel}
                </div>

                <div>
                  <strong>Eiwit:</strong> {dayTotals?.protein || 0}g van{" "}
                  {proteinGoal}g · nog {proteinRemaining}g
                </div>

                <div
                  style={{
                    borderLeft: "1px solid #bfdbfe",
                    paddingLeft: 10,
                  }}
                >
                  <strong>Kcal:</strong> {dayTotals?.kcal || 0} van {targetKcal}{" "}
                  kcal · nog {kcalRemaining} kcal
                </div>

                <div>
                  <strong>Glucose:</strong> {glucoseEventsForDay.length}{" "}
                  registratie(s)
                </div>

                <div
                  style={{
                    borderLeft: "1px solid #bfdbfe",
                    paddingLeft: 10,
                  }}
                >
                  <strong>Sport:</strong> {movementEventsForDay.length}{" "}
                  moment(en)
                </div>

                <div>
                  <strong>Context:</strong> {noteEventsForDay.length} notitie(s)
                </div>

                <div
                  style={{
                    borderLeft: "1px solid #bfdbfe",
                    paddingLeft: 10,
                  }}
                >
                  <strong>Darmen:</strong> {bowelEventsForDay.length}{" "}
                  registratie(s)
                </div>
              </div>
            </div>
          )}

          {showAddButtons && (
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

              <button
                onClick={() => setAddEventType("note")}
                style={{
                  ...buttonStyle,
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  color: "#334155",
                }}
              >
                + Notitie
              </button>

              <button
                onClick={() => setAddEventType("supplement")}
                style={{
                  ...buttonStyle,
                  background: "#ede9fe",
                  border: "1px solid #c4b5fd",
                  color: "#5b21b6",
                }}
              >
                + Supplement
              </button>
            </div>
          )}
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
          supplementEventsForDay={selectedDay?.supplementEvents || []}
          addSupplementEventToDay={addSupplementEventToDay}
          updateSupplementEvent={updateSupplementEvent}
          deleteSupplementEvent={deleteSupplementEvent}
          bowelEventsForDay={bowelEventsForDay}
          updateBowelEvent={updateBowelEvent}
          deleteBowelEvent={deleteBowelEvent}
          buttonStyle={buttonStyle}
          noteEventsForDay={noteEventsForDay}
          updateNoteEvent={updateNoteEvent}
          deleteNoteEvent={deleteNoteEvent}
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
      {activeAlarm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.72)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#fff7ed",
              border: "3px solid #fb923c",
              borderRadius: 22,
              padding: 24,
              maxWidth: 420,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 46, marginBottom: 10 }}>🔔</div>

            <h2 style={{ margin: 0, color: "#9a3412", fontSize: 26 }}>
              {activeAlarm.title}
            </h2>

            <p style={{ fontSize: 17, color: "#431407", marginTop: 12 }}>
              {activeAlarm.body}
            </p>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 22,
              }}
            >
              <button
                onClick={() => {
                  clearLocalAlarm(activeAlarm.id);
                  setActiveAlarm(null);
                }}
                style={{
                  ...buttonStyle,
                  background: "#16a34a",
                  border: "1px solid #15803d",
                  color: "white",
                  fontSize: 18,
                  padding: "12px 16px",
                }}
              >
                ✅ Gedaan
              </button>

              <button
                onClick={() => {
                  snoozeLocalAlarm({
                    id: activeAlarm.id,
                    title: activeAlarm.title,
                    body: activeAlarm.body,
                    minutes: 5,
                  });

                  setActiveAlarm(null);
                }}
                style={{
                  ...buttonStyle,
                  background: "#fff",
                  border: "1px solid #fdba74",
                  color: "#9a3412",
                  fontSize: 16,
                  padding: "10px 14px",
                }}
              >
                ⏱ Herinner over 5 minuten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
