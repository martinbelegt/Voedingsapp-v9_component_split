import React, { useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

export function DailyEventTimeEditorModal({
  initialValue,
  onSave,
  onClose,
}) {
  const [draftValue, setDraftValue] = useState(initialValue || "");

  const footer = (
    <>
      <CompanionButton
        variant="secondary"
        onClick={onClose}
      >
        Annuleren
      </CompanionButton>

      <CompanionButton
        variant="primary"
        onClick={() => {
          if (!draftValue) return;

          onSave(draftValue);
          onClose();
        }}
      >
        Opslaan
      </CompanionButton>
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
