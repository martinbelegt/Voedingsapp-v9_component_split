import React, { useState } from "react";

export default function SportFocusPanel({
  selectedDate,
  selectedDay,
  addTrainingPlanEventToDay,
}) {
  const [showTrainingLine, setShowTrainingLine] = useState(true);
  const [showSupplementLine, setShowSupplementLine] = useState(true);

  const plannedTrainings = selectedDay?.trainingPlanEvents || [];

  const plannedSupplements = [
    { id: "supp-1", label: "09:00 — Chlorella 10 stuks" },
    { id: "supp-2", label: "09:00 — Vitamine D" },
  ];

  const toggleStyle = (active, color) => ({
    padding: "5px 8px",
    borderRadius: 999,
    border: active ? `1px solid ${color}` : "1px solid #cbd5e1",
    background: active ? "#ecfdf5" : "#f8fafc",
    color: active ? "#166534" : "#64748b",
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
  });

  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #cbd5e1",
        borderRadius: 14,
        background: "#f8fafc",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 18,
            color: "#0f766e",
          }}
        >
          🏋️ Sport Focus
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowTrainingLine((v) => !v)}
            style={toggleStyle(showTrainingLine, "#22c55e")}
          >
            {showTrainingLine ? "☑" : "☐"} Training
          </button>

          <button
            onClick={() => setShowSupplementLine((v) => !v)}
            style={toggleStyle(showSupplementLine, "#22c55e")}
          >
            {showSupplementLine ? "☑" : "☐"} Supps
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {showTrainingLine && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 900,
                marginBottom: 5,
              }}
            >
              <span>🏋️ Trainingsschema</span>

              <button
                onClick={() => {
                  addTrainingPlanEventToDay({
                    date: selectedDate,
                    eventTime: `${selectedDate}T10:00`,
                    title: "Borst",
                    trainingType: "Krachttraining",
                    durationMinutes: 75,
                    note: "",
                  });
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: "1px solid #67e8f9",
                  background: "#ffffff",
                  color: "#0e7490",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              {plannedTrainings.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: "1px solid #bae6fd",
                    fontSize: 13,
                  }}
                >
                  🕙 {item.eventTime?.slice(11, 16)} — {item.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {showSupplementLine && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 900,
                marginBottom: 5,
              }}
            >
              <span>💊 Sportsupplementen</span>
              <button
                style={{
                  padding: "3px 8px",
                  borderRadius: 999,
                  border: "1px solid #c4b5fd",
                  background: "#ffffff",
                  color: "#5b21b6",
                  fontWeight: 900,
                }}
              >
                +
              </button>
            </div>

            <div style={{ display: "grid", gap: 4 }}>
              {plannedSupplements.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "#ffffff",
                    border: "1px solid #ddd6fe",
                    fontSize: 13,
                  }}
                >
                  💊 {item.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
