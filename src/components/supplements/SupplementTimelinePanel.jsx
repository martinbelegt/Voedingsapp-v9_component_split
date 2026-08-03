import React, { useEffect, useMemo, useRef, useState } from "react";
import "../registration/compactEventPanel.css";

function Field({ label, optional, children }) {
  return (
    <label className="compact-event__field">
      <span>
        {label}
        {optional && <small>optioneel</small>}
      </span>
      {children}
    </label>
  );
}

export default function SupplementTimelinePanel({
  initialEventTime,
  initialValues,
  onSubmit,
  onCancel,
}) {
  const initialState = useMemo(
    () => ({
      eventTime: initialEventTime,
      values: { name: "", dosage: "", unit: "", note: "", ...initialValues },
    }),
    [initialEventTime, initialValues],
  );
  const [eventTime, setEventTime] = useState(initialState.eventTime);
  const [values, setValues] = useState(initialState.values);
  const firstInputRef = useRef(null);

  useEffect(() => {
    setEventTime(initialState.eventTime);
    setValues(initialState.values);
    window.requestAnimationFrame(() => firstInputRef.current?.focus());
  }, [initialState]);

  const update = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <section className="compact-event" data-supplement-registration>
      <div className="compact-event__heading">
        <span aria-hidden="true">💊</span>
        <div>
          <strong>Supplement op tijdlijn zetten</strong>
          <small>Pas alleen deze registratie aan.</small>
        </div>
      </div>
      <div className="compact-event__fields">
        <Field label="Supplementnaam">
          <input ref={firstInputRef} value={values.name} readOnly />
        </Field>
        <Field label="Dosering">
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={values.dosage}
            onChange={(event) => update("dosage", event.target.value)}
          />
        </Field>
        <Field label="Doseringseenheid">
          <input
            value={values.unit}
            onChange={(event) => update("unit", event.target.value)}
            placeholder="bijv. capsules"
          />
        </Field>
        <Field label="Datum en tijd">
          <input
            type="datetime-local"
            value={eventTime}
            onChange={(event) => setEventTime(event.target.value)}
          />
        </Field>
        <Field label="Notitie" optional>
          <input
            value={values.note}
            onChange={(event) => update("note", event.target.value)}
          />
        </Field>
      </div>
      <div className="compact-event__actions">
        <button type="button" onClick={onCancel}>Annuleren</button>
        <button
          type="button"
          className="is-primary"
          onClick={() => onSubmit?.({ eventTime, ...values })}
        >
          Zet op tijdlijn
        </button>
      </div>
    </section>
  );
}
