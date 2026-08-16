import React from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { term } from "../../config/terminology";
import { formatWeightKg } from "../../services/weightEventService";
import { buildExerciseSourceMomentUrl } from "../../services/exerciseSourceService";

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
      ["Naam", event.supplementName || event.name],
      ["Dosering", [event.dosage || event.amount, event.unit].filter(Boolean).join(" ")],
      ["Merk / product", [event.brand, event.productName].filter(Boolean).join(" · ")],
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
  exercise = null,
  onOpenExercise,
}) {
  if (!event) return null;
  const dateTime = new Date(event.eventTime).toLocaleString("nl-NL", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const catalogExercise = type === "movement" && event.exerciseId ? exercise : null;
  const sourceUrl = catalogExercise ? buildExerciseSourceMomentUrl(catalogExercise.sourceUrl, catalogExercise.sourceTimestamp) : "";

  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title={catalogExercise?.name || TYPE_LABELS[type] || "Tijdlijnmoment"}
      subtitle={dateTime}
      size="sm"
      footerStart={catalogExercise ? null :
        <CompanionButton variant="danger" onClick={onDelete}>
          Verwijderen
        </CompanionButton>
      }
      footer={catalogExercise ? <>
        <CompanionButton variant="danger" onClick={onDelete}>Verwijderen</CompanionButton>
        <CompanionButton onClick={onClose}>Sluiten</CompanionButton>
      </> :
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
      {catalogExercise ? <div className="exercise-timeline-detail" style={{ display: "grid", gap: 12 }}>
        {event.personalDosage && <div><div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>Persoonlijke dosering</div><div>{event.personalDosage}</div></div>}
        {event.side && <div><div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>Zijde</div><div>{event.side}</div></div>}
        {catalogExercise.instructions?.length > 0 && <div><div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>Uitvoering</div><ol style={{ margin: "7px 0 0", paddingLeft: 22, display: "grid", gap: 8 }}>{catalogExercise.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol></div>}
        {catalogExercise.painRule && <div><div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>Pijnregel</div><div style={{ marginTop: 2, whiteSpace: "pre-wrap" }}>{catalogExercise.painRule}</div></div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#7a3522", fontWeight: 800 }}>Open bronvideo</a>}
          <button type="button" onClick={() => onOpenExercise?.(event.exerciseId)} style={{ border: 0, padding: 0, background: "transparent", color: "#355c3c", font: "inherit", fontWeight: 800, cursor: "pointer" }}>Ga naar volledige omschrijving</button>
        </div>
      </div> : <div style={{ display: "grid", gap: 10 }}>
        {detailsFor(type, event).map(([label, value]) => (
          <div key={label}>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>
              {label}
            </div>
            <div style={{ marginTop: 2, whiteSpace: "pre-wrap" }}>{value}</div>
          </div>
        ))}
      </div>}
    </CompanionModalShell>
  );
}
