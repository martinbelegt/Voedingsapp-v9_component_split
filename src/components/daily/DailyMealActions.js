import React from "react";

export function DailyMealActions({
  changeMealTime,
  changeMedicalLog,
  onDelete,
  meal,
  buttonStyle,
}) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
      <button
        onClick={() => changeMealTime()}
        style={{
          ...buttonStyle,
          padding: "6px 9px",
          fontSize: 12,
          borderRadius: 10,
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
          color: "#3730a3",
        }}
      >
        Tijd wijzigen
      </button>

      <button
        onClick={() => changeMedicalLog()}
        style={{
          ...buttonStyle,
          padding: "6px 9px",
          fontSize: 12,
          borderRadius: 10,
          background: "#ecfdf5",
          border: "1px solid #bbf7d0",
          color: "#166534",
        }}
      >
        Context wijzigen
      </button>

      <button
        onClick={() => onDelete(meal.id)}
        style={{
          ...buttonStyle,
          padding: "6px 9px",
          fontSize: 12,
          borderRadius: 10,
        }}
      >
        Verwijder
      </button>
    </div>
  );
}
