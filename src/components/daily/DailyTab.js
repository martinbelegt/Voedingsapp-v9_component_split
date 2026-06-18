import React, { useEffect, useRef, useState } from "react";
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
  fillDailyRepeats,
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
  const [showTimelineControls, setShowTimelineControls] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const dateInputRef = useRef(null);

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

  const formattedSelectedDate = new Date(
    `${selectedDate}T00:00:00`,
  ).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
    repeat,
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
        repeat: repeat || "none",
      });
    }
    if (eventType === "supplement") {
      addSupplementEventToDay({
        date,
        eventTime,
        name: value1,
        dosage: value2,
        note: value3,
        repeat: repeat || "none",
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
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => {
                  if (dateInputRef.current?.showPicker) {
                    dateInputRef.current.showPicker();
                  } else {
                    dateInputRef.current?.focus();
                    dateInputRef.current?.click();
                  }
                }}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid #bfdbfe",
                  color: "#0f172a",
                  borderRadius: 10,
                  minHeight: 42,
                  padding: "8px 10px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    flexWrap: "wrap",
                  }}
                >
                  <span aria-hidden="true">📅</span>
                  <span>
                    {dayMode} • {formattedSelectedDate}
                  </span>
                </span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={
                  /iPhone|iPad|iPod/i.test(navigator.userAgent)
                    ? {
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }
                    : {
                        position: "absolute",
                        opacity: 0,
                        width: 1,
                        height: 1,
                        pointerEvents: "none",
                      }
                }
              />
            </div>

            {selectedDate !== today && (
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                style={{
                  ...buttonStyle,
                  background: "#dbeafe",
                  border: "1px solid #93c5fd",
                  color: "#1d4ed8",
                  minHeight: 32,
                  padding: "4px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                }}
              >
                Vandaag
              </button>
            )}
          </div>
        </div>
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
          />

          {/* Hoofdknoppen */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: 5,
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
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
                fontWeight: 700,
                fontSize: window.innerWidth < 900 ? 12 : 13,
                padding: "5px 6px",
                minHeight: 34,
                borderRadius: 4,
                lineHeight: 1.05,
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
                fontWeight: 700,
                fontSize: window.innerWidth < 900 ? 12 : 13,
                padding: "5px 6px",
                minHeight: 34,
                borderRadius: 4,
                lineHeight: 1.05,
              }}
            >
              ➕ Nieuw
            </button>
            <button
              onClick={() => setShowTimelineControls((v) => !v)}
              style={{
                ...buttonStyle,
                background: showTimelineControls ? "#fef3c7" : "#f8fafc",
                border: showTimelineControls
                  ? "1px solid #fcd34d"
                  : "1px solid #cbd5e1",
                color: showTimelineControls ? "#92400e" : "#334155",
                fontWeight: 700,
                fontSize: window.innerWidth < 900 ? 12 : 13,
                padding: "5px 6px",
                minHeight: 34,
                borderRadius: 4,
                lineHeight: 1.05,
              }}
            >
              ⚙️ Filters
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
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#1e3a8a",
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                    }}
                  >
                    Dagtotaal
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
                      💉 {(Number(actualInsulin) || 0).toFixed(1)}E
                    </span>
                    <span style={totalsChip("#fef3c7", "#a16207")}>
                      💊 Creon {dayTotals?.creon25 || 0}x25k +{" "}
                      {dayTotals?.creon10 || 0}x10k
                    </span>
                  </div>
                </div>

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
                    <strong>Kcal:</strong> {dayTotals?.kcal || 0} van{" "}
                    {targetKcal} kcal · nog {kcalRemaining} kcal
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
                    <strong>Context:</strong> {noteEventsForDay.length}{" "}
                    notitie(s)
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
            </div>
          )}

          {showAddButtons && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "stretch",
                marginTop: 6,
              }}
            >
              <button
                onClick={() => setAddEventType("glucoseBoost")}
                style={{
                  ...buttonStyle,
                  background: "#fff7ed",
                  border: "1px solid #fdba74",
                  color: "#c2410c",
                  minHeight: 42,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: window.innerWidth < 900 ? 12 : 13,
                  fontWeight: 700,
                  flex: "1 1 calc(50% - 8px)",
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
                  minHeight: 42,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: window.innerWidth < 900 ? 12 : 13,
                  fontWeight: 700,
                  flex: "1 1 calc(50% - 8px)",
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
                  minHeight: 42,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: window.innerWidth < 900 ? 12 : 13,
                  fontWeight: 700,
                  flex: "1 1 calc(50% - 8px)",
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
                  minHeight: 42,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: window.innerWidth < 900 ? 12 : 13,
                  fontWeight: 700,
                  flex: "1 1 calc(50% - 8px)",
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
                  minHeight: 42,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: window.innerWidth < 900 ? 12 : 13,
                  fontWeight: 700,
                  flex: "1 1 calc(50% - 8px)",
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
          showTimelineControls={showTimelineControls}
          setShowTimelineControls={setShowTimelineControls}
          setAddEventType={setAddEventType}
          totalTimelineItems={totalTimelineItems}
          selectedDate={selectedDate}
          selectedDay={selectedDay}
          clearDailyLog={clearDailyLog}
          fillDailyRepeats={fillDailyRepeats}
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
