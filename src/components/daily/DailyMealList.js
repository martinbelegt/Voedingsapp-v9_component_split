import React, { useState } from "react";
import { DailyMealCard } from "./DailyMealCard";
import { DailyTimelineItem } from "./DailyTimelineItem";
import { DailyEventTimeEditorModal } from "./DailyEventTimeEditorModal";
import { DailyEventEditModal } from "../DailyEventEditModal";
import { DailyTimerModal } from "../DailyTimerModal";

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

  bowelEventsForDay = [],
  updateBowelEvent,
  deleteBowelEvent,

  noteEventsForDay = [],
  updateNoteEvent,
  deleteNoteEvent,
}) {
  const [expandedIds, setExpandedIds] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerEvent, setTimerEvent] = useState(null);
  const [compactTimeline, setCompactTimeline] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState("all");

  const [visibleTypes, setVisibleTypes] = useState({
    meal: true,
    insulinAdvice: true,
    insulin: true,
    glucose: true,
    glucoseBoost: true,
    movement: true,
    bowel: true,
    note: true,
  });

  const [timeEditorEvent, setTimeEditorEvent] = useState(null);

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

  const timelineItems = [
    ...mealsForDay.map((meal) => ({
      id: meal.id,
      itemType: "meal",
      time: meal.eatenAt || "",
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
  ].sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));

  function getFilteredTimelineItems() {
    if (timelineFilter === "all") return timelineItems;

    if (timelineFilter === "movementOnly") {
      return timelineItems.filter((item) => item.itemType === "movement");
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

  const visibleTimelineItems = getFilteredTimelineItems().filter(
    (item) => visibleTypes[item.itemType],
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
        style={buttonStyle}
      >
        Wijzig
      </button>
    );
  }

  if (!selectedDay) {
    return (
      <div style={{ color: "#64748b" }}>
        Geen tijdlijnmomenten opgeslagen voor deze dag.
      </div>
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

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setCompactTimeline((v) => !v)}
          style={toggleButtonStyle(compactTimeline)}
        >
          {compactTimeline ? "Normale tijdlijn" : "Compacte tijdlijn"}
        </button>

        <button
          onClick={() => setTimelineFilter("all")}
          style={{
            ...toggleButtonStyle(timelineFilter === "all"),
            fontSize: window.innerWidth < 900 ? 11 : 12,
            padding: window.innerWidth < 900 ? "2px 7px" : undefined,
          }}
        >
          Alles
        </button>

        <button
          onClick={() => setTimelineFilter("insulin")}
          style={toggleButtonStyle(timelineFilter === "insulin")}
        >
          Alleen insuline
        </button>

        <button
          onClick={() => setTimelineFilter("glucose")}
          style={toggleButtonStyle(timelineFilter === "glucose")}
        >
          Alleen glucose
        </button>

        <button
          onClick={() => setTimelineFilter("metabolic")}
          style={{
            ...toggleButtonStyle(timelineFilter === "metabolic"),

            fontSize: window.innerWidth < 900 ? 11 : 12,

            padding: window.innerWidth < 900 ? "2px 7px" : undefined,
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
          style={toggleButtonStyle(timelineFilter === "sportFocus")}
        >
          {timelineFilter === "sportFocus"
            ? "Sport focus uit"
            : "Sport focus aan"}
        </button>
      </div>

      <button
        onClick={() => {
          const allExpanded =
            visibleTimelineItems.length > 0 &&
            visibleTimelineItems.every((item) => expandedIds.includes(item.id));

          if (allExpanded) {
            collapseAll();
          } else {
            expandAll();
          }
        }}
        style={toggleButtonStyle(
          visibleTimelineItems.length > 0 &&
            visibleTimelineItems.every((item) => expandedIds.includes(item.id)),
        )}
      >
        {visibleTimelineItems.length > 0 &&
        visibleTimelineItems.every((item) => expandedIds.includes(item.id))
          ? "Alles inklappen"
          : "Alles uitklappen"}
      </button>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        {[
          ["meal", "Maaltijden"],
          ["insulinAdvice", "Advies"],
          ["insulin", "Insuline"],
          ["glucose", "Glucose"],
          ["glucoseBoost", "Boosts"],
          ["movement", "Sport"],
          ["bowel", "Stoelgang"],
        ].map(([type, label]) => (
          <button
            key={type}
            onClick={() => toggleVisibleType(type)}
            style={{
              ...buttonStyle,
              fontSize: window.innerWidth < 900 ? 11 : 12,
              padding: window.innerWidth < 900 ? "2px 7px" : undefined,
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

      {visibleTimelineItems.map((item, index) => {
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
              compact={compactTimeline}
            />
          );
        }

        if (item.itemType === "insulinAdvice") {
          const meal = item.meal;

          return (
            <DailyTimelineItem
              key={item.id}
              indentLevel={1}
              compact={compactTimeline}
              icon="💡"
              title={`Insuline advies · ${meal.totals?.insulin || "?"} E`}
              timeLabel={formatTime(meal.eatenAt)}
              subtitle={meal.name || meal.mealMoment || ""}
              accentColor="#ca8a04"
              backgroundColor="#fefce8"
              borderColor="#fde047"
              expanded={false}
              detailContent={
                <div style={{ fontSize: 13 }}>
                  Berekend advies gebaseerd op maaltijd.
                </div>
              }
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
              onToggle={() => toggleExpanded(event.id)}
              icon="🟣💉"
              title={`Toegediende insuline · ${event.units}E`}
              timeLabel={formatTime(event.eventTime)}
              subtitle={`${phasePrefix(item)}${event.note || ""}`}
              compact={compactTimeline}
              accentColor="#312e81"
              backgroundColor="#eef2ff"
              borderColor="#c7d2fe"
              actions={
                <>
                  {timerButton(event)}
                  {editButton(event, "insulin")}
                </>
              }
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

          return (
            <DailyTimelineItem
              key={event.id}
              indentLevel={2}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              icon="🟣📈"
              title={`Glucosewaarde · ${event.glucoseValue} mmol/L`}
              timeLabel={formatTime(event.eventTime)}
              subtitle={`${phasePrefix(item)}${event.note || ""}`}
              compact={compactTimeline}
              accentColor="#075985"
              backgroundColor="#f0f9ff"
              borderColor="#7dd3fc"
              actions={
                <>
                  {timerButton(event)}
                  {editButton(event, "glucose")}
                </>
              }
              detailContent={
                <div style={{ fontSize: 13, color: "#334155" }}>
                  Glucosemeting opgeslagen in metabole tijdlijn.
                </div>
              }
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
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
              icon="⚡"
              title={`${event.kh}g snelle KH`}
              timeLabel={formatTime(event.eventTime)}
              subtitle={`${phasePrefix(item)}${event.source || "Glucoseboost"}${
                event.note ? ` · ${event.note}` : ""
              }`}
              accentColor="#c2410c"
              backgroundColor="#fff7ed"
              borderColor="#fdba74"
              actions={
                <>
                  {timerButton(event)}
                  {editButton(event, "glucoseBoost")}
                </>
              }
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
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
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
              actions={
                <>
                  {timerButton(event)}
                  {editButton(event, "movement")}
                </>
              }
              detailContent={
                <div style={{ fontSize: 13, color: "#334155" }}>
                  Beweging/sportmoment in metabole tijdlijn.
                </div>
              }
            />
          );
        }

        if (item.itemType === "bowel") {
          const event = item.event;

          return (
            <DailyTimelineItem
              key={event.id}
              indentLevel={1}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
              icon="🚽"
              title={`Bristol ${event.bristolScore}`}
              timeLabel={formatTime(event.eventTime)}
              subtitle={`${phasePrefix(item)}${event.urgency || ""}${
                event.note ? ` · ${event.note}` : ""
              }`}
              accentColor="#92400e"
              backgroundColor="#fffbeb"
              borderColor="#fcd34d"
              actions={
                <>
                  {timerButton(event)}
                  {editButton(event, "bowel")}
                </>
              }
              detailContent={
                <div style={{ fontSize: 13, color: "#334155" }}>
                  Stoelgangmoment in metabole tijdlijn.
                </div>
              }
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
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
              icon="⚫📝"
              title={event.note || "Notitie"}
              timeLabel={formatTime(event.eventTime)}
              subtitle={`${phasePrefix(item)}${event.context || ""}`}
              accentColor="#475569"
              backgroundColor="#f8fafc"
              borderColor="#cbd5e1"
              actions={
                <>
                  {timerButton(event)}
                  {editButton(event, "note")}
                </>
              }
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
      })}

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
