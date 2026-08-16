import React from "react";
import { EXERCISE_BODY_REGIONS, EXERCISE_SIDES } from "../../data/exercises";
import { buildExerciseSourceMomentUrl } from "../../services/exerciseSourceService";
import "./exerciseDetailEditor.css";

function Field({ label, children }) {
  return <label className="exercise-detail-editor__field"><span>{label}</span>{children}</label>;
}

export default function ExerciseDetailEditor({ draft, categories, onChange, onSave, onCancel, onDelete }) {
  const set = (key, value) => onChange({ ...draft, [key]: value });
  const steps = Array.isArray(draft.instructions) ? draft.instructions : [];
  return <>
    <div className="catalog-framework__back-row"><button type="button" onClick={onCancel}>← Terug naar lijst</button></div>
    <header><div><span>Oefeningeditor</span><h2>🏋️ {draft.name || "Nieuwe oefening"}</h2></div></header>
    <div className="exercise-detail-editor__form">
      <Field label="Naam"><input value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Categorie"><select value={draft.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Lichaamsregio"><select value={draft.bodyRegion} onChange={(e) => set("bodyRegion", e.target.value)}>{EXERCISE_BODY_REGIONS.map((v) => <option key={v}>{v}</option>)}</select></Field>
      <Field label="Zijde"><select value={draft.side} onChange={(e) => set("side", e.target.value)}>{EXERCISE_SIDES.map((v) => <option key={v}>{v}</option>)}</select></Field>
      {[["goal","Doel"],["equipment","Materiaal"],["source","Bronnaam"],["sourceUrl","Bron-URL"]].map(([key,label]) => <Field key={key} label={label}><input type={key === "sourceUrl" ? "url" : "text"} value={draft[key]} onChange={(e) => set(key, e.target.value)} /></Field>)}
      <Field label="Videotimestamp">
        <input value={draft.sourceTimestamp} onChange={(e) => set("sourceTimestamp", e.target.value)} />
        {buildExerciseSourceMomentUrl(draft.sourceUrl, draft.sourceTimestamp) && <a href={buildExerciseSourceMomentUrl(draft.sourceUrl, draft.sourceTimestamp)} target="_blank" rel="noreferrer">Open bron op het gekozen moment ↗</a>}
      </Field>
      <Field label="Bronadvies"><textarea rows="4" value={draft.sourceDosage} onChange={(e) => set("sourceDosage", e.target.value)} /></Field>
      <Field label="Persoonlijke dosering"><textarea rows="4" value={draft.personalDosage} onChange={(e) => set("personalDosage", e.target.value)} /></Field>
      <Field label="Uitvoering (één stap per regel)"><textarea rows="7" value={steps.join("\n")} onChange={(e) => set("instructions", e.target.value.split(/\r?\n/))} /></Field>
      {[["painRule","Pijnregel"],["progression","Progressie"],["regression","Regressie"],["notes","Notities"]].map(([key,label]) => <Field key={key} label={label}><textarea rows="4" value={draft[key]} onChange={(e) => set(key, e.target.value)} /></Field>)}
    </div>
    <div className="catalog-framework__editor-actions exercise-detail-editor__actions"><button type="button" onClick={onCancel}>Annuleren</button>{onDelete && <button type="button" className="is-danger" onClick={onDelete}>Verwijderen</button>}<button type="button" className="is-save" disabled={!draft.name.trim()} onClick={onSave}>Wijzigingen bewaren</button></div>
  </>;
}
