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
  primary: "#D89A3A",
  soft: "#FFF4E0",
  hover: "#FFE8B8",
  border: "#F2C879",
  text: "#1F2933",
  muted: "#6B7280",
  card: "#FFFFFF",
  app: "#FAFBFA",
};

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

function currentTime() {
  const date = new Date();
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
  if (mode === "date") return "Datum";
  if (mode === "time") return "Tijd";
  return "Datum en tijd";
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

function NumberField({ label, value, width, onChange, disabled }) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          color: COLORS.muted,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <input
        value={value}
        disabled={disabled}
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        style={{
          width,
          maxWidth: "100%",
          minHeight: 48,
          boxSizing: "border-box",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          background: disabled ? "#f3f4f6" : COLORS.card,
          color: disabled ? "#9ca3af" : COLORS.text,
          padding: "10px 12px",
          fontSize: 16,
          fontWeight: 900,
          textAlign: "center",
          outlineColor: COLORS.primary,
        }}
      />
    </label>
  );
}

export function CompanionDateTimePicker({
  mode = "datetime",
  value = "",
  onChange,
  label,
  disabled = false,
  compact = false,
}) {
  const safeMode = VALID_MODES.has(mode) ? mode : "datetime";
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

  function updateDatePart(key, nextValue) {
    const nextParts = {
      ...dateParts,
      [key]: nextValue.slice(0, key === "year" ? 4 : 2),
    };
    setDateParts(nextParts);
    emitDateTime(nextParts, timeParts);
  }

  function updateTimePart(key, nextValue) {
    const nextParts = { ...timeParts, [key]: nextValue.slice(0, 2) };
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

  return (
    <section
      aria-label={title}
      style={{
        width: "100%",
        boxSizing: "border-box",
        border: `1px solid ${COLORS.border}`,
        borderRadius: compact ? 18 : 24,
        background: COLORS.card,
        boxShadow: "0 16px 40px rgba(216, 154, 58, 0.14)",
        padding: compact ? 14 : 18,
        display: "grid",
        gap: compact ? 12 : 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: COLORS.primary,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Companion Picker
          </div>
          <div
            style={{
              color: COLORS.text,
              fontSize: compact ? 18 : 20,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            minHeight: 38,
            display: "flex",
            alignItems: "center",
            padding: "7px 10px",
            borderRadius: 999,
            background: COLORS.soft,
            color: COLORS.primary,
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {safeMode}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {quickChoices(safeMode).map((choice) => (
          <button
            key={choice.key}
            type="button"
            disabled={disabled}
            onClick={() => applyQuickChoice(choice)}
            onMouseEnter={() => setHoveredChoice(choice.key)}
            onMouseLeave={() => setHoveredChoice(null)}
            style={{
              minHeight: 42,
              padding: "9px 13px",
              borderRadius: 999,
              border: `1px solid ${COLORS.border}`,
              background:
                !disabled && hoveredChoice === choice.key
                  ? COLORS.hover
                  : disabled
                    ? "#f8fafc"
                    : COLORS.soft,
              color: disabled ? "#9ca3af" : COLORS.primary,
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 900,
              boxShadow: "0 1px 2px rgba(216, 154, 58, 0.12)",
              transition: "background 140ms ease, transform 140ms ease",
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns:
            showDate && showTime
              ? "repeat(auto-fit, minmax(180px, 1fr))"
              : "1fr",
          alignItems: "start",
        }}
      >
        {showDate ? (
          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 12,
              borderRadius: 18,
              background: COLORS.app,
              border: "1px solid #f3eadb",
            }}
          >
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 900 }}>
              Datum
            </div>
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "repeat(auto-fit, minmax(68px, 1fr))",
              }}
            >
              <NumberField
                label="Dag"
                value={dateParts.day}
                width="100%"
                disabled={disabled}
                onChange={(nextValue) => updateDatePart("day", nextValue)}
              />
              <NumberField
                label="Maand"
                value={dateParts.month}
                width="100%"
                disabled={disabled}
                onChange={(nextValue) => updateDatePart("month", nextValue)}
              />
              <NumberField
                label="Jaar"
                value={dateParts.year}
                width="100%"
                disabled={disabled}
                onChange={(nextValue) => updateDatePart("year", nextValue)}
              />
            </div>
          </div>
        ) : null}

        {showTime ? (
          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 12,
              borderRadius: 18,
              background: COLORS.app,
              border: "1px solid #f3eadb",
            }}
          >
            <div style={{ color: COLORS.muted, fontSize: 13, fontWeight: 900 }}>
              Tijd
            </div>
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <NumberField
                label="Uur"
                value={timeParts.hour}
                width="100%"
                disabled={disabled}
                onChange={(nextValue) => updateTimePart("hour", nextValue)}
              />
              <NumberField
                label="Min"
                value={timeParts.minute}
                width="100%"
                disabled={disabled}
                onChange={(nextValue) => updateTimePart("minute", nextValue)}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "grid",
          gap: 4,
          padding: "12px 14px",
          borderRadius: 18,
          background: `linear-gradient(135deg, ${COLORS.soft} 0%, #ffffff 100%)`,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            color: COLORS.primary,
            fontSize: 11,
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          Preview
        </div>
        <div
          style={{
            color: COLORS.text,
            fontSize: 16,
            fontWeight: 900,
            lineHeight: 1.25,
          }}
        >
          {displayValue || "Nog geen geldige waarde"}
        </div>
      </div>
    </section>
  );
}

export default CompanionDateTimePicker;
