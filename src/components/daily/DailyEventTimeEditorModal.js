import React, { useState } from "react";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

export function DailyEventTimeEditorModal({
  initialValue,
  buttonStyle,
  onSave,
  onClose,
}) {
  const [draftValue, setDraftValue] = useState(initialValue || "");

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

        <CompanionDateTimePicker
          value={draftValue}
          onChange={setDraftValue}
          mode="datetime"
          label="Datum en tijd"
          compact
          contextItems={[]}
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
