import React from "react";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";

export default function ExerciseImportModal({ open, result, onClose, onConfirm, onImportAsNew }) {
  if (!open) return null;
  const { candidate, validation, duplicate, unknownCategory } = result || {};
  return <CompanionModalShell
    open={open}
    onClose={onClose}
    title="Oefening importeren"
    subtitle="Controleer de oefening voordat deze wordt toegevoegd."
    footerStart={duplicate ? <div style={{ color: "#92400e", fontSize: 13 }}>Deze oefening lijkt al te bestaan ({duplicate.type === "id" ? "zelfde id" : "zelfde naam"}).</div> : null}
    footer={[
      <button key="cancel" type="button" onClick={onClose}>Annuleren</button>,
      duplicate
        ? <button key="new" type="button" className="is-primary" disabled={!validation?.valid} onClick={onImportAsNew}>Als nieuwe oefening importeren</button>
        : <button key="confirm" type="button" className="is-primary" disabled={!validation?.valid} onClick={onConfirm}>Oefening importeren</button>,
    ]}
  >
    {candidate && <div style={{ display: "grid", gap: 10 }}>
      <div><strong>Naam</strong><div>{candidate.name || "–"}</div></div>
      <div><strong>Categorie</strong><div>{candidate.category}</div></div>
      <div><strong>Uitvoering</strong><ol>{candidate.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol></div>
      {unknownCategory && <div style={{ color: "#92400e" }}>Onbekende categorie “{unknownCategory}” wordt als Overig geïmporteerd.</div>}
      {!validation?.valid && <div style={{ color: "#b42318" }}>{Object.values(validation.errors).join(" ")}</div>}
    </div>}
  </CompanionModalShell>;
}
