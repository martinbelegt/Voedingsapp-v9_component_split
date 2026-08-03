import React, { useState } from "react";
import { DailyMealCard } from "./DailyMealCard";
import { DailyTimelineItem } from "./DailyTimelineItem";
import { DailyEventTimeEditorModal } from "./DailyEventTimeEditorModal";
import { DailyEventEditModal } from "../DailyEventEditModal";
import { DailyTimerModal } from "../DailyTimerModal";
import { DailyEventDetailModal } from "./DailyEventDetailModal";
import { TrainingPlanDetailModal } from "./TrainingPlanDetailModal";
import { TrainingPlanModal } from "./TrainingPlanModal";
import { PlannedExecutionModal } from "./PlannedExecutionModal";
import { SportSupplementPlanModal } from "./SportSupplementPlanModal";
import { DailyDateNavigation } from "./DailyDateNavigation";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import {
  getCompactExerciseSummary,
  sortTrainingExercises,
} from "../../services/trainingStructureService";
import {
  isSportSupplementPlanTaken,
  isTrainingPlanExecuted,
} from "../../services/plannedExecutionService";
import { term } from "../../config/terminology";
import { formatWeightKg } from "../../services/weightEventService";

export function formatCreonAdvice(totals = {}) {
  const doses = [
    [Number(totals.creon35 ?? totals.best?.c35) || 0, "35.000"],
    [Number(totals.creon25) || 0, "25.000"],
    [Number(totals.creon10) || 0, "10.000"],
    [Number(totals.creon5 ?? totals.best?.c5) || 0, "5.000"],
  ].filter(([count]) => count > 0);

  if (doses.length === 0) return "Geen Creon nodig";
  return `Creonadvies ${doses
    .map(([count, strength]) => (count === 1 ? strength : `${count}×${strength}`))
    .join(" + ")}`;
}

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
  glucoseBoostEventsForDay = [],
  updateGlucoseBoostEvent,
  deleteGlucoseBoostEvent,
  movementEventsForDay = [],
  updateMovementEvent,
  deleteMovementEvent,
  weightEventsForDay = [],
  updateWeightEvent,
  deleteWeightEvent,
  trainingPlansForDay = [],
  updateTrainingPlanEvent,
  deleteTrainingPlanEvent,
  dailyLog = [],
  executeTrainingPlan,

  supplementEventsForDay = [],
  supplementPlansForDay = [],
  addSupplementEventToDay,
  updateSupplementEvent,
  deleteSupplementEvent,
  updateSupplementPlanEvent,
  deleteSupplementPlanEvent,
  takeSupplementPlan,

  bowelEventsForDay = [],
  updateBowelEvent,
  deleteBowelEvent,

  noteEventsForDay = [],
  updateNoteEvent,
  deleteNoteEvent,
  showTimelineControls = false,
  setShowTimelineControls,
  setAddEventType,
  totalTimelineItems = 0,
  selectedDate,
  setSelectedDate,
  today,
  clearDailyLog,
  fillDailyRepeats,
  onAddMeal,
}) {
  const isMobile = window.innerWidth < 900;
  const [expandedIds, setExpandedIds] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerEvent, setTimerEvent] = useState(null);
  const [compactTimeline, setCompactTimeline] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState("all");
  const [timelineOrder, setTimelineOrder] = useState("newest");

  const [visibleTypes, setVisibleTypes] = useState({
    routineExecution: true,
    meal: true,
    insulinAdvice: true,
    insulin: true,
    glucose: true,
    glucoseBoost: true,
    movement: true,
    weight: true,
    supplement: true,
    supplementPlan: true,
    bowel: true,
    note: true,
    trainingPlan: true,
  });

  const [timeEditorEvent, setTimeEditorEvent] = useState(null);
  const [detailTraining, setDetailTraining] = useState(null);
  const [editingTraining, setEditingTraining] = useState(null);
  const [executingTraining, setExecutingTraining] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [detailSupplementPlan, setDetailSupplementPlan] = useState(null);
  const [editingSupplementPlan, setEditingSupplementPlan] = useState(null);
  const [executingSupplementPlan, setExecutingSupplementPlan] = useState(null);

  function toggleVisibleType(type) {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  function formatTime(value) {
    return new Date(value).toLocaleString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const rawTimelineItems = [
    ...mealsForDay.map((meal) => ({
      id: meal.id,
      itemType: "meal",
      time: meal.eatenAt || "",
      sortTime: meal.eatenAt
        ? new Date(new Date(meal.eatenAt).getTime() + 100).toISOString()
        : "",
      meal,
    })),

    ...mealsForDay
      .filter(
        (meal) =>
          meal?.totals?.insulin != null &&
          meal?.totals?.insulin !== "" &&
          Number(meal?.totals?.insulin) > 0,
      )
      .map((meal) => ({
        id: `advice-${meal.id}`,
        itemType: "insulinAdvice",
        time: meal.eatenAt || "",
        sortTime: meal.eatenAt
          ? new Date(new Date(meal.eatenAt).getTime() + 90).toISOString()
          : "",
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

    ...glucoseBoostEventsForDay.map((event) => ({
      id: event.id,
      itemType: "glucoseBoost",
      time: event.eventTime || "",
      event,
    })),

    ...movementEventsForDay.map((event) => ({
      id: event.id,
      itemType: "movement",
      time: event.eventTime || "",
      event,
    })),
    ...weightEventsForDay.map((event) => ({
      id: event.id,
      itemType: "weight",
      time: event.eventTime || event.datetime || "",
      event,
    })),
    ...trainingPlansForDay.map((event) => ({
      id: event.id,
      itemType: "trainingPlan",
      time: event.eventTime || "",
      event,
    })),

    ...(supplementEventsForDay || []).map((event) => ({
      id: event.id,
      itemType: "supplement",
      time: event.eventTime || "",
      event,
    })),
    ...supplementPlansForDay.map((event) => ({
      id: event.id,
      itemType: "supplementPlan",
      time: event.eventTime || "",
      event,
    })),

    ...bowelEventsForDay.map((event) => ({
      id: event.id,
      itemType: "bowel",
      time: event.eventTime || "",
      event,
    })),
    ...noteEventsForDay.map((event) => ({
      id: event.id,
      itemType: "note",
      time: event.eventTime || "",
      event,
    })),
  ].sort((a, b) => {
    const timeA = new Date(a.sortTime || a.time || 0).getTime();
    const timeB = new Date(b.sortTime || b.time || 0).getTime();

    return timeB - timeA;
  });

  const routineGroups = new Map();
  rawTimelineItems.forEach((item) => {
    const source = item.meal || item.event;
    const execution = source?.routineExecution;
    if (!execution || !["meal", "supplement"].includes(item.itemType)) return;
    const existing = routineGroups.get(execution.id) || { execution, children: [], time: item.time };
    existing.children.push(item);
    routineGroups.set(execution.id, existing);
  });

  const timelineItems = [
    ...rawTimelineItems.filter((item) => {
      const source = item.meal || item.event;
      return !source?.routineExecution || !["meal", "supplement"].includes(item.itemType);
    }),
    ...Array.from(routineGroups.values()).map((group) => ({
      id: group.execution.id,
      itemType: "routineExecution",
      time: group.time,
      group,
    })),
  ];

  function getFilteredTimelineItems() {
    if (timelineFilter === "all") return timelineItems;

    if (timelineFilter === "movementOnly") {
      return timelineItems.filter(
        (item) =>
          item.itemType === "movement" || item.itemType === "supplement",
      );
    }

    if (timelineFilter === "sportFocus") {
      const sportItems = timelineItems.filter(
        (item) => item.itemType === "movement",
      );

      if (sportItems.length === 0) return [];

      return timelineItems.filter((item) => {
        if (!item.time) return false;

        const itemTime = new Date(item.time).getTime();

        return sportItems.some((sportItem) => {
          const sportTime = new Date(sportItem.time).getTime();
          const windowStart = sportTime - 2 * 60 * 60 * 1000;
          const windowEnd = sportTime + 3 * 60 * 60 * 1000;

          return itemTime >= windowStart && itemTime <= windowEnd;
        });
      });
    }

    if (timelineFilter === "insulin") {
      return timelineItems.filter((item) => item.itemType === "insulin");
    }

    if (timelineFilter === "glucose") {
      return timelineItems.filter((item) => item.itemType === "glucose");
    }

    if (timelineFilter === "metabolic") {
      return timelineItems.filter(
        (item) =>
          item.itemType === "insulin" ||
          item.itemType === "glucose" ||
          item.itemType === "insulinAdvice",
      );
    }

    return timelineItems;
  }

  function getSortedTimelineItems(items) {
    const sorted = [...items].sort((a, b) => {
      const timeA = new Date(a.sortTime || a.time || 0).getTime();
      const timeB = new Date(b.sortTime || b.time || 0).getTime();

      return timelineOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return sorted;
  }

  const visibleTimelineItems = getSortedTimelineItems(
    getFilteredTimelineItems().filter((item) => visibleTypes[item.itemType]),
  );

  function getSportPhaseLabel(item) {
    if (timelineFilter !== "sportFocus") return null;

    const movementItems = timelineItems.filter(
      (t) => t.itemType === "movement",
    );

    if (movementItems.length === 0) return null;

    const itemTime = new Date(item.time).getTime();

    let closestSport = null;
    let closestDiff = Infinity;

    movementItems.forEach((sport) => {
      const diff = itemTime - new Date(sport.time).getTime();

      if (Math.abs(diff) < Math.abs(closestDiff)) {
        closestDiff = diff;
        closestSport = sport;
      }
    });

    if (!closestSport) return null;

    const hours = closestDiff / 1000 / 60 / 60;

    if (hours < 0 && hours >= -2) return "PRE";
    if (hours >= 0 && hours <= 1) return "TIJDENS";
    if (hours > 1 && hours <= 3) return "POST";

    return null;
  }

  function phasePrefix(item) {
    const phaseLabel = getSportPhaseLabel(item);

    if (!phaseLabel) return "";

    if (phaseLabel === "PRE") {
      return "🔵 PRE · ";
    }

    if (phaseLabel === "TIJDENS") {
      return "🟣 TIJDENS · ";
    }

    return "🟢 POST · ";
  }

  function toggleExpanded(id) {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  }

  function expandAll() {
    setExpandedIds(visibleTimelineItems.map((item) => item.id));
  }

  function collapseAll() {
    setExpandedIds([]);
  }

  function saveEventTime(nextValue) {
    if (!timeEditorEvent) return;

    const { type, id } = timeEditorEvent;

    if (type === "insulin") updateInsulinEvent(id, { eventTime: nextValue });
    if (type === "glucose") updateGlucoseEvent(id, { eventTime: nextValue });
    if (type === "glucoseBoost")
      updateGlucoseBoostEvent(id, { eventTime: nextValue });
    if (type === "movement") updateMovementEvent(id, { eventTime: nextValue });
    if (type === "weight") updateWeightEvent(id, { eventTime: nextValue });
    if (type === "bowel") updateBowelEvent(id, { eventTime: nextValue });

    setTimeEditorEvent(null);
  }

  function timerButton(event) {
    return (
      <button
        onClick={() => {
          setTimerEvent(event);
          setShowTimerModal(true);
        }}
        style={{
          ...buttonStyle,
          fontSize: 12,
          padding: "4px 7px",
          borderRadius: 999,
          background: "#fff7ed",
          border: "1px solid #fdba74",
          color: "#c2410c",
        }}
      >
        ⏱ Timer
      </button>
    );
  }

  function editButton(event, type) {
    return (
      <button
        onClick={() => {
          setEditingEvent(event);
          setEditingType(type);
        }}
        style={{
          ...buttonStyle,
          ...(window.innerWidth < 900
            ? {
                padding: "3px 6px",
                fontSize: 11,
                lineHeight: 1,
                minHeight: 24,
                borderRadius: 4,
              }
            : {}),
        }}
      >
        Wijzig
      </button>
    );
  }

  function deleteButton(event, type) {
    return (
      <button
        onClick={() => {
          const ok = window.confirm("Dit item verwijderen?");
          if (!ok) return;

          if (type === "glucose") {
            deleteGlucoseEvent(event.id);
          }

          if (type === "insulin") {
            deleteInsulinEvent(event.id);
          }

          if (type === "bowel") {
            deleteBowelEvent(event.id);
          }
          if (type === "glucoseBoost") {
            deleteGlucoseBoostEvent(event.id);
          }
          if (type === "supplement") {
            deleteSupplementEvent(event.id);
          }
        }}
        style={{
          ...buttonStyle,
          ...(window.innerWidth < 900
            ? {
                padding: "3px 6px",
                fontSize: 11,
                lineHeight: 1,
                minHeight: 24,
                borderRadius: 4,
              }
            : {}),
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#991b1b",
        }}
      >
        🗑 Wis
      </button>
    );
  }

  function toggleButtonStyle(active) {
    return {
      ...buttonStyle,

      background: active ? "#dbeafe" : "#f8fafc",

      border: active ? "1px solid #93c5fd" : "1px solid #cbd5e1",

      color: active ? "#1d4ed8" : "#334155",

      boxShadow: "none",

      outline: "none",
    };
  }

  const allExpanded =
    visibleTimelineItems.length > 0 &&
    visibleTimelineItems.every((item) => expandedIds.includes(item.id));

  function handleToggleExpandAll() {
    if (allExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  }

  return (
    <>
      {showTimelineControls && (
        <>
          <div
            style={{
              display: "flex",
              gap: isMobile ? 4 : 8,
              marginBottom: isMobile ? 4 : 8,
              flexWrap: "wrap",
              alignItems: "stretch",
            }}
          >
            <button
              onClick={() => setCompactTimeline((v) => !v)}
              style={{
                ...toggleButtonStyle(compactTimeline),
                minHeight: isMobile ? 30 : 40,
                padding: isMobile ? "4px 6px" : "8px 10px",
                borderRadius: isMobile ? 6 : 10,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                flex: "1 1 calc(50% - 8px)",
                lineHeight: isMobile ? 1.05 : undefined,
              }}
            >
              {compactTimeline ? "Normale tijdlijn" : "Compacte tijdlijn"}
            </button>

            <button
              onClick={() => setTimelineFilter("all")}
              style={{
                ...toggleButtonStyle(timelineFilter === "all"),
                minHeight: isMobile ? 30 : 40,
                padding: isMobile ? "4px 6px" : "8px 10px",
                borderRadius: isMobile ? 6 : 10,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                flex: "1 1 calc(50% - 8px)",
                lineHeight: isMobile ? 1.05 : undefined,
              }}
            >
              Alles
            </button>

            <button
              onClick={() => setTimelineFilter("insulin")}
              style={{
                ...toggleButtonStyle(timelineFilter === "insulin"),
                minHeight: isMobile ? 30 : 40,
                padding: isMobile ? "4px 6px" : "8px 10px",
                borderRadius: isMobile ? 6 : 10,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                flex: "1 1 calc(50% - 8px)",
                lineHeight: isMobile ? 1.05 : undefined,
              }}
            >
              Alleen insuline
            </button>

            <button
              onClick={() => setTimelineFilter("glucose")}
              style={{
                ...toggleButtonStyle(timelineFilter === "glucose"),
                minHeight: isMobile ? 30 : 40,
                padding: isMobile ? "4px 6px" : "8px 10px",
                borderRadius: isMobile ? 6 : 10,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                flex: "1 1 calc(50% - 8px)",
                lineHeight: isMobile ? 1.05 : undefined,
              }}
            >
              Alleen glucose
            </button>

            <button
              onClick={() => setTimelineFilter("metabolic")}
              style={{
                ...toggleButtonStyle(timelineFilter === "metabolic"),
                minHeight: isMobile ? 30 : 40,
                padding: isMobile ? "4px 6px" : "8px 10px",
                borderRadius: isMobile ? 6 : 10,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                flex: "1 1 calc(50% - 8px)",
                lineHeight: isMobile ? 1.05 : undefined,
              }}
            >
              Insuline + glucose
            </button>

            <button
              onClick={() =>
                setTimelineFilter((prev) =>
                  prev === "sportFocus" ? "all" : "sportFocus",
                )
              }
              style={{
                ...toggleButtonStyle(timelineFilter === "sportFocus"),
                minHeight: isMobile ? 30 : 40,
                padding: isMobile ? "4px 6px" : "8px 10px",
                borderRadius: isMobile ? 6 : 10,
                fontSize: isMobile ? 12 : 13,
                fontWeight: 700,
                flex: "1 1 calc(50% - 8px)",
                lineHeight: isMobile ? 1.05 : undefined,
              }}
            >
              {timelineFilter === "sportFocus"
                ? "Sport focus uit"
                : "Sport focus aan"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: isMobile ? 4 : 8,
              flexWrap: "wrap",
              marginBottom: isMobile ? 4 : 8,
              alignItems: "stretch",
            }}
          >
            {[
              ["meal", "Maaltijden"],
              ["insulinAdvice", "Advies"],
              ["insulin", term("insulin")],
              ["glucose", term("glucose")],
              ["glucoseBoost", "Boosts"],
              ["supplement", "Supplementen"],
              ["movement", "Sport"],
              ["trainingPlan", "Training"],
              ["bowel", "Stoelgang"],
            ].map(([type, label]) => (
              <button
                key={type}
                onClick={() => toggleVisibleType(type)}
                style={{
                  ...buttonStyle,
                  minHeight: isMobile ? 30 : 40,
                  padding: isMobile ? "4px 6px" : "8px 10px",
                  borderRadius: isMobile ? 6 : 10,
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 700,
                  flex: "1 1 calc(50% - 8px)",
                  lineHeight: isMobile ? 1.05 : undefined,
                  background: visibleTypes[type] ? "#bbf7d0" : "#f8fafc",
                  color: visibleTypes[type] ? "#14532d" : "#166534",
                  border: visibleTypes[type]
                    ? "1px solid #22c55e"
                    : "1px solid #cbd5e1",
                }}
              >
                {visibleTypes[type] ? "☑" : "☐"} {label}
              </button>
            ))}
          </div>
        </>
      )}

      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "nowrap",
          alignItems: "center",
          marginTop: isMobile ? 6 : 8,
          marginBottom: isMobile ? 8 : 10,
          padding: isMobile ? "6px 5px" : "8px 7px",
          background: "#eef7f0",
          border: "2px solid #2f4a38",
          borderRadius: 6,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.78)",
          width: "fit-content",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setTimelineOrder((prev) =>
              prev === "newest" ? "oldest" : "newest",
            )
          }
          aria-label={
            timelineOrder === "newest" ? "Nieuwste bovenaan" : "Oudste bovenaan"
          }
          style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: timelineOrder === "newest" ? "#eff6ff" : "#f8fafc",
            border:
              timelineOrder === "newest"
                ? "1px solid #bfdbfe"
                : "1px solid #cbd5e1",
            color: timelineOrder === "newest" ? "#0f172a" : "#1f2937",
            height: 28,
            minHeight: 28,
            padding: "1px 4px",
            borderRadius: 3,
            fontSize: 17,
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          ⇅
        </button>

        <button
          type="button"
          onClick={handleToggleExpandAll}
          aria-label={allExpanded ? "Alles inklappen" : "Alles uitklappen"}
          title={allExpanded ? "Alles inklappen" : "Alles uitklappen"}
          style={{
            ...toggleButtonStyle(allExpanded),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 28,
            minHeight: 28,
            padding: "1px 4px",
            borderRadius: 3,
            fontSize: 14,
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {allExpanded ? "▲▲" : "▼▼"}
        </button>

        <button
          type="button"
          onClick={() => {
            const didAddRepeats = fillDailyRepeats();
            window.alert(
              didAddRepeats
                ? "Dagelijkse routine toegevoegd."
                : "Geen dagelijkse routine gevonden voor gisteren.",
            );
          }}
          style={{
            ...buttonStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f3ff",
            border: "1px solid #c4b5fd",
            color: "#5b21b6",
            height: 28,
            minHeight: 28,
            padding: "1px 4px",
            borderRadius: 3,
            fontSize: 17,
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            focusable="false"
            style={{
              display: "block",
              color: "currentColor",
            }}
          >
            <path
              d="M7 5H18C19.1 5 20 5.9 20 7V12H17V8H8.9L11.1 10.2L9 12.3L3.2 6.5L9 0.7L11.1 2.8L8.9 5H7Z"
              fill="currentColor"
            />
            <path
              d="M17 19H6C4.9 19 4 18.1 4 17V12H7V16H15.1L12.9 13.8L15 11.7L20.8 17.5L15 23.3L12.9 21.2L15.1 19H17Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          type="button"
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            height: 28,
            minHeight: 28,
            padding: "1px 4px",
            borderRadius: 3,
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          🗑
        </button>

        <DailyDateNavigation
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          today={today}
          buttonStyle={buttonStyle}
        />
      </div>

      {!selectedDay || visibleTimelineItems.length === 0 ? (
        <div
          style={{
            color: "#64748b",
            fontSize: 13,
            padding: "8px 4px",
          }}
        >
          Geen tijdlijnmomenten opgeslagen voor deze dag.
        </div>
      ) : (
        visibleTimelineItems.map((item, index) => {
          const itemCompact =
            compactTimeline || !expandedIds.includes(item.id);

          if (item.itemType === "routineExecution") {
            const { execution, children } = item.group;
            return (
              <DailyTimelineItem
                key={item.id}
                itemType="routine"
                compact={itemCompact}
                expanded={expandedIds.includes(item.id)}
                onToggle={() => toggleExpanded(item.id)}
                icon={execution.icon || "☀️"}
                title={`${execution.name} · ${children.length} onderdelen`}
                timeLabel={formatTime(item.time)}
                subtitle="Uitgevoerde routine"
                accentColor={execution.color || "#557a5b"}
                backgroundColor="#f2f7f3"
                borderColor="#b9cbbb"
                detailContent={
                  <div style={{ display: "grid", gap: 5 }}>
                    {children.map((child) => (
                      <div key={child.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 7px", borderRadius: 6, background: "#fff" }}>
                        <span>{child.itemType === "meal" ? "🍽️" : "💊"} {child.itemType === "meal" ? (child.meal.rows?.map((row) => products.find((product) => product.id === row.productId)?.name).filter(Boolean).join(", ") || child.meal.name) : (child.event.supplementName || child.event.name)}</span>
                        <small>{child.itemType === "meal" ? "Voeding" : "Supplement"}</small>
                      </div>
                    ))}
                  </div>
                }
              />
            );
          }

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
                compact={itemCompact}
                expanded={expandedIds.includes(item.id)}
              />
            );
          }

          if (item.itemType === "insulinAdvice") {
            const meal = item.meal;

            return (
              <DailyTimelineItem
                key={item.id}
                indentLevel={0}
                compact={itemCompact}
                icon="💡"
                title={`💡 Insulineadvies ${
                  meal.totals?.insulin != null
                    ? Math.round(Number(meal.totals.insulin) * 100) / 100
                    : "?"
                }E      💊 ${formatCreonAdvice(meal.totals)}`}
                timeLabel={formatTime(meal.eatenAt)}
                subtitle={null}
                accentColor="#166534"
                backgroundColor="#eff6ff"
                borderColor="#93c5fd"
                expanded={false}
                detailContent={null}
              />
            );
          }

          if (item.itemType === "insulin") {
            const event = item.event;

            return (
              <DailyTimelineItem
                key={event.id}
                indentLevel={2}
                expanded={expandedIds.includes(event.id)}
                onToggle={() => setDetailEvent({ type: "insulin", event })}
                icon="💉"
                title={`💉 Toegediend: ${
                  event.insulinType || "Insuline"
                } ${event.units}E`}
                timeLabel={formatTime(event.eventTime)}
                subtitle={null}
                compact={itemCompact}
                accentColor="#1d4ed8"
                backgroundColor="#eff6ff"
                borderColor="#93c5fd"
                actions={null}
                detailContent={
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    Werkelijk toegediende insuline.
                  </div>
                }
              />
            );
          }

          if (item.itemType === "glucose") {
            const event = item.event;

            const glucoseValue = Number(
              String(event.glucoseValue).replace(",", "."),
            );

            const glucoseColors =
              glucoseValue <= 3.9
                ? {
                    accent: "#991b1b",
                    background: "#fee2e2",
                    border: "#fca5a5",
                  }
                : glucoseValue >= 15
                  ? {
                      accent: "#991b1b",
                      background: "#fee2e2",
                      border: "#fca5a5",
                    }
                  : glucoseValue > 10
                    ? {
                        accent: "#c2410c",
                        background: "#ffedd5",
                        border: "#fdba74",
                      }
                    : {
                        accent: "#166534",
                        background: "#dcfce7",
                        border: "#86efac",
                      };

            const isDangerGlucose = glucoseValue <= 4 || glucoseValue >= 16;

            return (
              <DailyTimelineItem
                key={event.id}
                indentLevel={3}
                expanded={false}
                onToggle={() => setDetailEvent({ type: "glucose", event })}
                icon="📈"
                title={`${event.glucoseValue} mmol/L`}
                timeLabel={formatTime(event.eventTime)}
                subtitle={null}
                compact={itemCompact}
                accentColor={glucoseColors.accent}
                backgroundColor={glucoseColors.background}
                borderColor={glucoseColors.border}
                actions={null}
                detailContent={null}
              />
            );
          }

          if (item.itemType === "glucoseBoost") {
            const event = item.event;

            return (
              <DailyTimelineItem
                key={event.id}
                indentLevel={2}
                expanded={expandedIds.includes(event.id)}
                onToggle={() => setDetailEvent({ type: "glucoseBoost", event })}
                compact={itemCompact}
                icon="⚡"
                title={`⚡ +${event.kh || "?"}g snelle KH`}
                timeLabel={formatTime(event.eventTime)}
                subtitle={`${phasePrefix(item)}${event.source || "Glucoseboost"}${
                  event.note ? ` · ${event.note}` : ""
                }`}
                accentColor="#c2410c"
                backgroundColor="#fff7ed"
                borderColor="#fdba74"
                actions={null}
                detailContent={
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    Hypo-correctie / snelle glucoseboost.
                  </div>
                }
              />
            );
          }

          if (item.itemType === "movement") {
            const event = item.event;

            return (
              <DailyTimelineItem
                key={event.id}
                expanded={expandedIds.includes(event.id)}
                onToggle={() => setDetailEvent({ type: "movement", event })}
                compact={itemCompact}
                icon={
                  event.activityType?.toLowerCase().includes("kracht")
                    ? "🟠🏋️"
                    : "🟠🚶"
                }
                title={`${event.activityType || "Beweging"}${
                  event.durationMinutes ? ` · ${event.durationMinutes} min` : ""
                }`}
                timeLabel={formatTime(event.eventTime)}
                subtitle={`${phasePrefix(item)}${
                  event.intensityType || "Belasting onbekend"
                }${event.note ? ` · ${event.note}` : ""}`}
                accentColor="#4c1d95"
                backgroundColor="#f5f3ff"
                borderColor="#c4b5fd"
                actions={null}
                detailContent={
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    Beweging/sportmoment in metabole tijdlijn.
                  </div>
                }
              />
            );
          }

          if (item.itemType === "weight") {
            const event = item.event;

            return (
              <DailyTimelineItem
                key={event.id}
                expanded={false}
                onToggle={() => setDetailEvent({ type: "weight", event })}
                compact={itemCompact}
                icon="⚖️"
                title={`Gewicht · ${formatWeightKg(event.valueKg)} kg`}
                timeLabel={formatTime(event.eventTime || event.datetime)}
                subtitle={event.note || ""}
                accentColor="#0f766e"
                backgroundColor="#f0fdfa"
                borderColor="#99f6e4"
                actions={null}
                detailContent={null}
              />
            );
          }

          if (item.itemType === "trainingPlan") {
            const event = item.event;
            const exercises = sortTrainingExercises(event.exercises || []);
            const executed = isTrainingPlanExecuted(dailyLog, event.id);
            const summary = exercises
              .map(getCompactExerciseSummary)
              .filter(Boolean)
              .join("\n");

            return (
              <DailyTimelineItem
                key={event.id}
                itemType="training"
                compact={itemCompact}
                icon="🏋️"
                title={event.title || "Training"}
                timeLabel={formatTime(event.eventTime)}
                subtitle={
                  summary ||
                  (event.durationMinutes ? `${event.durationMinutes} min` : "Gepland")
                }
                accentColor="#4f7d55"
                backgroundColor="#f8fcf9"
                borderColor="#a7c7ad"
                onToggle={() => setDetailTraining(event)}
                actions={
                  <span
                    style={{
                      color: executed ? "#166534" : "#4f7d55",
                      fontSize: 12,
                      fontWeight: 850,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {executed ? "✅ Uitgevoerd" : "📅 Gepland"}
                  </span>
                }
                detailContent={
                  <div style={{ whiteSpace: "pre-line" }}>{summary}</div>
                }
              />
            );
          }

          if (item.itemType === "supplement") {
            const event = item.event;
            const isMedication = event.intakeType === "medication";
            const dosage = [event.dosage, event.unit].filter(Boolean).join(" ");

            return (
              <DailyTimelineItem
                key={event.id}
                indentLevel={1}
                compact={itemCompact}
                icon="💊"
                title={`${event.supplementName || event.name || (isMedication ? "Medicatie / Creon" : "Supplement")}${
                  dosage ? ` · ${dosage}` : ""
                }`}
                timeLabel={formatTime(event.eventTime)}
                subtitle={event.note || ""}
                accentColor="#6d28d9"
                backgroundColor="#f5f3ff"
                borderColor="#c4b5fd"
                actions={null}
                onToggle={() => setDetailEvent({ type: "supplement", event })}
              />
            );
          }

          if (item.itemType === "bowel") {
            const event = item.event;

            return (
              <DailyTimelineItem
                key={event.id}
                indentLevel={1}
                expanded={false}
                onToggle={() => setDetailEvent({ type: "bowel", event })}
                compact={itemCompact}
                icon="🚽"
                title={`Bristol ${event.bristolScore}`}
                timeLabel={formatTime(event.eventTime)}
                subtitle={`${phasePrefix(item)}${event.urgency || ""}${
                  event.note ? ` · ${event.note}` : ""
                }`}
                accentColor="#92400e"
                backgroundColor="#fffbeb"
                borderColor="#fcd34d"
                actions={null}
                detailContent={null}
              />
            );
          }
          if (item.itemType === "note") {
            const event = item.event;

            return (
              <DailyTimelineItem
                key={event.id}
                indentLevel={1}
                expanded={expandedIds.includes(event.id)}
                onToggle={() => setDetailEvent({ type: "note", event })}
                compact={itemCompact}
                icon={event.alarmEnabled ? "🔔📝" : "📝"}
                title={event.note || "Notitie"}
                timeLabel={formatTime(event.eventTime)}
                subtitle={
                  event.alarmEnabled
                    ? `🔔 Alarm actief${event.context ? ` · ${event.context}` : ""}`
                    : `${phasePrefix(item)}${event.context || ""}`
                }
                accentColor="#475569"
                backgroundColor="#f8fafc"
                borderColor="#cbd5e1"
                actions={null}
                detailContent={
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    {event.note}
                    {event.context ? (
                      <div style={{ marginTop: 6 }}>
                        <strong>Context:</strong> {event.context}
                      </div>
                    ) : null}
                  </div>
                }
              />
            );
          }
          return null;
        })
      )}

      {timeEditorEvent && (
        <DailyEventTimeEditorModal
          initialValue={
            timeEditorEvent.eventTime
              ? timeEditorEvent.eventTime.slice(0, 16)
              : new Date().toISOString().slice(0, 16)
          }
          buttonStyle={buttonStyle}
          onSave={saveEventTime}
          onClose={() => setTimeEditorEvent(null)}
        />
      )}

      <DailyEventDetailModal
        open={Boolean(detailEvent)}
        type={detailEvent?.type}
        event={detailEvent?.event}
        onClose={() => setDetailEvent(null)}
        onEdit={() => {
          setEditingEvent(detailEvent.event);
          setEditingType(detailEvent.type);
          setDetailEvent(null);
        }}
        onDelete={() => {
          if (!window.confirm("Dit tijdlijnmoment verwijderen?")) return;
          const { type, event } = detailEvent;
          if (type === "insulin") deleteInsulinEvent(event.id);
          if (type === "glucose") deleteGlucoseEvent(event.id);
          if (type === "glucoseBoost") deleteGlucoseBoostEvent(event.id);
          if (type === "movement") deleteMovementEvent(event.id);
          if (type === "weight") deleteWeightEvent(event.id);
          if (type === "supplement") deleteSupplementEvent(event.id);
          if (type === "bowel") deleteBowelEvent(event.id);
          if (type === "note") deleteNoteEvent(event.id);
          setDetailEvent(null);
        }}
      />

      <DailyEventDetailModal
        open={Boolean(detailSupplementPlan)}
        type="supplement"
        event={detailSupplementPlan}
        executed={
          detailSupplementPlan
            ? isSportSupplementPlanTaken(dailyLog, detailSupplementPlan.id)
            : false
        }
        onClose={() => setDetailSupplementPlan(null)}
        onEdit={() => {
          setEditingSupplementPlan(detailSupplementPlan);
          setDetailSupplementPlan(null);
        }}
        onDelete={() => {
          if (!window.confirm("Deze supplementplanning verwijderen?")) return;
          deleteSupplementPlanEvent(detailSupplementPlan.id);
          setDetailSupplementPlan(null);
        }}
        onExecute={() => {
          setExecutingSupplementPlan(detailSupplementPlan);
          setDetailSupplementPlan(null);
        }}
      />

      <TrainingPlanDetailModal
        open={Boolean(detailTraining)}
        training={detailTraining}
        executed={
          detailTraining
            ? isTrainingPlanExecuted(dailyLog, detailTraining.id)
            : false
        }
        onClose={() => setDetailTraining(null)}
        onEdit={() => {
          setEditingTraining(detailTraining);
          setDetailTraining(null);
        }}
        onDelete={() => {
          if (window.confirm("Deze geplande training verwijderen?")) {
            deleteTrainingPlanEvent(detailTraining.id);
            setDetailTraining(null);
          }

          if (item.itemType === "supplementPlan") {
            const event = item.event;
            const taken = isSportSupplementPlanTaken(dailyLog, event.id);

            return (
              <DailyTimelineItem
                key={event.id}
                compact={itemCompact}
                icon="💊"
                title={`${event.name || "Supplement"}${
                  event.amount || event.unit
                    ? ` · ${[event.amount, event.unit].filter(Boolean).join(" ")}`
                    : ""
                }`}
                timeLabel={formatTime(event.eventTime)}
                subtitle="Gepland rond training"
                accentColor="#6d28d9"
                backgroundColor="#faf7ff"
                borderColor="#c4b5fd"
                onToggle={() => setDetailSupplementPlan(event)}
                actions={
                  <span style={{ color: taken ? "#166534" : "#6d28d9", fontSize: 12, fontWeight: 850 }}>
                    {taken ? "✅ Ingenomen" : "📅 Gepland"}
                  </span>
                }
              />
            );
          }
        }}
        onExecute={() => {
          setExecutingTraining(detailTraining);
          setDetailTraining(null);
        }}
      />

      <TrainingPlanModal
        open={Boolean(editingTraining)}
        selectedDate={selectedDate}
        training={editingTraining}
        onClose={() => setEditingTraining(null)}
        onSave={(updates) => {
          updateTrainingPlanEvent(editingTraining.id, updates);
          setEditingTraining(null);
        }}
      />

      <PlannedExecutionModal
        open={Boolean(executingTraining)}
        kind="training"
        item={executingTraining}
        onClose={() => setExecutingTraining(null)}
        onSave={(values) => {
          executeTrainingPlan(executingTraining, values);
          setExecutingTraining(null);
        }}
      />

      <SportSupplementPlanModal
        open={Boolean(editingSupplementPlan)}
        selectedDate={selectedDate}
        training={null}
        plan={editingSupplementPlan}
        onClose={() => setEditingSupplementPlan(null)}
        onSave={(updates) => {
          updateSupplementPlanEvent(editingSupplementPlan.id, updates);
          setEditingSupplementPlan(null);
        }}
      />

      <PlannedExecutionModal
        open={Boolean(executingSupplementPlan)}
        kind="supplement"
        item={executingSupplementPlan}
        onClose={() => setExecutingSupplementPlan(null)}
        onSave={(values) => {
          takeSupplementPlan(executingSupplementPlan, values);
          setExecutingSupplementPlan(null);
        }}
      />

      {editingEvent && (
        <DailyEventEditModal
          event={editingEvent}
          eventType={editingType}
          buttonStyle={buttonStyle}
          onClose={() => {
            setEditingEvent(null);
            setEditingType(null);
          }}
          onSave={(id, updates) => {
            if (editingType === "insulin") updateInsulinEvent(id, updates);
            if (editingType === "glucose") updateGlucoseEvent(id, updates);
            if (editingType === "glucoseBoost")
              updateGlucoseBoostEvent(id, updates);
            if (editingType === "movement") updateMovementEvent(id, updates);
            if (editingType === "weight") updateWeightEvent(id, updates);
            if (editingType === "supplement")
              updateSupplementEvent(id, updates);
            if (editingType === "bowel") updateBowelEvent(id, updates);
            if (editingType === "note") updateNoteEvent(id, updates);

            setEditingEvent(null);
            setEditingType(null);
          }}
          onDelete={(id) => {
            if (editingType === "insulin") deleteInsulinEvent(id);
            if (editingType === "glucose") deleteGlucoseEvent(id);
            if (editingType === "glucoseBoost") deleteGlucoseBoostEvent(id);
            if (editingType === "movement") deleteMovementEvent(id);
            if (editingType === "weight") deleteWeightEvent(id);
            if (editingType === "supplement") deleteSupplementEvent(id);
            if (editingType === "bowel") deleteBowelEvent(id);
            if (editingType === "note") deleteNoteEvent(id);

            setEditingEvent(null);
            setEditingType(null);
          }}
        />
      )}

      {showTimerModal && (
        <DailyTimerModal
          event={timerEvent}
          buttonStyle={buttonStyle}
          onClose={() => {
            setShowTimerModal(false);
            setTimerEvent(null);
          }}
          onSave={(timer) => {
            alert(`Timer ingesteld: ${timer.minutes} min · ${timer.label}`);
          }}
        />
      )}
    </>
  );
}
