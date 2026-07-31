import React, { useEffect, useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import {
  CompanionInput,
  CompanionNumberInput,
} from "../../ui/inputs/CompanionInput";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

const labelStyle = { color: "#334155", fontSize: 13, fontWeight: 800 };

export function PlannedExecutionModal({
  open,
  kind,
  item,
  onClose,
  onSave,
}) {
  const isTraining = kind === "training";
  const [eventTime, setEventTime] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");

  useEffect(() => {
    setEventTime(item?.eventTime || "");
    setAmount(item?.amount || "");
    setUnit(item?.unit || "");
    setDurationMinutes(item?.durationMinutes ?? "");
  }, [item, open]);

  function submit(event) {
    event.preventDefault();
    if (!eventTime) return;
    onSave(
      isTraining
        ? { eventTime, durationMinutes }
        : { eventTime, amount, unit },
    );
  }

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title={isTraining ? "Training uitgevoerd" : "Supplement ingenomen"}
      subtitle="Controleer de werkelijke gegevens voordat je registreert. De planning blijft bestaan."
      footer={
        <>
          <CompanionButton onClick={onClose}>Annuleren</CompanionButton>
          <CompanionButton
            variant="primary"
            onClick={submit}
            disabled={!eventTime}
          >
            Werkelijk registreren
          </CompanionButton>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        <CompanionDateTimePicker
          mode="datetime"
          presentation="compact"
          label="Werkelijke datum en tijd"
          value={eventTime}
          onChange={setEventTime}
          contextItems={[]}
        />

        {isTraining ? (
          <label style={{ display: "grid", gap: 6 }}>
            <span style={labelStyle}>Werkelijke duur (minuten)</span>
            <CompanionNumberInput
              decimal={false}
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(event.target.value.replace(/[^0-9]/g, ""))
              }
            />
          </label>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Werkelijke hoeveelheid</span>
              <CompanionNumberInput
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={labelStyle}>Eenheid</span>
              <CompanionInput
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              />
            </label>
          </div>
        )}
      </form>
    </CompanionModalShell>
  );
}
