import React, { useEffect, useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import {
  CompanionInput,
  CompanionNumberInput,
} from "../../ui/inputs/CompanionInput";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";
import { TRAINING_TYPES } from "../../services/trainingPlanService";
import {
  normalizeTrainingExercise,
  sortTrainingExercises,
} from "../../services/trainingStructureService";

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
    exercises: [],
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    setForm({
      eventTime: training?.eventTime || `${selectedDate}T10:00`,
      title: training?.title || "",
      trainingType: training?.trainingType || TRAINING_TYPES[0],
      durationMinutes: training?.durationMinutes ?? "",
      note: training?.note || "",
      exercises: sortTrainingExercises(training?.exercises || []),
    });
    setAdvancedOpen(Boolean(training?.exercises?.length));
  }, [open, selectedDate, training]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.eventTime || !form.title.trim()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      note: form.note.trim(),
      exercises: form.exercises
        .filter((exercise) => exercise.name.trim())
        .map((exercise, order) =>
          normalizeTrainingExercise({ ...exercise, order }, order),
        ),
    });
  }

  function addExercise() {
    setForm((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          id: `exercise-${Date.now()}-${current.exercises.length}`,
          name: "",
          order: current.exercises.length,
        },
      ],
    }));
    setAdvancedOpen(true);
  }

  function updateExercise(index, field, value) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? { ...exercise, [field]: value } : exercise,
      ),
    }));
  }

  function moveExercise(index, direction) {
    setForm((current) => {
      const exercises = [...current.exercises];
      const target = index + direction;
      if (target < 0 || target >= exercises.length) return current;
      [exercises[index], exercises[target]] = [exercises[target], exercises[index]];
      return {
        ...current,
        exercises: exercises.map((exercise, order) => ({ ...exercise, order })),
      };
    });
  }

  function removeExercise(index) {
    setForm((current) => ({
      ...current,
      exercises: current.exercises
        .filter((_, exerciseIndex) => exerciseIndex !== index)
        .map((exercise, order) => ({ ...exercise, order })),
    }));
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

        <div style={{ gridColumn: "1 / -1", display: "grid", gap: 10 }}>
          <CompanionButton
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
          >
            {advancedOpen ? "Oefeningen verbergen" : "Oefeningen toevoegen"}
          </CompanionButton>
          {advancedOpen ? (
            <div style={{ display: "grid", gap: 12 }}>
              {form.exercises.map((exercise, index) => (
                <fieldset
                  key={exercise.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                    border: "1px solid #dbe7de",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <legend style={labelStyle}>Oefening {index + 1}</legend>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    <span style={labelStyle}>Naam</span>
                    <CompanionInput
                      value={exercise.name}
                      onChange={(event) =>
                        updateExercise(index, "name", event.target.value)
                      }
                      placeholder="Incline Dumbbell Press"
                    />
                  </label>
                  {[
                    ["sets", "Sets"],
                    ["repsMin", "Reps minimum"],
                    ["repsMax", "Reps maximum"],
                    ["weight", "Gewicht"],
                    ["restSecondsMin", "Rust minimum (sec)"],
                    ["restSecondsMax", "Rust maximum (sec)"],
                  ].map(([field, label]) => (
                    <label key={field} style={fieldStyle}>
                      <span style={labelStyle}>{label}</span>
                      <CompanionNumberInput
                        value={exercise[field] ?? ""}
                        onChange={(event) =>
                          updateExercise(
                            index,
                            field,
                            event.target.value.replace(/[^0-9.,]/g, ""),
                          )
                        }
                      />
                    </label>
                  ))}
                  <label style={fieldStyle}>
                    <span style={labelStyle}>Tempo</span>
                    <CompanionInput
                      value={exercise.tempo || ""}
                      onChange={(event) =>
                        updateExercise(index, "tempo", event.target.value)
                      }
                      placeholder="3-1-1-0"
                    />
                  </label>
                  <label style={{ ...fieldStyle, alignContent: "end" }}>
                    <span style={labelStyle}>Tot spierfalen</span>
                    <input
                      type="checkbox"
                      checked={exercise.toFailure === true}
                      onChange={(event) =>
                        updateExercise(index, "toFailure", event.target.checked)
                      }
                    />
                  </label>
                  <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                    <span style={labelStyle}>Oefeningnotitie</span>
                    <textarea
                      rows={2}
                      value={exercise.note || ""}
                      onChange={(event) =>
                        updateExercise(index, "note", event.target.value)
                      }
                    />
                  </label>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <CompanionButton
                      type="button"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveExercise(index, -1)}
                    >
                      Omhoog
                    </CompanionButton>
                    <CompanionButton
                      type="button"
                      size="sm"
                      disabled={index === form.exercises.length - 1}
                      onClick={() => moveExercise(index, 1)}
                    >
                      Omlaag
                    </CompanionButton>
                    <CompanionButton
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => removeExercise(index)}
                    >
                      Verwijderen
                    </CompanionButton>
                  </div>
                </fieldset>
              ))}
              <CompanionButton type="button" onClick={addExercise}>
                + Oefening toevoegen
              </CompanionButton>
            </div>
          ) : null}
        </div>
      </form>
    </CompanionModalShell>
  );
}
