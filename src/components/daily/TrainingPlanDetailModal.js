import React from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import {
  formatExercisePrescription,
  sortTrainingExercises,
} from "../../services/trainingStructureService";

export function TrainingPlanDetailModal({
  open,
  training,
  executed = false,
  onClose,
  onEdit,
  onDelete,
  onExecute,
}) {
  if (!training) return null;
  const exercises = sortTrainingExercises(training.exercises || []);
  const dateTime = training.eventTime
    ? new Date(training.eventTime).toLocaleString("nl-NL", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "Geen datum en tijd";

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title={training.title || "Training"}
      subtitle="Geplande training · telt niet als uitgevoerde prestatie"
      footer={
        <>
          {onDelete ? (
            <CompanionButton variant="danger" onClick={onDelete}>
              Verwijderen
            </CompanionButton>
          ) : null}
          <CompanionButton onClick={onClose}>Sluiten</CompanionButton>
          {onExecute && !executed ? (
            <CompanionButton variant="primary" onClick={onExecute}>
              Als uitgevoerd registreren
            </CompanionButton>
          ) : null}
          {onEdit ? (
            <CompanionButton onClick={onEdit}>
              Wijzigen
            </CompanionButton>
          ) : null}
        </>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ color: "#475569", lineHeight: 1.6 }}>
          <div><strong>Status:</strong> {executed ? "✅ Uitgevoerd" : "📅 Gepland"}</div>
          <div><strong>Datum en tijd:</strong> {dateTime}</div>
          <div><strong>Type:</strong> {training.trainingType || "Training"}</div>
          <div><strong>Duur:</strong> {training.durationMinutes ? `${training.durationMinutes} min` : "Niet ingevuld"}</div>
          {training.note ? <div><strong>Notitie:</strong> {training.note}</div> : null}
        </div>
        {exercises.length ? exercises.map((exercise, index) => {
          const rest =
            exercise.restSecondsMin !== undefined ||
            exercise.restSecondsMax !== undefined
              ? `${exercise.restSecondsMin ?? exercise.restSecondsMax}–${
                  exercise.restSecondsMax ?? exercise.restSecondsMin
                } sec rust`
              : null;
          const details = [
            exercise.weight !== undefined
              ? `${exercise.weight}${exercise.weightUnit ? ` ${exercise.weightUnit}` : ""}`
              : null,
            exercise.tempo ? `tempo ${exercise.tempo}` : null,
            rest,
            exercise.toFailure === true ? "Tot spierfalen" : null,
            exercise.rir !== undefined ? `RIR ${exercise.rir}` : null,
            exercise.rpe !== undefined ? `RPE ${exercise.rpe}` : null,
          ].filter(Boolean);
          return (
            <article key={exercise.id || index} style={{ padding: 12, border: "1px solid #dbe7de", borderRadius: 12, background: "#f8fcf9" }}>
              <div style={{ fontWeight: 850 }}>{index + 1}. {exercise.name || "Oefening"}</div>
              {formatExercisePrescription(exercise) ? <div style={{ marginTop: 3, color: "#4f7d55", fontWeight: 750 }}>{formatExercisePrescription(exercise)}</div> : null}
              {details.length ? <div style={{ marginTop: 4, color: "#64748b" }}>{details.join(" · ")}</div> : null}
              {exercise.note ? <div style={{ marginTop: 7, whiteSpace: "pre-wrap" }}>{exercise.note}</div> : null}
            </article>
          );
        }) : <div style={{ color: "#64748b" }}>Geen oefeningen toegevoegd.</div>}
      </div>
    </CompanionModalShell>
  );
}
