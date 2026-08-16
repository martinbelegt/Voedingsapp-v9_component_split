import React, { useEffect, useState } from "react";
import { DailyMealList } from "./DailyMealList";
import { DailyEventAddModal } from "./DailyEventAddModal";
import { requestNotificationPermission } from "../../services/notificationService";
import { TrainingPlanModal } from "./TrainingPlanModal";
import { ModuleNavigation } from "../navigation/ModuleNavigation";
import { CompactEventPanel } from "../registration/CompactEventPanel";
import { timelineRegistrationModules } from "../../data/navigationConfig";

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
  showTimelineAnalysis,
  showTimelineControls,
  setShowTimelineControls,
  clearDailyLog,
  fillDailyRepeats,
  products,
  exercises = [],
  onOpenExercise,
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
  addWeightEventToDay,
  updateWeightEvent,
  deleteWeightEvent,
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
  addSportSupplementPlanEventToDay,
  updateSportSupplementPlanEvent,
  deleteSportSupplementPlanEvent,
  executeTrainingPlan,
  takeSportSupplementPlan,
  dailyLog = [],
  onAddMeal,
  onAddSupplement,
  onAddExercise,
}) {
  const isMobile = window.innerWidth < 900;
  const [addEventType, setAddEventType] = useState(null);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [timelineRegistrationModule, setTimelineRegistrationModule] =
    useState(null);
  const [timelineRegistrationDirty, setTimelineRegistrationDirty] =
    useState(false);
  const [pendingTimelineModule, setPendingTimelineModule] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null);

  const mealsForDay = selectedDay?.meals || [];
  const insulinEventsForDay = selectedDay?.insulinEvents || [];
  const glucoseEventsForDay = selectedDay?.glucoseEvents || [];
  const glucoseBoostEventsForDay = selectedDay?.glucoseBoostEvents || [];
  const movementEventsForDay = selectedDay?.movementEvents || [];
  const weightEventsForDay = selectedDay?.weightEvents || [];
  const bowelEventsForDay = selectedDay?.bowelEvents || [];
  const totalTimelineItems =
    mealsForDay.length +
    insulinEventsForDay.length +
    glucoseEventsForDay.length +
    glucoseBoostEventsForDay.length +
    movementEventsForDay.length +
    weightEventsForDay.length +
    noteEventsForDay.length +
    bowelEventsForDay.length +
    (selectedDay?.trainingPlanEvents || []).length;

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
      ? "Je plant vooruit. Gebruik dit totaal om eerder op de dag bij te sturen op eiwit, kcal, KH, insulineadvies en toegediende insuline."
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
    if (eventType === "supplement" || eventType === "medication") {
      addSupplementEventToDay({
        date,
        eventTime,
        name: value1,
        dosage: value2,
        note: value3,
        repeat: repeat || "none",
        intakeType: eventType,
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

  function openTimelineRegistration(moduleId) {
    const inlineModule = [
      "glucose",
      "insulin",
      "medicine",
      "weight",
      "movement",
      "bowel",
      "note",
    ].includes(moduleId);

    if (timelineRegistrationModule && timelineRegistrationDirty) {
      setPendingTimelineModule(
        timelineRegistrationModule === moduleId ? "__close__" : moduleId,
      );
      return;
    }

    if (inlineModule) {
      setTimelineRegistrationModule((current) =>
        current === moduleId ? null : moduleId,
      );
      return;
    }

    setTimelineRegistrationModule(null);
    if (moduleId === "meal") onAddMeal();
    else if (moduleId === "supplement") onAddSupplement();
    else if (moduleId === "exercise") onAddExercise();
    else setAddEventType(moduleId);
  }

  function discardTimelineChanges() {
    const pending = pendingTimelineModule;
    setPendingTimelineModule(null);
    setTimelineRegistrationDirty(false);
    setTimelineRegistrationModule(null);

    if (pending && pending !== "__close__") {
      window.requestAnimationFrame(() => openTimelineRegistration(pending));
    }
  }

  const advisedInsulin = (selectedDay?.meals || []).reduce(
    (sum, meal) => sum + (Number(meal?.totals?.insulin) || 0),
    0,
  );

  const administeredInsulin = Number(dayTotals?.insulin || 0);

  const insulinDiff =
    Math.round((administeredInsulin - advisedInsulin) * 100) / 100;
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
    <div style={{ display: "grid", gap: 14 }}>
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
          padding: isMobile ? "6px 8px" : cardStyle?.padding,
        }}
      >
        {/* Tijdlijnpanelen */}
        <div
          style={{
            display: "grid",
            gap: isMobile ? 4 : 12,
            marginBottom: isMobile ? 4 : 10,
          }}
        >
          <div style={{ display: "grid", gap: isMobile ? 6 : 8 }}>
            <ModuleNavigation
              title="Registreren op de tijdlijn"
              modules={timelineRegistrationModules}
              activeModuleId={timelineRegistrationModule}
              onSelect={openTimelineRegistration}
            />

            {timelineRegistrationModule && (
              <CompactEventPanel
                key={timelineRegistrationModule}
                moduleId={timelineRegistrationModule}
                selectedDate={selectedDate}
                onDirtyChange={setTimelineRegistrationDirty}
                discardPrompt={pendingTimelineModule !== null}
                onKeepEditing={() => setPendingTimelineModule(null)}
                onDiscard={discardTimelineChanges}
                onCancel={() => setTimelineRegistrationModule(null)}
                onSubmit={(values) => {
                  if (values.moduleId === "glucose") {
                    addGlucoseEventToDay({
                      date: values.eventTime.slice(0, 10),
                      eventTime: values.eventTime,
                      glucoseValue: values.value,
                      note: [values.context, values.note]
                        .filter(Boolean)
                        .join(" · "),
                    });
                  }
                  if (values.moduleId === "insulin") {
                    addInsulinEventToDay({
                      date: values.eventTime.slice(0, 10),
                      eventTime: values.eventTime,
                      units: values.units,
                      insulinType: values.insulinType,
                      note: values.note,
                    });
                  }
                  if (values.moduleId === "medicine") {
                    addSupplementEventToDay({
                      date: values.eventTime.slice(0, 10),
                      eventTime: values.eventTime,
                      name: values.name,
                      dosage: values.dosage,
                      note: values.note,
                      repeat: values.repeat || "none",
                      intakeType: "medication",
                    });
                  }
                  if (values.moduleId === "movement") {
                    addMovementEventToDay({
                      date: values.eventTime.slice(0, 10),
                      eventTime: values.eventTime,
                      activityType: values.activityType,
                      durationMinutes: values.durationMinutes,
                      intensityType: values.intensityType,
                      note: values.note,
                      repeat: values.repeat || "none",
                    });
                  }
                  if (values.moduleId === "weight") {
                    addWeightEventToDay({
                      eventTime: values.eventTime,
                      valueKg: values.valueKg,
                      note: values.note,
                    });
                  }
                  if (values.moduleId === "bowel") {
                    addBowelEventToDay({
                      date: values.eventTime.slice(0, 10),
                      eventTime: values.eventTime,
                      bristolScore: values.bristolScore,
                      bowelColor: values.bowelColor,
                      urgency: values.urgency,
                      note: values.note,
                    });
                  }
                  if (values.moduleId === "note") {
                    const noteEvent = addNoteEventToDay({
                      date: values.eventTime.slice(0, 10),
                      eventTime: values.eventTime,
                      note: values.note,
                      context: values.context,
                      alarmEnabled: true,
                      alarmAt: values.eventTime,
                    });
                    scheduleLocalAlarm({
                      id: noteEvent.id,
                      alarmAt: noteEvent.alarmAt,
                      title: "VoedingsApp reminder",
                      body: noteEvent.note || "Geplande notitie",
                    });
                  }
                  setTimelineRegistrationDirty(false);
                  setTimelineRegistrationModule(null);
                }}
              />
            )}
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
                      💉 Toegediend{" "}
                      {(Number(administeredInsulin) || 0).toFixed(1)}E
                    </span>
                    <span style={totalsChip("#fef3c7", "#a16207")}>
                      💊 Creonadvies {dayTotals?.creon25 || 0}x25k +{" "}
                      {dayTotals?.creon10 || 0}x10k
                    </span>
                    {dayTotals?.hasActualCreon && (
                      <span style={totalsChip("#ecfccb", "#3f6212")}>
                        💊 Werkelijk ingenomen{" "}
                        {dayTotals?.actualCreon25 || 0}x25k +{" "}
                        {dayTotals?.actualCreon10 || 0}x10k
                      </span>
                    )}
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
                    <strong>Insuline:</strong>{" "}
                    {administeredInsulin}E /{" "}
                    <strong>insulineadvies:</strong> {advisedInsulin}E ·{" "}
                    {insulinDiffLabel}
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

        </div>

        {/* Chronologische lijst */}
        <DailyMealList
          mealsForDay={mealsForDay}
          selectedDay={selectedDay}
          products={products}
          exercises={exercises}
          onOpenExercise={onOpenExercise}
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
          weightEventsForDay={weightEventsForDay}
          updateWeightEvent={updateWeightEvent}
          deleteWeightEvent={deleteWeightEvent}
          trainingPlansForDay={selectedDay?.trainingPlanEvents || []}
          updateTrainingPlanEvent={updateTrainingPlanEvent}
          deleteTrainingPlanEvent={deleteTrainingPlanEvent}
          dailyLog={dailyLog}
          executeTrainingPlan={executeTrainingPlan}
          supplementEventsForDay={selectedDay?.supplementEvents || []}
          supplementPlansForDay={
            selectedDay?.sportSupplementPlanEvents || []
          }
          addSupplementEventToDay={addSupplementEventToDay}
          updateSupplementEvent={updateSupplementEvent}
          deleteSupplementEvent={deleteSupplementEvent}
          updateSupplementPlanEvent={updateSportSupplementPlanEvent}
          deleteSupplementPlanEvent={deleteSportSupplementPlanEvent}
          takeSupplementPlan={takeSportSupplementPlan}
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
          setSelectedDate={setSelectedDate}
          today={today}
          selectedDay={selectedDay}
          clearDailyLog={clearDailyLog}
          fillDailyRepeats={fillDailyRepeats}
          onAddMeal={onAddMeal}
        />
      </div>

      <TrainingPlanModal
        open={trainingModalOpen}
        selectedDate={selectedDate}
        training={null}
        onClose={() => setTrainingModalOpen(false)}
        onSave={(values) => {
          addTrainingPlanEventToDay(values);
          setTrainingModalOpen(false);
        }}
      />

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
