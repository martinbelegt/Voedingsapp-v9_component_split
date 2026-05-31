import React, { useState } from "react";
import { DailyMealCard } from "./DailyMealCard";
import { DailyTimelineItem } from "./DailyTimelineItem";
import { DailyEventTimeEditorModal } from "./DailyEventTimeEditorModal";

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
}) {
  const EVENT_COLORS = {
    meal: {
      bg: "#ecfdf5",
      border: "#22c55e",
      text: "#14532d",
    },

    insulin: {
      bg: "#eef2ff",
      border: "#6366f1",
      text: "#312e81",
    },

    glucose: {
      bg: "#eff6ff",
      border: "#3b82f6",
      text: "#1e3a8a",
    },

    glucoseBoost: {
      bg: "#fff7ed",
      border: "#f97316",
      text: "#9a3412",
    },

    movement: {
      bg: "#f5f3ff",
      border: "#8b5cf6",
      text: "#4c1d95",
    },

    bowel: {
      bg: "#fef3c7",
      border: "#d97706",
      text: "#78350f",
    },
  };

  const [expandedIds, setExpandedIds] = useState([]);
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
  });

  function toggleVisibleType(type) {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  const [timeEditorEvent, setTimeEditorEvent] = useState(null);

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
  ].sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));

  function getFilteredTimelineItems() {
    if (timelineFilter === "all") {
      return timelineItems;
    }

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

  function getEventStyle(type) {
    const c = EVENT_COLORS[type] || {
      bg: "#ffffff",
      border: "#cbd5e1",
      text: "#334155",
    };

    return {
      background: c.bg,
      color: c.text,

      borderLeft: `6px solid ${c.border}`,

      borderRadius: 8,

      padding: "8px 10px",

      boxShadow: "none",

      marginBottom: 6,
    };
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

  function openTimeEditor(type, event) {
    setTimeEditorEvent({
      type,
      id: event.id,
      eventTime: event.eventTime,
    });
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

  function timeButton(type, event) {
    return (
      <button
        onClick={() => openTimeEditor(type, event)}
        style={{
          ...buttonStyle,
          fontSize: 12,
          padding: "4px 7px",
          borderRadius: 999,
          background: "white",
        }}
      >
        Tijd
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

  return (
    <>
      {/* Tijdlijnbediening */}
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
          style={{
            ...buttonStyle,
            background: compactTimeline ? "#3730a3" : "#eef2ff",
            color: compactTimeline ? "white" : "#3730a3",
            border: "1px solid #c7d2fe",
          }}
        >
          {compactTimeline ? "Normale tijdlijn" : "Compacte tijdlijn"}
        </button>

        <button
          onClick={() => setTimelineFilter("all")}
          style={{
            ...buttonStyle,
            background: timelineFilter === "all" ? "#0f172a" : "#f8fafc",
            color: timelineFilter === "all" ? "white" : "#0f172a",
            border: "1px solid #cbd5e1",
          }}
        >
          Alles
        </button>

        <button
          onClick={() => setTimelineFilter("insulin")}
          style={{
            ...buttonStyle,
            background: timelineFilter === "insulin" ? "#312e81" : "#eef2ff",
            color: timelineFilter === "insulin" ? "white" : "#312e81",
            border: "1px solid #c7d2fe",
          }}
        >
          Alleen insuline
        </button>

        <button
          onClick={() => setTimelineFilter("glucose")}
          style={{
            ...buttonStyle,
            background: timelineFilter === "glucose" ? "#0369a1" : "#f0f9ff",
            color: timelineFilter === "glucose" ? "white" : "#0369a1",
            border: "1px solid #7dd3fc",
          }}
        >
          Alleen glucose
        </button>

        <button
          onClick={() => setTimelineFilter("metabolic")}
          style={{
            ...buttonStyle,
            background: timelineFilter === "metabolic" ? "#0f172a" : "#ecfeff",
            color: timelineFilter === "metabolic" ? "white" : "#0f172a",
            border: "1px solid #7dd3fc",
          }}
        >
          Insuline + glucose
        </button>

        <button
          onClick={() => setTimelineFilter("movementOnly")}
          style={{
            ...buttonStyle,
            background:
              timelineFilter === "movementOnly" ? "#4c1d95" : "#f5f3ff",
            color: timelineFilter === "movementOnly" ? "white" : "#4c1d95",
            border: "1px solid #c4b5fd",
          }}
        >
          Alleen sport
        </button>

        <button
          onClick={() => setTimelineFilter("sportFocus")}
          style={{
            ...buttonStyle,
            background: timelineFilter === "sportFocus" ? "#4c1d95" : "#f5f3ff",
            color: timelineFilter === "sportFocus" ? "white" : "#4c1d95",
            border: "1px solid #c4b5fd",
          }}
        >
          Sport focus
        </button>
      </div>

      <button
        onClick={() => {
          const allExpanded =
            expandedIds.length >= visibleTimelineItems.length &&
            visibleTimelineItems.length > 0;

          if (allExpanded) {
            collapseAll();
          } else {
            expandAll();
          }
        }}
        style={{
          ...buttonStyle,
          background:
            expandedIds.length >= visibleTimelineItems.length
              ? "#eef2ff"
              : "#f8fafc",
        }}
      >
        {expandedIds.length >= visibleTimelineItems.length
          ? "Alles inklappen"
          : "Alles uitklappen"}
      </button>

      {timelineFilter === "sportFocus" && (
        <div
          style={{
            marginBottom: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#f5f3ff",
            border: "1px solid #c4b5fd",
            color: "#4c1d95",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          🏋️ Sport focus actief · toont alles van 2 uur vóór tot 3 uur ná sport.
        </div>
      )}

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
              fontSize: 12,
              background: visibleTypes[type] ? "#0f172a" : "#f8fafc",
              color: visibleTypes[type] ? "white" : "#64748b",
              border: "1px solid #cbd5e1",
            }}
          >
            {visibleTypes[type] ? "☑" : "☐"} {label}
          </button>
        ))}
      </div>

      {/* Chronologische metabole tijdlijn */}
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
              compact={compactTimeline}
              icon="💡"
              title={`Insuline advies · ${meal.totals?.insulin || "?"} E`}
              timeLabel={new Date(meal.eatenAt).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              icon="💉"
              title={`Toegediende insuline · ${event.units}E`}
              timeLabel={new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              subtitle={`${getSportPhaseLabel(item) ? `[${getSportPhaseLabel(item)}] ` : ""}${event.note || ""}`}
              compact={compactTimeline}
              accentColor="#312e81"
              backgroundColor="#eef2ff"
              borderColor="#c7d2fe"
              actions={
                <>
                  {timeButton("insulin", event)}

                  <button
                    onClick={() => {
                      const units = window.prompt(
                        "Aantal eenheden:",
                        event.units || "",
                      );
                      if (units === null) return;

                      const note = window.prompt("Notitie:", event.note || "");
                      if (note === null) return;

                      updateInsulinEvent(event.id, { units, note });
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
              title={`Glucosewaarde · ${event.glucoseValue} mmol/L`}
              timeLabel={new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              subtitsubtitle={`${getSportPhaseLabel(item) ? `[${getSportPhaseLabel(item)}] ` : ""}${event.note || ""}`}
              le={event.note || ""}
              compact={compactTimeline}
              accentColor="#075985"
              backgroundColor="#f0f9ff"
              borderColor="#7dd3fc"
              actions={
                <>
                  {timeButton("glucose", event)}

                  <button
                    onClick={() => {
                      const glucoseValue = window.prompt(
                        "Glucosewaarde (mmol/L):",
                        event.glucoseValue || "",
                      );
                      if (glucoseValue === null) return;

                      const note = window.prompt("Notitie:", event.note || "");
                      if (note === null) return;

                      updateGlucoseEvent(event.id, { glucoseValue, note });
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

        if (item.itemType === "glucoseBoost") {
          const event = item.event;

          return (
            <DailyTimelineItem
              key={event.id}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
              icon="⚡"
              title={`${event.kh}g snelle KH`}
              timeLabel={new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              subtitle={`${
                getSportPhaseLabel(item) ? `[${getSportPhaseLabel(item)}] ` : ""
              }${event.source || "Glucoseboost"}${
                event.note ? ` · ${event.note}` : ""
              }`}
              accentColor="#c2410c"
              backgroundColor="#fff7ed"
              borderColor="#fdba74"
              actions={
                <>
                  {timeButton("glucoseBoost", event)}

                  <button
                    onClick={() => {
                      const kh = window.prompt(
                        "Snelle KH (gram):",
                        event.kh || "",
                      );
                      if (kh === null) return;

                      const source = window.prompt("Bron:", event.source || "");
                      if (source === null) return;

                      const note = window.prompt("Notitie:", event.note || "");
                      if (note === null) return;

                      updateGlucoseBoostEvent(event.id, { kh, source, note });
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "white",
                      border: "1px solid #fdba74",
                      color: "#c2410c",
                    }}
                  >
                    Wijzig
                  </button>

                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        "Deze glucoseboost verwijderen?",
                      );
                      if (!ok) return;

                      deleteGlucoseBoostEvent(event.id);
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
                  Hypo-correctie / snelle glucoseboost.
                  <div style={{ marginTop: 6 }}>
                    <strong>Bron:</strong> {event.source || "Onbekend"}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <strong>Snelle KH:</strong> {event.kh || 0} g
                  </div>
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

        if (item.itemType === "movement") {
          const event = item.event;

          return (
            <DailyTimelineItem
              key={event.id}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
              icon="🏋️"
              title={`TRAINING ANKER · ${event.activityType || "Beweging"}${
                event.durationMinutes ? ` · ${event.durationMinutes} min` : ""
              }`}
              timeLabel={new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              subtitle={`${
                getSportPhaseLabel(item) ? `[${getSportPhaseLabel(item)}] ` : ""
              }${event.intensityType || "Belasting onbekend"}${
                event.note ? ` · ${event.note}` : ""
              }`}
              accentColor="#4c1d95"
              backgroundColor="#f5f3ff"
              borderColor="#c4b5fd"
              actions={
                <>
                  {timeButton("movement", event)}

                  <button
                    onClick={() => {
                      const activityType = window.prompt(
                        "Type beweging/sport:",
                        event.activityType || "",
                      );
                      if (activityType === null) return;

                      const intensityType = window.prompt(
                        "Belasting:",
                        event.intensityType || "",
                      );
                      if (intensityType === null) return;

                      const durationMinutes = window.prompt(
                        "Duur in minuten:",
                        event.durationMinutes || "",
                      );
                      if (durationMinutes === null) return;

                      const note = window.prompt("Notitie:", event.note || "");
                      if (note === null) return;

                      updateMovementEvent(event.id, {
                        activityType,
                        intensityType,
                        durationMinutes,
                        note,
                      });
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "white",
                      border: "1px solid #67e8f9",
                      color: "#0e7490",
                    }}
                  >
                    Wijzig
                  </button>

                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        "Dit bewegingsmoment verwijderen?",
                      );
                      if (!ok) return;

                      deleteMovementEvent(event.id);
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
                  Beweging/sportmoment in metabole tijdlijn.
                  <div style={{ marginTop: 6 }}>
                    <strong>Type:</strong> {event.activityType || "Onbekend"}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <strong>Belasting:</strong>{" "}
                    {event.intensityType || "Onbekend"}
                  </div>
                  {event.durationMinutes ? (
                    <div style={{ marginTop: 6 }}>
                      <strong>Duur:</strong> {event.durationMinutes} minuten
                    </div>
                  ) : null}
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

        if (item.itemType === "bowel") {
          const event = item.event;

          return (
            <DailyTimelineItem
              key={event.id}
              expanded={expandedIds.includes(event.id)}
              onToggle={() => toggleExpanded(event.id)}
              compact={compactTimeline}
              icon="🚽"
              title={`Bristol ${event.bristolScore}`}
              timeLabel={new Date(event.eventTime).toLocaleString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              subtitle={`${
                getSportPhaseLabel(item) ? `[${getSportPhaseLabel(item)}] ` : ""
              }${event.source || "Glucoseboost"}${
                event.note ? ` · ${event.note}` : ""
              }`}
              accentColor="#92400e"
              backgroundColor="#fffbeb"
              borderColor="#fcd34d"
              actions={
                <>
                  {timeButton("bowel", event)}

                  <button
                    onClick={() => {
                      const bristolScore = window.prompt(
                        "Bristol score:",
                        event.bristolScore || "4",
                      );
                      if (bristolScore === null) return;

                      const urgency = window.prompt(
                        "Urgentie:",
                        event.urgency || "",
                      );
                      if (urgency === null) return;

                      const note = window.prompt("Notitie:", event.note || "");
                      if (note === null) return;

                      updateBowelEvent(event.id, {
                        bristolScore,
                        urgency,
                        note,
                      });
                    }}
                    style={{
                      ...buttonStyle,
                      fontSize: 12,
                      padding: "4px 7px",
                      borderRadius: 999,
                      background: "white",
                      border: "1px solid #fcd34d",
                      color: "#92400e",
                    }}
                  >
                    Wijzig
                  </button>

                  <button
                    onClick={() => {
                      const ok = window.confirm("Stoelgangmoment verwijderen?");
                      if (!ok) return;

                      deleteBowelEvent(event.id);
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
                  Stoelgangmoment in metabole tijdlijn.
                  <div style={{ marginTop: 6 }}>
                    <strong>Bristol:</strong> {event.bristolScore}
                  </div>
                  {event.urgency ? (
                    <div style={{ marginTop: 6 }}>
                      <strong>Urgentie:</strong> {event.urgency}
                    </div>
                  ) : null}
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

      {/* Uniforme datum/tijd editor voor tijdlijn-events */}
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
    </>
  );
}
