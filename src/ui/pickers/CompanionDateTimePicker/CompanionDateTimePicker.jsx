import React, { useEffect, useMemo, useState } from "react";
import {
  combineDateAndTime,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatTimeForDisplay,
  normalizeDateTimeValue,
  splitDateTime,
} from "./dateTimeHelpers";

const VALID_MODES = new Set(["date", "time", "datetime"]);
const COLORS = {
  primary: "#6D9F71",
  primaryDark: "#4F7D55",
  soft: "#A7CFAF",
  veryLight: "#EAF3EC",
  value: "#EEF7F0",
  border: "#C9DDCE",
  borderStrong: "#8DBB95",
  text: "#0F172A",
  muted: "#6B7280",
  card: "#FFFFFF",
  app: "#FAFBFA",
};

const FONT_STACK =
  '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const DEMO_CONTEXT_ITEMS = [
  {
    id: "meal",
    icon: "M",
    title: "Geplande maaltijd",
    meta: "Lunch met Emma · 12:00-13:00",
  },
  {
    id: "medication",
    icon: "Rx",
    title: "Medicatie",
    meta: "Herinnering om 15:00",
  },
  {
    id: "movement",
    icon: "S",
    title: "Sportmoment",
    meta: "Hardlopen · 18:30-19:15",
  },
];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function todayDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function currentTime(offsetMinutes = 0) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + offsetMinutes);

  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function createDateParts(value) {
  const fallback = todayDate();
  const normalized = normalizeDateTimeValue(value, "date") || fallback;
  const [year, month, day] = normalized.split("-");

  return { day, month, year };
}

function createTimeParts(value) {
  const normalized = normalizeDateTimeValue(value, "time") || currentTime();
  const [hour, minute] = normalized.split(":");

  return { hour, minute };
}

function isValidDateParts(parts) {
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const date = new Date(year, month - 1, day);

  return (
    year >= 1900 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isValidTimeParts(parts) {
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function buildDateValue(parts) {
  if (!isValidDateParts(parts)) return "";

  return `${pad2(parts.year)}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

function buildTimeValue(parts) {
  if (!isValidTimeParts(parts)) return "";

  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

function getDisplayValue(mode, value) {
  if (mode === "date") return formatDateForDisplay(value);
  if (mode === "time") return formatTimeForDisplay(value);
  return formatDateTimeForDisplay(value);
}

function fieldLabel(mode) {
  if (mode === "date") return "Kies datum";
  if (mode === "time") return "Kies tijd";
  return "Kies datum en tijd";
}

function quickChoices(mode) {
  const choices = [];

  if (mode === "date" || mode === "datetime") {
    choices.push(
      { key: "today", label: "Vandaag", date: todayDate() },
      { key: "yesterday", label: "Gisteren", date: todayDate(-1) },
      { key: "tomorrow", label: "Morgen", date: todayDate(1) },
    );
  }

  choices.push({
    key: "now",
    label: "Nu",
    date: todayDate(),
    time: currentTime(),
  });

  return choices;
}

function buildValueBlocks(mode, dateParts, timeParts) {
  const dateValue = buildDateValue(dateParts);
  const timeValue = buildTimeValue(timeParts);
  const blocks = [];

  if (mode === "date" || mode === "datetime") {
    blocks.push({
      key: "date",
      label: "Datum",
      value: formatDateForDisplay(dateValue) || "Kies datum",
    });
  }

  if (mode === "time" || mode === "datetime") {
    blocks.push({
      key: "time",
      label: "Tijd",
      value: formatTimeForDisplay(timeValue) || "Kies tijd",
    });
  }

  return blocks;
}

function adjustDatePart(parts, key, direction) {
  const currentDate = buildDateValue(parts) || todayDate();
  const [year, month, day] = currentDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (key === "day") date.setDate(date.getDate() + direction);
  if (key === "month") date.setMonth(date.getMonth() + direction);
  if (key === "year") date.setFullYear(date.getFullYear() + direction);

  return createDateParts(
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
      date.getDate(),
    )}`,
  );
}

function adjustTimePart(parts, key, direction) {
  const currentTimeValue = buildTimeValue(parts) || currentTime();
  const [hour, minute] = currentTimeValue.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  if (key === "hour") date.setHours(date.getHours() + direction);
  if (key === "minute") date.setMinutes(date.getMinutes() + direction * 5);

  return createTimeParts(`${pad2(date.getHours())}:${pad2(date.getMinutes())}`);
}

function StepperField({ label, value, onAdjust, disabled, compact = false }) {
  return (
    <div
      style={{
        minWidth: 0,
        border: `1px solid ${COLORS.border}`,
        borderRadius: compact ? 9 : 16,
        background: COLORS.value,
        padding: compact ? 4 : 8,
        display: "grid",
        gap: compact ? 2 : 6,
      }}
    >
      <div
        style={{
          color: COLORS.muted,
          fontSize: compact ? 9 : 11,
          fontWeight: 700,
          letterSpacing: 0.2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "22px minmax(22px, 1fr) 22px"
            : "38px 1fr 38px",
          gap: compact ? 2 : 6,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdjust(-1)}
          aria-label={`${label} verlagen`}
          style={{
            minHeight: compact ? 24 : 38,
            minWidth: 0,
            padding: 0,
            borderRadius: compact ? 7 : 12,
            border: `1px solid ${COLORS.border}`,
            background: disabled ? "#F3F4F6" : COLORS.card,
            color: disabled ? "#9CA3AF" : COLORS.primaryDark,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: compact ? 13 : 18,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          -
        </button>
        <div
          style={{
            minHeight: compact ? 24 : 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.text,
            fontSize: compact ? 13 : 18,
            fontWeight: 750,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdjust(1)}
          aria-label={`${label} verhogen`}
          style={{
            minHeight: compact ? 24 : 38,
            minWidth: 0,
            padding: 0,
            borderRadius: compact ? 7 : 12,
            border: `1px solid ${COLORS.border}`,
            background: disabled ? "#F3F4F6" : COLORS.card,
            color: disabled ? "#9CA3AF" : COLORS.primaryDark,
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: compact ? 13 : 18,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function ContextPanel({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        borderTop: "1px solid #E5EEE7",
        paddingTop: 14,
      }}
    >
      <div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 14,
            fontWeight: 750,
            lineHeight: 1.25,
          }}
        >
          Context rond dit moment
        </div>
        <div
          style={{
            color: COLORS.muted,
            fontSize: 13,
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          Ruimte voor maaltijden, medicatie, sport, glucose en herinneringen.
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "34px 1fr auto",
              gap: 10,
              alignItems: "center",
              padding: "10px 11px",
              borderRadius: 16,
              border: "1px solid #E4ECE6",
              background: "#FCFDFC",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: COLORS.veryLight,
                color: COLORS.primaryDark,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 850,
              }}
            >
              {item.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: COLORS.text,
                  fontSize: 14,
                  fontWeight: 750,
                  lineHeight: 1.25,
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  color: COLORS.muted,
                  fontSize: 13,
                  marginTop: 2,
                  lineHeight: 1.3,
                }}
              >
                {item.meta}
              </div>
            </div>
            <span
              style={{
                color: COLORS.primaryDark,
                background: COLORS.veryLight,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                fontWeight: 750,
                whiteSpace: "nowrap",
              }}
            >
              Demo
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompanionDateTimePicker({
  mode = "datetime",
  value = "",
  onChange,
  label,
  disabled = false,
  compact = false,
  presentation,
  defaultOpen,
  contextItems = DEMO_CONTEXT_ITEMS,
}) {
  const safeMode = VALID_MODES.has(mode) ? mode : "datetime";
  const resolvedPresentation =
    presentation || (compact ? "compact" : "expanded");
  const isCompactPresentation = resolvedPresentation === "compact";
  const [isOpen, setIsOpen] = useState(
    defaultOpen ?? resolvedPresentation === "expanded",
  );
  const normalizedValue = normalizeDateTimeValue(value, safeMode);
  const splitValue = splitDateTime(normalizedValue);
  const [dateParts, setDateParts] = useState(() =>
    createDateParts(splitValue.date),
  );
  const [timeParts, setTimeParts] = useState(() =>
    createTimeParts(splitValue.time),
  );
  const [hoveredChoice, setHoveredChoice] = useState(null);

  useEffect(() => {
    const nextValue = normalizeDateTimeValue(value, safeMode);
    const nextSplitValue = splitDateTime(nextValue);

    if (safeMode !== "time") {
      setDateParts(createDateParts(nextSplitValue.date));
    }

    if (safeMode !== "date") {
      setTimeParts(createTimeParts(nextSplitValue.time));
    }
  }, [safeMode, value]);

  const displayValue = useMemo(
    () => getDisplayValue(safeMode, normalizedValue),
    [safeMode, normalizedValue],
  );

  const valueBlocks = useMemo(
    () => buildValueBlocks(safeMode, dateParts, timeParts),
    [dateParts, safeMode, timeParts],
  );

  function emitDateTime(nextDateParts, nextTimeParts) {
    const nextDate = buildDateValue(nextDateParts);
    const nextTime = buildTimeValue(nextTimeParts);

    if (safeMode === "date") {
      if (nextDate) onChange?.(nextDate);
      return;
    }

    if (safeMode === "time") {
      if (nextTime) onChange?.(nextTime);
      return;
    }

    if (nextDate && nextTime) {
      onChange?.(combineDateAndTime(nextDate, nextTime));
    }
  }

  function updateDateParts(nextParts) {
    setDateParts(nextParts);
    emitDateTime(nextParts, timeParts);
  }

  function updateTimeParts(nextParts) {
    setTimeParts(nextParts);
    emitDateTime(dateParts, nextParts);
  }

  function applyQuickChoice(choice) {
    if (disabled) return;

    const nextDateParts = choice.date ? createDateParts(choice.date) : dateParts;
    const nextTimeParts = choice.time ? createTimeParts(choice.time) : timeParts;

    setDateParts(nextDateParts);
    setTimeParts(nextTimeParts);
    emitDateTime(nextDateParts, nextTimeParts);
  }

  const title = label || fieldLabel(safeMode);
  const showDate = safeMode === "date" || safeMode === "datetime";
  const showTime = safeMode === "time" || safeMode === "datetime";
  const visibleContextItems = compact ? [] : contextItems;

  useEffect(() => {
    setIsOpen(defaultOpen ?? resolvedPresentation === "expanded");
  }, [defaultOpen, resolvedPresentation]);

  function collapseAfterSelection() {
    if (isCompactPresentation) {
      setIsOpen(false);
    }
  }

  function handleQuickChoice(choice) {
    applyQuickChoice(choice);
    collapseAfterSelection();
  }

  const modalTopOffset = "max(150px, calc(env(safe-area-inset-top) + 120px))";
  const modalMaxHeight = `min(85vh, calc(100vh - ${modalTopOffset} - 12px))`;

  const compactSummary = (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsOpen((open) => !open)}
      style={{
        width: "100%",
        minHeight: compact ? 44 : 56,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: compact
          ? "minmax(0, 1fr) 16px"
          : "34px minmax(0, 1fr) auto",
        gap: compact ? 8 : 12,
        alignItems: "center",
        padding: compact ? "7px 10px 7px 12px" : "11px 14px",
        borderRadius: compact ? 10 : 18,
        border: `1px solid ${COLORS.borderStrong}`,
        background: COLORS.value,
        color: COLORS.text,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: FONT_STACK,
        textAlign: "left",
        boxShadow: compact
          ? "0 1px 3px rgba(15, 23, 42, 0.05)"
          : "0 6px 18px rgba(15, 23, 42, 0.05)",
      }}
    >
      {!compact ? (
        <span
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            borderRadius: 12,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.primaryDark,
            fontWeight: 850,
            fontSize: 15,
          }}
        >
          {safeMode === "time" ? "T" : "D"}
        </span>
      ) : null}
      <span style={{ minWidth: 0, display: "grid", gap: compact ? 0 : 2 }}>
        {!compact ? (
          <span
            style={{
              color: COLORS.muted,
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: 0.2,
              textTransform: "uppercase",
            }}
          >
            {label || fieldLabel(safeMode)}
          </span>
        ) : null}
        <span
          style={{
            color: COLORS.text,
            fontSize: compact ? 15 : 18,
            fontWeight: 800,
            lineHeight: compact ? 1.15 : 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayValue || "Kies moment"}
        </span>
      </span>
      <span
        style={{
          color: COLORS.primaryDark,
          fontSize: compact ? 14 : 18,
          fontWeight: 800,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {isOpen ? "⌃" : "⌄"}
      </span>
    </button>
  );

  if (isCompactPresentation && !isOpen) {
    return compactSummary;
  }

  const pickerPanel = (
    <section
      aria-label={title}
      style={{
        width: "100%",
        maxWidth: compact ? 420 : "none",
        maxHeight: compact ? modalMaxHeight : "none",
        overflowY: compact ? "auto" : "visible",
        boxSizing: "border-box",
        border: `1px solid ${COLORS.border}`,
        borderRadius: compact ? 12 : 28,
        background: COLORS.card,
        boxShadow: compact
          ? "0 8px 20px rgba(15, 23, 42, 0.07)"
          : "0 18px 44px rgba(15, 23, 42, 0.08)",
        padding: compact ? 8 : 22,
        display: "grid",
        gap: compact ? 5 : 18,
        color: COLORS.text,
        fontFamily: FONT_STACK,
      }}
    >
      {!compact ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: COLORS.primaryDark,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.2,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Companion moment
            </div>
            <div
              style={{
                color: COLORS.text,
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1.14,
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              minHeight: 36,
              display: "flex",
              alignItems: "center",
              padding: "7px 11px",
              borderRadius: 999,
              background: COLORS.veryLight,
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
              fontSize: 12,
              fontWeight: 750,
              whiteSpace: "nowrap",
            }}
          >
            {safeMode}
          </div>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: compact ? 4 : 10,
          gridTemplateColumns:
            valueBlocks.length > 1
              ? compact
                ? "1fr 1fr"
                : "repeat(auto-fit, minmax(180px, 1fr))"
              : "1fr",
        }}
      >
        {valueBlocks.map((block) => (
          <div
            key={block.key}
            style={{
              minHeight: compact ? 32 : 72,
              display: "grid",
              alignContent: "center",
              gap: compact ? 1 : 4,
              padding: compact ? "4px 7px" : "14px 16px",
              borderRadius: compact ? 9 : 18,
              background: COLORS.value,
              border: `1px solid ${COLORS.borderStrong}`,
            }}
          >
            <div
              style={{
                color: COLORS.primaryDark,
                fontSize: compact ? 8 : 12,
                fontWeight: 750,
                textTransform: "uppercase",
                letterSpacing: 0.2,
              }}
            >
              {block.label}
            </div>
            <div
              style={{
                color: COLORS.text,
                fontSize: compact ? 13 : 20,
                fontWeight: 800,
                lineHeight: compact ? 1.15 : 1.2,
              }}
            >
              {block.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: compact ? "grid" : "flex",
          gap: compact ? 4 : 8,
          gridTemplateColumns: compact
            ? `repeat(${quickChoices(safeMode).length}, minmax(0, 1fr))`
            : undefined,
          flexWrap: "wrap",
        }}
      >
        {quickChoices(safeMode).map((choice) => (
          <button
            key={choice.key}
            type="button"
            disabled={disabled}
            onClick={() => handleQuickChoice(choice)}
            onMouseEnter={() => setHoveredChoice(choice.key)}
            onMouseLeave={() => setHoveredChoice(null)}
            style={{
              minHeight: compact ? 28 : 44,
              minWidth: 0,
              padding: compact ? "4px 4px" : "10px 14px",
              borderRadius: compact ? 8 : 14,
              border: `1px solid ${COLORS.border}`,
              background:
                !disabled && hoveredChoice === choice.key
                  ? COLORS.veryLight
                  : disabled
                    ? "#F8FAFC"
                    : COLORS.card,
              color: disabled ? "#9CA3AF" : COLORS.text,
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: compact ? 11 : 14,
              fontWeight: 750,
              whiteSpace: "nowrap",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
              transition: "background 140ms ease, border-color 140ms ease",
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gap: compact ? 5 : 12,
          gridTemplateColumns:
            showDate && showTime && !compact
              ? "repeat(auto-fit, minmax(220px, 1fr))"
              : "1fr",
        }}
      >
        {showDate ? (
          <div
            style={{
              display: "grid",
              gap: compact ? 4 : 10,
              padding: compact ? 0 : 12,
              borderRadius: compact ? 0 : 20,
              background: compact ? "transparent" : COLORS.app,
              border: compact ? "none" : "1px solid #E5EEE7",
            }}
          >
            <div
              style={{
                color: COLORS.text,
                fontSize: compact ? 11 : 14,
                fontWeight: 750,
              }}
            >
              Datum verfijnen
            </div>
            <div
              style={{
                display: "grid",
                gap: compact ? 4 : 8,
                gridTemplateColumns: compact
                  ? "repeat(3, minmax(0, 1fr))"
                  : "repeat(auto-fit, minmax(112px, 1fr))",
              }}
            >
              <StepperField
                label="Dag"
                value={dateParts.day}
                disabled={disabled}
                compact={compact}
                onAdjust={(direction) =>
                  updateDateParts(adjustDatePart(dateParts, "day", direction))
                }
              />
              <StepperField
                label="Maand"
                value={dateParts.month}
                disabled={disabled}
                compact={compact}
                onAdjust={(direction) =>
                  updateDateParts(adjustDatePart(dateParts, "month", direction))
                }
              />
              <StepperField
                label="Jaar"
                value={dateParts.year}
                disabled={disabled}
                compact={compact}
                onAdjust={(direction) =>
                  updateDateParts(adjustDatePart(dateParts, "year", direction))
                }
              />
            </div>
          </div>
        ) : null}

        {showTime ? (
          <div
            style={{
              display: "grid",
              gap: compact ? 4 : 10,
              padding: compact ? 0 : 12,
              borderRadius: compact ? 0 : 20,
              background: compact ? "transparent" : COLORS.app,
              border: compact ? "none" : "1px solid #E5EEE7",
            }}
          >
            <div
              style={{
                color: COLORS.text,
                fontSize: compact ? 11 : 14,
                fontWeight: 750,
              }}
            >
              Tijd verfijnen
            </div>
            <div
              style={{
                display: "grid",
                gap: compact ? 4 : 8,
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <StepperField
                label="Uur"
                value={timeParts.hour}
                disabled={disabled}
                compact={compact}
                onAdjust={(direction) =>
                  updateTimeParts(adjustTimePart(timeParts, "hour", direction))
                }
              />
              <StepperField
                label="Min"
                value={timeParts.minute}
                disabled={disabled}
                compact={compact}
                onAdjust={(direction) =>
                  updateTimeParts(adjustTimePart(timeParts, "minute", direction))
                }
              />
            </div>
          </div>
        ) : null}
      </div>

      {!compact ? (
        <div
          style={{
            display: "grid",
            gap: 5,
            padding: "13px 15px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #F7FBF8 0%, #FFFFFF 100%)",
            border: "1px solid #E5EEE7",
          }}
        >
          <div
            style={{
              color: COLORS.muted,
              fontSize: 12,
              fontWeight: 750,
              textTransform: "uppercase",
              letterSpacing: 0.2,
            }}
          >
            Geselecteerde waarde
          </div>
          <div
            style={{
              color: COLORS.text,
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            {displayValue || "Nog geen geldige waarde"}
          </div>
        </div>
      ) : null}

      {visibleContextItems.length > 0 ? (
        <ContextPanel items={visibleContextItems} />
      ) : null}

      {isCompactPresentation ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            minHeight: 34,
            borderRadius: 9,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.veryLight,
            color: COLORS.text,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          Klaar
        </button>
      ) : null}
    </section>
  );

  if (isCompactPresentation) {
    return (
      <>
        {compactSummary}
        <div
          role="presentation"
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: `${modalTopOffset} 12px 12px`,
            background: "rgba(15, 23, 42, 0.22)",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "calc(100vw - 24px)",
              maxWidth: 420,
              maxHeight: modalMaxHeight,
            }}
          >
            {pickerPanel}
          </div>
        </div>
      </>
    );
  }

  return pickerPanel;
}

export default CompanionDateTimePicker;
