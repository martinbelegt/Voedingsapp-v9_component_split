import React, { useMemo, useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { TrainingPlanModal } from "./TrainingPlanModal";

function displayTime(eventTime) {
  const time = String(eventTime || "").slice(11, 16);
  return /^\d{2}:\d{2}$/.test(time) ? time : "--:--";
}

export function TrainingPlanSection({
  selectedDate,
  trainingPlans = [],
  isMobile,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const sortedPlans = useMemo(
    () =>
      [...trainingPlans].sort((left, right) =>
        String(left.eventTime || "").localeCompare(
          String(right.eventTime || ""),
        ),
      ),
    [trainingPlans],
  );

  if (isMobile && sortedPlans.length === 0) return null;

  function openNew() {
    setEditingTraining(null);
    setModalOpen(true);
  }

  function openEdit(training) {
    setEditingTraining(training);
    setModalOpen(true);
  }

  function save(values) {
    if (editingTraining) {
      onUpdate(editingTraining.id, values);
    } else {
      onAdd(values);
    }
    setModalOpen(false);
    setEditingTraining(null);
  }

  return (
    <section
      aria-label="Geplande trainingen"
      style={{
        margin: "0 0 16px",
        padding: isMobile ? 12 : 16,
        border: "1px solid #c9ddce",
        borderRadius: 16,
        background: "#f8fcf9",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: sortedPlans.length ? 12 : 0,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#0f172a", fontSize: 17 }}>
            Geplande trainingen
          </h3>
          {!isMobile && (
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
              Planning telt niet mee als uitgevoerde beweging.
            </p>
          )}
        </div>
        {!isMobile && (
          <CompanionButton variant="primary" size="sm" icon="plus" onClick={openNew}>
            Training plannen
          </CompanionButton>
        )}
      </div>

      {sortedPlans.length === 0 ? (
        <p style={{ margin: "12px 0 0", color: "#64748b", fontSize: 14 }}>
          Voor deze dag staat nog geen training gepland.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 9 }}>
          {sortedPlans.map((training) => (
            <article
              key={training.id}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "52px 1fr" : "62px 1fr auto",
                gap: 12,
                alignItems: "start",
                padding: 12,
                border: "1px solid #dbe7de",
                borderRadius: 13,
                background: "#fff",
              }}
            >
              <strong style={{ color: "#4f7d55", fontSize: 16 }}>
                {displayTime(training.eventTime)}
              </strong>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    marginBottom: 4,
                    color: "#4f7d55",
                    fontSize: 11,
                    fontWeight: 850,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  Geplande training
                </div>
                <div style={{ color: "#0f172a", fontWeight: 850 }}>
                  {training.title || "Training"}
                </div>
                <div
                  style={{
                    marginTop: 3,
                    color: "#64748b",
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  {training.trainingType || "Training"}
                  {training.durationMinutes
                    ? ` · ${training.durationMinutes} min`
                    : ""}
                </div>
                {training.note ? (
                  <div
                    style={{
                      marginTop: 6,
                      color: "#334155",
                      fontSize: 13,
                      lineHeight: 1.4,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {training.note}
                  </div>
                ) : null}
              </div>
              {!isMobile && (
                <div style={{ display: "flex", gap: 6 }}>
                  <CompanionButton size="sm" onClick={() => openEdit(training)}>
                    Bewerken
                  </CompanionButton>
                  <CompanionButton
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (window.confirm("Deze geplande training verwijderen?")) {
                        onDelete(training.id);
                      }
                    }}
                  >
                    Verwijderen
                  </CompanionButton>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!isMobile && (
        <TrainingPlanModal
          open={modalOpen}
          selectedDate={selectedDate}
          training={editingTraining}
          onClose={() => {
            setModalOpen(false);
            setEditingTraining(null);
          }}
          onSave={save}
        />
      )}
    </section>
  );
}
