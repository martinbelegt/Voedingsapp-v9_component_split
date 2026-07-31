import React, { useRef } from "react";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

const RELATIVE_DAY_LABELS = {
  "-2": "Eergisteren",
  "-1": "Gisteren",
  0: "Vandaag",
  1: "Morgen",
  2: "Overmorgen",
};

function pad2(value) {
  return String(value).padStart(2, "0");
}

function parseCalendarDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shiftCalendarDate(value, offsetDays) {
  const date = parseCalendarDate(value);
  date.setDate(date.getDate() + offsetDays);

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function differenceInCalendarDays(value, today) {
  const date = parseCalendarDate(value);
  const currentDate = parseCalendarDate(today);
  const utcDate = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const utcToday = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  return Math.round((utcDate - utcToday) / 86400000);
}

export function formatAdjacentDateLabel(value, today) {
  const relativeDay = differenceInCalendarDays(value, today);

  if (RELATIVE_DAY_LABELS[relativeDay]) {
    return RELATIVE_DAY_LABELS[relativeDay];
  }

  return parseCalendarDate(value).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

function formatNavigationDateLabel(value) {
  return parseCalendarDate(value).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

export function DailyDateNavigation({
  selectedDate,
  setSelectedDate,
  today,
  buttonStyle = {},
}) {
  const navigationRef = useRef(null);
  const previousDate = shiftCalendarDate(selectedDate, -1);
  const nextDate = shiftCalendarDate(selectedDate, 1);
  const sideButtonStyle = {
    ...buttonStyle,
    width: 34,
    minWidth: 34,
    height: 28,
    minHeight: 28,
    border: 0,
    background: "transparent",
    color: "#475569",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1,
    cursor: "pointer",
    borderRadius: 3,
  };

  return (
    <>
      <div
        ref={navigationRef}
        data-testid="daily-date-navigation"
        style={{
          width: 150,
          minWidth: 150,
          height: 28,
          display: "flex",
          alignItems: "stretch",
          border: "1px solid #cbd5e1",
          borderRadius: 3,
          background: "#f8fafc",
          overflow: "hidden",
          boxSizing: "border-box",
          flex: "0 0 150px",
        }}
      >
        <button
          type="button"
          aria-label={`Vorige dag: ${formatNavigationDateLabel(previousDate)}`}
          onClick={() => setSelectedDate(previousDate)}
          style={{
            ...sideButtonStyle,
            borderRight: "1px solid #cbd5e1",
          }}
        >
          <span aria-hidden="true">◀</span>
        </button>

        <div
          style={{
            minWidth: 0,
            flex: "1 1 auto",
            display: "flex",
            alignItems: "stretch",
            background: "#eef8f1",
          }}
        >
          <CompanionDateTimePicker
            value={selectedDate}
            onChange={setSelectedDate}
            mode="date"
            label="Geselecteerde datum"
            compact
            contextItems={[]}
            popoverAnchorRef={navigationRef}
            seamlessCompact
            compactTriggerHeight={26}
            popoverMinWidth={420}
            centerPopover
          />
        </div>

        <button
          type="button"
          aria-label={`Volgende dag: ${formatNavigationDateLabel(nextDate)}`}
          onClick={() => setSelectedDate(nextDate)}
          style={{
            ...sideButtonStyle,
            borderLeft: "1px solid #cbd5e1",
          }}
        >
          <span aria-hidden="true">▶</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setSelectedDate(today)}
        aria-hidden={selectedDate === today}
        tabIndex={selectedDate === today ? -1 : 0}
        style={{
          ...buttonStyle,
          width: 60,
          minWidth: 60,
          height: 28,
          minHeight: 28,
          flex: "0 0 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          visibility: selectedDate === today ? "hidden" : "visible",
          pointerEvents: selectedDate === today ? "none" : "auto",
          border: "1px solid #b7d6bf",
          background: "#eef8f1",
          color: "#355f42",
          padding: "1px 5px",
          borderRadius: 3,
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {selectedDate === today ? "" : "Vandaag"}
      </button>
    </>
  );
}
