import React, { useState } from "react";

export function DailyTimerModal({ event, buttonStyle, onClose, onSave }) {
  const [minutes, setMinutes] = useState(60);
  const [label, setLabel] = useState("Bijspuiten / controleren");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px,95vw)",
          background: "white",
          borderRadius: 12,
          padding: 14,
          border: "1px solid #cbd5e1",
          boxShadow: "0 20px 50px rgba(0,0,0,.25)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Timer instellen</h3>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          {[15, 30, 45, 60, 90].map((m) => (
            <button
              key={m}
              onClick={() => setMinutes(m)}
              style={{
                ...buttonStyle,
                background: minutes === m ? "#ffedd5" : undefined,

                border: minutes === m ? "1px solid #fdba74" : undefined,
              }}
            >
              {m}m
            </button>
          ))}
        </div>

        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Omschrijving"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 11px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            marginBottom: 14,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button onClick={onClose} style={buttonStyle}>
            Annuleer
          </button>

          <button
            onClick={() => {
              onSave({
                minutes,
                label,
              });

              onClose();
            }}
            style={{
              ...buttonStyle,
              background: "#fff7ed",
              border: "1px solid #fdba74",
              color: "#c2410c",
              fontWeight: 800,
            }}
          >
            Start timer
          </button>
        </div>
      </div>
    </div>
  );
}
