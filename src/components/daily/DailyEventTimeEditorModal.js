import React, { useState } from "react";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

export function DailyEventTimeEditorModal({
  initialValue,
  buttonStyle,
  onSave,
  onClose,
}) {
  const [draftValue, setDraftValue] = useState(initialValue || "");

  const footer = (
    <>
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
    </>
  );

  return (
    <CompanionModalShell
      open
      onClose={onClose}
      title="Datum en tijd wijzigen"
      subtitle="Kies de werkelijke of geplande datum en tijd van dit eetmoment."
      size="sm"
      footer={footer}
    >
        <CompanionDateTimePicker
          value={draftValue}
          onChange={setDraftValue}
          mode="datetime"
          label="Datum en tijd"
          compact
          contextItems={[]}
        />
    </CompanionModalShell>
  );
}
