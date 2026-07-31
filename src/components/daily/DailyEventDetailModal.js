import React from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { term } from "../../config/terminology";
import { formatWeightKg } from "../../services/weightEventService";

const TYPE_LABELS = {
  insulin: term("insulin"),
  glucose: term("glucose"),
  glucoseBoost: "Glucoseboost",
  movement: term("movement"),
  weight: term("weight"),
  supplement: term("supplement"),
  bowel: "Stoelgang",
  note: term("note"),
};

function detailsFor(type, event) {
  const values = {
    insulin: [
      ["Soort", event.insulinType],
      ["Eenheden", event.units],
      ["Notitie", event.note],
    ],
    glucose: [
      ["Waarde", event.glucoseValue ? `${event.glucoseValue} mmol/L` : ""],
      ["Notitie", event.note],
    ],
    glucoseBoost: [
      ["Snelle koolhydraten", event.kh ? `${event.kh} g` : ""],
      ["Bron", event.source],
      ["Notitie", event.note],
    ],
    movement: [
      ["Type", event.activityType],
      ["Belasting", event.intensityType],
      ["Duur", event.durationMinutes ? `${event.durationMinutes} min` : ""],
      ["Notitie", event.note],
    ],
    weight: [
      ["Gewicht", event.valueKg ? `${formatWeightKg(event.valueKg)} kg` : ""],
      ["Notitie", event.note],
    ],
    supplement: [
      ["Categorie", event.intakeType === "medication" ? term("medication") : term("supplement")],
      ["Naam", event.name],
      ["Dosering", event.dosage || [event.amount, event.unit].filter(Boolean).join(" ")],
      ["Notitie", event.note],
    ],
    bowel: [
      ["Bristol-score", event.bristolScore],
      ["Urgentie", event.urgency],
      ["Notitie", event.note],
    ],
    note: [
      ["Notitie", event.note],
      ["Context", event.context],
      ["Alarm", event.alarmEnabled ? "Actief" : "Niet actief"],
    ],
  };
  return (values[type] || []).filter(([, value]) => value !== "" && value != null);
}

export function DailyEventDetailModal({
  open,
  type,
  event,
  onClose,
  onEdit,
  onDelete,
  onExecute,
  executed = false,
}) {
  if (!event) return null;
  const dateTime = new Date(event.eventTime).toLocaleString("nl-NL", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title={TYPE_LABELS[type] || "Tijdlijnmoment"}
      subtitle={dateTime}
      size="sm"
      footerStart={
        <CompanionButton variant="danger" onClick={onDelete}>
          Verwijderen
        </CompanionButton>
      }
      footer={
        <>
          <CompanionButton onClick={onClose}>Sluiten</CompanionButton>
          {onExecute && !executed ? (
            <CompanionButton onClick={onExecute}>
              Als ingenomen registreren
            </CompanionButton>
          ) : null}
          <CompanionButton variant="primary" onClick={onEdit}>
            Wijzigen
          </CompanionButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 10 }}>
        {detailsFor(type, event).map(([label, value]) => (
          <div key={label}>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>
              {label}
            </div>
            <div style={{ marginTop: 2, whiteSpace: "pre-wrap" }}>{value}</div>
          </div>
        ))}
      </div>
    </CompanionModalShell>
  );
}
