import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatTimeForDisplay,
  normalizeDateTimeValue,
} from "./dateTimeHelpers";

const VALID_MODES = new Set(["date", "time", "datetime"]);

function getInputType(mode) {
  if (mode === "datetime") return "datetime-local";
  return mode;
}

function getDisplayValue(mode, value) {
  if (mode === "date") return formatDateForDisplay(value);
  if (mode === "time") return formatTimeForDisplay(value);
  return formatDateTimeForDisplay(value);
}

function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;

    return (
      window.innerWidth < 900 ||
      /iPhone|iPad|Android/i.test(window.navigator?.userAgent || "")
    );
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function updateViewport() {
      setIsMobile(
        window.innerWidth < 900 ||
          /iPhone|iPad|Android/i.test(window.navigator?.userAgent || ""),
      );
    }

    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return isMobile;
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
  const inputRef = useRef(null);
  const isMobile = useMobileViewport();
  const useCompactView = compact || isMobile;
  const normalizedValue = normalizeDateTimeValue(value, safeMode);

  const displayValue = useMemo(
    () => getDisplayValue(safeMode, normalizedValue),
    [safeMode, normalizedValue],
  );

  function emitChange(nextValue) {
    const normalizedNextValue = normalizeDateTimeValue(nextValue, safeMode);
    onChange?.(normalizedNextValue);
  }

  function openPicker() {
    if (disabled) return;

    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
      return;
    }

    inputRef.current?.focus();
  }

  const labelStyle = {
    display: "block",
    marginBottom: 4,
    fontSize: 12,
    fontWeight: 800,
    color: "#475569",
    lineHeight: 1.2,
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: useCompactView ? 8 : 10,
    background: disabled ? "#f1f5f9" : useCompactView ? "#f8fafc" : "#ffffff",
    color: disabled ? "#94a3b8" : "#0f172a",
    padding: useCompactView ? "8px 10px" : "10px 12px",
    minHeight: useCompactView ? 38 : 42,
    fontSize: useCompactView ? 16 : 14,
    lineHeight: 1.2,
    cursor: disabled ? "not-allowed" : "pointer",
    WebkitAppearance: "none",
  };

  const compactDisplayStyle = {
    ...inputStyle,
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <label style={{ display: "block", width: "100%" }}>
      {label ? <span style={labelStyle}>{label}</span> : null}

      {useCompactView ? (
        <span style={{ position: "relative", display: "block" }}>
          <button
            type="button"
            disabled={disabled}
            onClick={openPicker}
            style={compactDisplayStyle}
          >
            {displayValue || "Kies datum/tijd"}
          </button>
          <input
            ref={inputRef}
            type={getInputType(safeMode)}
            value={normalizedValue}
            disabled={disabled}
            aria-label={label || "Datum en tijd"}
            onChange={(event) => emitChange(event.target.value)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        </span>
      ) : (
        <input
          ref={inputRef}
          type={getInputType(safeMode)}
          value={normalizedValue}
          disabled={disabled}
          aria-label={label || "Datum en tijd"}
          onChange={(event) => emitChange(event.target.value)}
          onClick={openPicker}
          style={inputStyle}
        />
      )}
    </label>
  );
}

export default CompanionDateTimePicker;
