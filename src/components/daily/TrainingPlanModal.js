import React, { useEffect, useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import {
  CompanionInput,
  CompanionNumberInput,
} from "../../ui/inputs/CompanionInput";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";
import { TRAINING_TYPES } from "../../services/trainingPlanService";

const fieldStyle = { display: "grid", gap: 6 };
const labelStyle = { color: "#334155", fontSize: 13, fontWeight: 800 };

export function TrainingPlanModal({
  open,
  selectedDate,
  training,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    eventTime: `${selectedDate}T10:00`,
    title: "",
    trainingType: TRAINING_TYPES[0],
    durationMinutes: "",
    note: "",
  });

  useEffect(() => {
    setForm({
      eventTime: training?.eventTime || `${selectedDate}T10:00`,
      title: training?.title || "",
      trainingType: training?.trainingType || TRAINING_TYPES[0],
      durationMinutes: training?.durationMinutes ?? "",
      note: training?.note || "",
    });
  }, [open, selectedDate, training]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.eventTime || !form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), note: form.note.trim() });
  }

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title={training ? "Training bewerken" : "Training plannen"}
      subtitle="Dit is een planning. Een uitgevoerde training registreer je apart als beweging."
      footer={
        <>
          <CompanionButton onClick={onClose}>Annuleren</CompanionButton>
          <CompanionButton
            variant="primary"
            onClick={submit}
            disabled={!form.eventTime || !form.title.trim()}
          >
            {training ? "Wijzigingen opslaan" : "Training opslaan"}
          </CompanionButton>
        </>
      }
    >
      <form
        onSubmit={submit}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      >
        <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <CompanionDateTimePicker
            mode="datetime"
            presentation="compact"
            label="Datum en tijd"
            value={form.eventTime}
            onChange={(value) => setField("eventTime", value)}
            contextItems={[]}
          />
        </div>

        <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <span style={labelStyle}>Titel</span>
          <CompanionInput
            value={form.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="Bijvoorbeeld borst en triceps"
            autoFocus
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Type training</span>
          <select
            value={form.trainingType}
            onChange={(event) => setField("trainingType", event.target.value)}
            style={{
              width: "100%",
              minHeight: 42,
              padding: "9px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              fontSize: 15,
            }}
          >
            {TRAINING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Geplande duur (minuten)</span>
          <CompanionNumberInput
            decimal={false}
            value={form.durationMinutes}
            onChange={(event) =>
              setField(
                "durationMinutes",
                event.target.value.replace(/[^0-9]/g, ""),
              )
            }
            placeholder="60"
          />
        </label>

        <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
          <span style={labelStyle}>Notitie (optioneel)</span>
          <textarea
            value={form.note}
            onChange={(event) => setField("note", event.target.value)}
            rows={3}
            placeholder="Bijvoorbeeld rustig opbouwen"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              font: "inherit",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </label>
      </form>
    </CompanionModalShell>
  );
}
