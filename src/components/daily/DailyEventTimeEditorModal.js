import React, { useState } from "react";

export function DailyEventTimeEditorModal({
  initialValue,
  buttonStyle,
  onSave,
  onClose,
}) {
  const [draftValue, setDraftValue] = useState(initialValue || "");

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 9999,
      }}
    >
      {/* Tijd-editor venster */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 94vw)",
          background: "white",
          borderRadius: 18,
          padding: 18,
          border: "1px solid #cbd5e1",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        {/* Kop */}
        <div
          style={{
            fontWeight: 900,
            fontSize: 18,
            color: "#0f172a",
            marginBottom: 10,
          }}
        >
          Datum en tijd wijzigen
        </div>

        {/* Uitleg */}
        <div
          style={{
            fontSize: 13,
            color: "#475569",
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          Kies de werkelijke of geplande datum en tijd van dit eetmoment.
        </div>

        {/* Datum/tijd invoer */}
        <input
          type="datetime-local"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onClick={(e) => {
            if (e.currentTarget.showPicker) {
              e.currentTarget.showPicker();
            }
          }}
          style={{
            width: "100%",

            boxSizing: "border-box",

            padding: isMobile ? "12px 11px" : "10px 11px",

            borderRadius: 10,

            border: "1px solid #cbd5e1",

            fontSize: isMobile ? 16 : 14,

            marginBottom: 14,

            cursor: "pointer",

            minHeight: 46,

            WebkitAppearance: "none",
          }}
        />

        {/* Acties */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              ...buttonStyle,
              padding: "8px 12px",
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
            }}
          >
            Annuleren
          </button>

          <button
            onClick={() => {
              if (!draftValue) return;

              onSave(draftValue);
              onClose();
            }}
            style={{
              ...buttonStyle,
              padding: "8px 12px",
              borderRadius: 10,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              fontWeight: 800,
            }}
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
