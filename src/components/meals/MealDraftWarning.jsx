import React from "react";
import "./mealDraftWarning.css";

export default function MealDraftWarning({ onContinue, onDiscard }) {
  return <div className="meal-draft-warning" role="dialog" aria-modal="true" aria-labelledby="meal-draft-warning-title"><div><span>Niet opgeslagen</span><h2 id="meal-draft-warning-title">Je maaltijd is nog niet opgeslagen.</h2><p>Ga terug naar je maaltijd of gooi de niet-opgeslagen wijzigingen bewust weg.</p><div><button type="button" onClick={onContinue}>Doorgaan met maaltijd</button><button type="button" className="is-danger" onClick={onDiscard}>Concept verwijderen</button></div></div></div>;
}
