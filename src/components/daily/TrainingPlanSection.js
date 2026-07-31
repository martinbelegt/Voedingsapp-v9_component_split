import React, { useMemo, useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { TrainingPlanModal } from "./TrainingPlanModal";
import { SportSupplementPlanModal } from "./SportSupplementPlanModal";
import { PlannedExecutionModal } from "./PlannedExecutionModal";
import {
  isSportSupplementPlanTaken,
  isTrainingPlanExecuted,
} from "../../services/plannedExecutionService";

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
  supplementPlans = [],
  onAddSupplementPlan,
  onUpdateSupplementPlan,
  onDeleteSupplementPlan,
  dailyLog = [],
  onExecuteTraining,
  onTakeSupplement,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [supplementModal, setSupplementModal] = useState({
    open: false,
    training: null,
    plan: null,
  });
  const [executionModal, setExecutionModal] = useState({
    open: false,
    kind: null,
    item: null,
  });
  const sortedPlans = useMemo(
    () =>
      [...trainingPlans].sort((left, right) =>
        String(left.eventTime || "").localeCompare(
          String(right.eventTime || ""),
        ),
      ),
    [trainingPlans],
  );
  const linkedSupplementIds = new Set(
    sortedPlans.map((training) => training.id),
  );
  const unlinkedSupplements = supplementPlans.filter(
    (plan) =>
      !plan.trainingPlanId || !linkedSupplementIds.has(plan.trainingPlanId),
  );

  if (isMobile && sortedPlans.length === 0 && supplementPlans.length === 0) {
    return null;
  }

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

  function plansForTraining(trainingId) {
    return supplementPlans
      .filter((plan) => plan.trainingPlanId === trainingId)
      .sort((left, right) =>
        String(left.eventTime || "").localeCompare(
          String(right.eventTime || ""),
        ),
      );
  }

  function renderSupplementPlan(plan, compact = false) {
    const taken = isSportSupplementPlanTaken(dailyLog, plan.id);
    return (
      <div
        key={plan.id}
        style={{
          display: isMobile ? "grid" : "flex",
          gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : undefined,
          justifyContent: "space-between",
          gap: 8,
          padding: compact ? "7px 0" : "7px 9px",
          borderTop: compact ? "1px solid #ede9fe" : undefined,
          borderRadius: compact ? 0 : 9,
          background: compact ? "transparent" : "#faf7ff",
          color: "#4c1d95",
          fontSize: 13,
        }}
      >
        <div>
          <div style={{ fontWeight: 850 }}>
            {displayTime(plan.eventTime)} · {plan.name || "Supplement"}
          </div>
          <div style={{ marginTop: 2, color: "#6d28d9" }}>
            {[plan.amount, plan.unit].filter(Boolean).join(" ") || "Geen dosis"}
          </div>
          {plan.note ? (
            <div style={{ marginTop: 3, color: "#64748b" }}>{plan.note}</div>
          ) : null}
          <div
            style={{
              marginTop: 3,
              color: "#7c3aed",
              fontSize: 10,
              fontWeight: 850,
              textTransform: "uppercase",
            }}
          >
            Gepland · niet ingenomen
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 5,
            alignItems: "start",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {taken ? (
            <span
              style={{
                padding: "7px 9px",
                borderRadius: 9,
                background: "#dcfce7",
                color: "#166534",
                fontWeight: 850,
                whiteSpace: "nowrap",
              }}
            >
              Ingenomen ✓
            </span>
          ) : (
            <CompanionButton
              size={isMobile ? "md" : "sm"}
              variant="primary"
              fullWidth={isMobile}
              data-execution-action="supplement"
              onClick={() =>
                setExecutionModal({
                  open: true,
                  kind: "supplement",
                  item: plan,
                })
              }
            >
              Ingenomen
            </CompanionButton>
          )}
          {!isMobile && (
            <>
            <CompanionButton
              size="sm"
              onClick={() =>
                setSupplementModal({
                  open: true,
                  training:
                    sortedPlans.find(
                      (training) => training.id === plan.trainingPlanId,
                    ) || null,
                  plan,
                })
              }
            >
              Bewerk
            </CompanionButton>
            <CompanionButton
              size="sm"
              variant="danger"
              onClick={() => {
                if (window.confirm("Deze supplementplanning verwijderen?")) {
                  onDeleteSupplementPlan(plan.id);
                }
              }}
            >
              Verwijder
            </CompanionButton>
            </>
          )}
        </div>
      </div>
    );
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
                <div style={{ marginTop: 10 }}>
                  {isTrainingPlanExecuted(dailyLog, training.id) ? (
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "8px 11px",
                        borderRadius: 10,
                        background: "#dcfce7",
                        color: "#166534",
                        fontSize: 13,
                        fontWeight: 850,
                      }}
                    >
                      Uitgevoerd ✓
                    </span>
                  ) : (
                    <CompanionButton
                      variant="primary"
                      size={isMobile ? "md" : "sm"}
                      fullWidth={isMobile}
                      data-execution-action="training"
                      onClick={() =>
                        setExecutionModal({
                          open: true,
                          kind: "training",
                          item: training,
                        })
                      }
                    >
                      Als uitgevoerd registreren
                    </CompanionButton>
                  )}
                </div>
                {plansForTraining(training.id).length > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        marginBottom: 5,
                        color: "#6d28d9",
                        fontSize: 11,
                        fontWeight: 850,
                        textTransform: "uppercase",
                      }}
                    >
                      Geplande supplementen
                    </div>
                    <div style={{ display: "grid", gap: 5 }}>
                      {plansForTraining(training.id).map((plan) =>
                        renderSupplementPlan(plan),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <CompanionButton
                    size="sm"
                    onClick={() =>
                      setSupplementModal({
                        open: true,
                        training,
                        plan: null,
                      })
                    }
                  >
                    Supplement plannen
                  </CompanionButton>
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

      {unlinkedSupplements.length > 0 ? (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            border: "1px solid #ddd6fe",
            borderRadius: 12,
            background: "#faf7ff",
          }}
        >
          <div style={{ color: "#5b21b6", fontWeight: 850, fontSize: 13 }}>
            Overige geplande supplementen
          </div>
          <div style={{ marginTop: 3, color: "#64748b", fontSize: 12 }}>
            De gekoppelde training staat mogelijk op een andere dag of is
            verwijderd.
          </div>
          <div style={{ marginTop: 7 }}>
            {unlinkedSupplements
              .sort((left, right) =>
                String(left.eventTime || "").localeCompare(
                  String(right.eventTime || ""),
                ),
              )
              .map((plan) => renderSupplementPlan(plan, true))}
          </div>
        </div>
      ) : null}

      {!isMobile && (
        <>
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
          <SportSupplementPlanModal
            open={supplementModal.open}
            selectedDate={selectedDate}
            training={supplementModal.training}
            plan={supplementModal.plan}
            onClose={() =>
              setSupplementModal({ open: false, training: null, plan: null })
            }
            onSave={(values) => {
              if (supplementModal.plan) {
                onUpdateSupplementPlan(supplementModal.plan.id, values);
              } else {
                onAddSupplementPlan(values);
              }
              setSupplementModal({
                open: false,
                training: null,
                plan: null,
              });
            }}
          />
        </>
      )}
      <PlannedExecutionModal
        open={executionModal.open}
        kind={executionModal.kind}
        item={executionModal.item}
        onClose={() =>
          setExecutionModal({ open: false, kind: null, item: null })
        }
        onSave={(values) => {
          if (executionModal.kind === "training") {
            onExecuteTraining(executionModal.item, values);
          } else {
            onTakeSupplement(executionModal.item, values);
          }
          setExecutionModal({ open: false, kind: null, item: null });
        }}
      />
    </section>
  );
}
