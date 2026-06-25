const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function pad2(value) {
  return String(value).padStart(2, "0");
}

function parseDateParts(value) {
  if (typeof value !== "string") return null;

  const datePart = value.slice(0, 10);
  if (!DATE_PATTERN.test(datePart)) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;

  return { year, month, day };
}

function formatDateParts(parts) {
  if (!parts) return "";

  return new Date(parts.year, parts.month - 1, parts.day).toLocaleDateString(
    "nl-NL",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

export function formatDateForDisplay(value) {
  return formatDateParts(parseDateParts(value));
}

export function formatTimeForDisplay(value) {
  if (typeof value !== "string") return "";

  const timePart = value.includes("T")
    ? value.split("T")[1]?.slice(0, 5)
    : value.slice(0, 5);

  if (!TIME_PATTERN.test(timePart)) return "";

  return timePart;
}

export function formatDateTimeForDisplay(value) {
  const dateLabel = formatDateForDisplay(value);
  const timeLabel = formatTimeForDisplay(value);

  if (dateLabel && timeLabel) return `${dateLabel} • ${timeLabel}`;
  return dateLabel || timeLabel || "";
}

export function combineDateAndTime(date, time) {
  const normalizedDate = normalizeDateTimeValue(date, "date");
  const normalizedTime = normalizeDateTimeValue(time, "time") || "00:00";

  if (!normalizedDate) return "";

  return `${normalizedDate}T${normalizedTime}`;
}

export function splitDateTime(value) {
  const normalized = normalizeDateTimeValue(value, "datetime");

  if (!normalized) {
    return {
      date: normalizeDateTimeValue(value, "date"),
      time: normalizeDateTimeValue(value, "time"),
    };
  }

  const [date, timeWithSeconds = ""] = normalized.split("T");

  return {
    date,
    time: timeWithSeconds.slice(0, 5),
  };
}

export function normalizeDateTimeValue(value, mode = "datetime") {
  if (value == null) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const date = `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
      value.getDate(),
    )}`;
    const time = `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

    if (mode === "date") return date;
    if (mode === "time") return time;
    return `${date}T${time}`;
  }

  const rawValue = String(value).trim();
  if (!rawValue) return "";

  if (mode === "date") {
    return DATE_PATTERN.test(rawValue.slice(0, 10)) ? rawValue.slice(0, 10) : "";
  }

  if (mode === "time") {
    if (TIME_PATTERN.test(rawValue.slice(0, 5))) return rawValue.slice(0, 5);

    if (rawValue.includes("T")) {
      const timePart = rawValue.split("T")[1]?.slice(0, 5) || "";
      return TIME_PATTERN.test(timePart) ? timePart : "";
    }

    return "";
  }

  if (DATE_TIME_PATTERN.test(rawValue)) {
    return rawValue.slice(0, 16);
  }

  const date = normalizeDateTimeValue(rawValue, "date");
  const time = normalizeDateTimeValue(rawValue, "time");

  if (date && time) return `${date}T${time}`;
  if (date) return `${date}T00:00`;

  return "";
}
