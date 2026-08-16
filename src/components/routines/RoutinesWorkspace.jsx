import React, { useMemo, useState } from "react";
import { resolveRoutineItem } from "../../services/routineService";
import "./routinesWorkspace.css";

const TYPE_LABELS = { food: "Voeding", supplement: "Supplement", medication: "Medicatie", exercise: "Oefening", note: "Notitie" };

function formatLastExecution(routineId, dailyLog) {
  const dates = dailyLog.flatMap((day) => [
    ...(day.meals || []),
    ...(day.supplementEvents || []),
  ]).filter((event) => event.routineExecution?.routineId === routineId)
    .map((event) => event.eatenAt || event.eventTime)
    .filter(Boolean)
    .sort((a, b) => String(b).localeCompare(String(a)));
  if (!dates.length) return "Nog niet uitgevoerd";
  return new Date(dates[0]).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function RoutinesWorkspace({ routines, products, supplements, exercises = [], dailyLog = [], onUpdateRoutine, onDeleteRoutine, onRegister }) {
  const [executingId, setExecutingId] = useState(null);
  const [checkedIds, setCheckedIds] = useState([]);
  const [message, setMessage] = useState("");
  const executing = routines.find(({ id }) => id === executingId) || null;
  const catalogs = useMemo(() => ({ products, supplements, exercises }), [products, supplements, exercises]);
  const resolvedItems = useMemo(() => (executing?.items || []).map((item) => ({ item, resolved: resolveRoutineItem(item, catalogs) })), [executing, catalogs]);

  function openChecklist(routine) {
    const available = routine.items.filter((item) => resolveRoutineItem(item, catalogs)).map(({ id }) => id);
    setCheckedIds(available);
    setExecutingId(routine.id);
    setMessage("");
  }

  function putOnTimeline() {
    const count = onRegister(executing, checkedIds);
    setExecutingId(null);
    setMessage(count ? `${executing.name} is met ${count} onderdelen op de tijdlijn gezet.` : "Niets op de tijdlijn gezet.");
  }

  return (
    <main className="routines-workspace routines-workspace--compact">
      <header className="routines-heading">
        <div><span>Uitvoeren · plannen · beheren · bekijken</span><h1>Mijn routines</h1><p>Persoonlijke gezondheidsgewoonten die je bewust op de tijdlijn zet.</p></div>
      </header>
      {message && <div className="routine-message" role="status">{message}</div>}

      {executing ? (
        <section className="routine-editor routine-checklist">
          <button type="button" className="routine-back" onClick={() => setExecutingId(null)}>← Terug naar routines</button>
          <span>Routine uitvoeren</span>
          <h2>{executing.icon} {executing.name}</h2>
          <p>Controleer wat je nu daadwerkelijk uitvoert. Alleen aangevinkte onderdelen komen op de tijdlijn.</p>
          <div className="routine-checklist__items">
            {resolvedItems.map(({ item, resolved }) => (
              <label key={item.id} className={!resolved ? "is-missing" : ""}>
                <input type="checkbox" disabled={!resolved} checked={checkedIds.includes(item.id)} onChange={() => setCheckedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} />
                <span><strong>{resolved?.label || "Catalogusitem niet meer beschikbaar"}</strong><small>{TYPE_LABELS[item.type]}</small></span>
              </label>
            ))}
          </div>
          <button type="button" className="routine-primary" disabled={!checkedIds.length} onClick={putOnTimeline}>Zet op tijdlijn</button>
        </section>
      ) : routines.length ? (
        <section className="routine-overview" aria-label="Routines">
          {routines.map((routine) => (
            <article className="routine-overview-card" key={routine.id} style={{ "--routine-color": routine.color }}>
              <div className="routine-overview-card__icon">{routine.icon}</div>
              <div className="routine-overview-card__body">
                <h2>{routine.name}</h2>
                {routine.description && <p>{routine.description}</p>}
                <div className="routine-overview-card__meta">
                  <span>🕒 {routine.startTime || "Geen vaste tijd"}</span>
                  <span>{routine.items.length} onderdelen</span>
                  <span>Laatst: {formatLastExecution(routine.id, dailyLog)}</span>
                </div>
              </div>
              <div className="routine-overview-card__actions">
                <button type="button" className="routine-primary" disabled={!routine.items.length} onClick={() => openChecklist(routine)}>Zet op tijdlijn</button>
                <label>Tijd<input type="time" value={routine.startTime || ""} onChange={(event) => onUpdateRoutine(routine.id, { startTime: event.target.value })} /></label>
                <button type="button" className="routine-danger" onClick={() => { if (window.confirm("Deze routine verwijderen?")) onDeleteRoutine(routine.id); }}>Verwijderen</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="routine-empty-state"><span>📚</span><h2>Nog geen routines</h2><p>Maak een routine vanuit Mijn catalogi. Daar kies je de bouwstenen; hier voer je de routine uit.</p></section>
      )}
    </main>
  );
}
