import React, { useState } from "react";
import { CompanionDateTimePicker } from "../ui/pickers/CompanionDateTimePicker";

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
};

const outputStyle = {
  marginTop: 10,
  padding: "8px 10px",
  borderRadius: 8,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};

function PickerExample({ title, mode, value, onChange }) {
  return (
    <div style={cardStyle}>
      <h3
        style={{
          marginTop: 0,
          marginBottom: 12,
          color: "#0f172a",
          fontSize: 18,
        }}
      >
        {title}
      </h3>

      <CompanionDateTimePicker
        mode={mode}
        value={value}
        onChange={onChange}
        label={title}
        presentation="expanded"
      />

      <div style={outputStyle}>Output: {value || "(leeg)"}</div>
    </div>
  );
}

function CompactPickerExample({ value, onChange }) {
  return (
    <div style={cardStyle}>
      <h3
        style={{
          marginTop: 0,
          marginBottom: 12,
          color: "#0f172a",
          fontSize: 18,
        }}
      >
        Compact app example
      </h3>

      <CompanionDateTimePicker
        mode="datetime"
        value={value}
        onChange={onChange}
        label="Datum en tijd"
        compact
        contextItems={[]}
      />

      <div style={outputStyle}>Output: {value || "(leeg)"}</div>
    </div>
  );
}

export function FoundationPlayground() {
  const [dateValue, setDateValue] = useState("2026-06-24");
  const [timeValue, setTimeValue] = useState("22:15");
  const [dateTimeValue, setDateTimeValue] = useState("2026-06-24T22:15");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: 4,
            color: "#0f766e",
            fontSize: 24,
          }}
        >
          Foundation Playground
        </h2>
        <div style={{ color: "#64748b", fontSize: 14 }}>
          Tijdelijke developer playground voor de CompanionDateTimePicker.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          alignItems: "start",
        }}
      >
        <PickerExample
          title="Date"
          mode="date"
          value={dateValue}
          onChange={setDateValue}
        />
        <PickerExample
          title="Time"
          mode="time"
          value={timeValue}
          onChange={setTimeValue}
        />
        <PickerExample
          title="DateTime"
          mode="datetime"
          value={dateTimeValue}
          onChange={setDateTimeValue}
        />
      </div>

      <CompactPickerExample
        value={dateTimeValue}
        onChange={setDateTimeValue}
      />
    </div>
  );
}

export default FoundationPlayground;
