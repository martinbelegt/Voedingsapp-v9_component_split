import React from "react";

export function DailyMealActions({
  changeMealTime,
  changeMedicalLog,
  onDelete,
  meal,
  buttonStyle,
}) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);
  if (isMobile) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
      <button
        onClick={() => changeMealTime()}
        style={{
          ...buttonStyle,
          padding: window.innerWidth < 900 ? "4px 6px" : "6px 9px",

          fontSize: window.innerWidth < 900 ? 11 : 12,

          borderRadius: 8,
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
          padding: window.innerWidth < 900 ? "4px 6px" : "6px 9px",

          fontSize: window.innerWidth < 900 ? 11 : 12,

          borderRadius: 8,
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
          padding: window.innerWidth < 900 ? "4px 6px" : "6px 9px",

          fontSize: window.innerWidth < 900 ? 11 : 12,

          borderRadius: 8,
        }}
      >
        Verwijder
      </button>
    </div>
  );
}
