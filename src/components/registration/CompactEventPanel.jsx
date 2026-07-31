import React, { useEffect, useMemo, useRef, useState } from "react";
import { term } from "../../config/terminology";
import {
  parseWeightKg,
  validateWeightKg,
} from "../../services/weightEventService";
import "./compactEventPanel.css";

const BOWEL_COLOR_OPTIONS = [
  { value: "", label: "Kleur niet ingevuld" },
  { value: "dark_brown", label: "Donkerbruin" },
  { value: "brown", label: "Bruin" },
  { value: "light_brown", label: "Lichtbruin" },
  { value: "yellow", label: "Geel" },
  { value: "green", label: "Groen" },
  { value: "grey", label: "Grijs" },
  { value: "black", label: "Zwart" },
  { value: "red", label: "Rood" },
];

const EVENT_CONFIG = {
  glucose: {
    icon: "\u{1FA78}",
    title: term("glucose", "register"),
    initialValues: () => ({ value: "", context: "", note: "" }),
    validate: (values) => {
      const errors = {};
      if (values.value === "") errors.value = "Vul een glucosewaarde in.";
      else if (Number(values.value) <= 0)
        errors.value = "Glucose moet groter zijn dan 0.";
      return errors;
    },
  },
  insulin: {
    icon: "\u{1F489}",
    title: term("insulin", "register"),
    initialValues: () => ({
      units: "",
      insulinType: "Novorapid",
      note: "",
    }),
    validate: (values) => {
      const errors = {};
      if (values.units === "") errors.units = "Vul het aantal eenheden in.";
      else if (Number(values.units) <= 0)
        errors.units = "Het aantal eenheden moet groter zijn dan 0.";
      if (!values.insulinType) errors.insulinType = "Kies een soort insuline.";
      return errors;
    },
  },
  medicine: {
    icon: "\u{1F48A}",
    title: term("medication", "register"),
    initialValues: () => ({
      name: "",
      dosage: "",
      note: "",
      repeat: "none",
    }),
    validate: () => ({}),
  },
  supplement: {
    icon: "\u{1F48A}",
    title: "Supplement op tijdlijn zetten",
    initialValues: () => ({
      name: "",
      dosage: "",
      unit: "",
      note: "",
    }),
    validate: (values) => {
      const errors = {};
      if (!values.name?.trim()) errors.name = "Vul een supplementnaam in.";
      if (values.dosage !== "" && Number(values.dosage) < 0) {
        errors.dosage = "Dosering mag niet negatief zijn.";
      }
      return errors;
    },
  },
  weight: {
    icon: "\u2696\uFE0F",
    title: term("weight", "register"),
    initialValues: () => ({ weight: "", note: "" }),
    validate: (values) => {
      const error = validateWeightKg(values.weight);
      return error ? { weight: error } : {};
    },
    normalize: (values) => ({
      ...values,
      valueKg: parseWeightKg(values.weight),
    }),
  },
  movement: {
    icon: "\u{1F6B6}",
    title: "Beweging registreren",
    initialValues: () => ({
      activityType: "",
      durationMinutes: "",
      intensityType: "",
      note: "",
      repeat: "none",
    }),
    validate: () => ({}),
  },
  bowel: {
    icon: "\u{1F6BD}",
    title: "Stoelgang registreren",
    initialValues: () => ({
      bristolScore: "4",
      bowelColor: "brown",
      urgency: "",
      note: "",
    }),
    validate: () => ({}),
  },
  note: {
    icon: "\u{1F4DD}",
    title: term("note", "register"),
    initialValues: () => ({ note: "", context: "" }),
    validate: () => ({}),
  },
};

function localDateTimeValue(selectedDate) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${selectedDate || now.toISOString().slice(0, 10)}T${hours}:${minutes}`;
}

function Field({ label, error, optional, children, wide = false }) {
  return (
    <label className={`compact-event__field${wide ? " is-wide" : ""}`}>
      <span>
        {label}
        {optional && <small>optioneel</small>}
      </span>
      {children}
      {error && <em>{error}</em>}
    </label>
  );
}

export function CompactEventPanel({
  moduleId,
  selectedDate,
  initialValues,
  initialEventTime,
  onSubmit,
  onCancel,
  onDirtyChange,
  discardPrompt = false,
  onKeepEditing,
  onDiscard,
}) {
  const config = EVENT_CONFIG[moduleId];
  const firstInputRef = useRef(null);
  const initialState = useMemo(
    () => ({
      eventTime: initialEventTime || localDateTimeValue(selectedDate),
      values: {
        ...(config?.initialValues() || {}),
        ...(initialValues || {}),
      },
    }),
    [config, initialEventTime, initialValues, selectedDate],
  );
  const [eventTime, setEventTime] = useState(initialState.eventTime);
  const [values, setValues] = useState(initialState.values);
  const [errors, setErrors] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const dirty =
    JSON.stringify({ eventTime, values }) !== JSON.stringify(initialState);

  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    setEventTime(initialState.eventTime);
    setValues(initialState.values);
    setErrors({});
    setShowMore(false);
    setShowDiscardWarning(false);
    window.requestAnimationFrame(() => firstInputRef.current?.focus());
  }, [initialState]);

  if (!config) return null;

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function requestCancel() {
    if (dirty) {
      setShowDiscardWarning(true);
      return;
    }
    onCancel?.();
  }

  function submit() {
    const nextErrors = config.validate(values);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSubmit?.({
      moduleId,
      eventTime,
      ...(config.normalize ? config.normalize(values) : values),
    });
  }

  function renderFields() {
    if (moduleId === "glucose") {
      return (
        <>
          <Field label="Glucosewaarde (mmol/L)" error={errors.value}>
            <input
              ref={firstInputRef}
              type="number"
              min="0.1"
              step="0.1"
              inputMode="decimal"
              value={values.value}
              onChange={(event) => update("value", event.target.value)}
              placeholder="bijv. 7,8"
            />
          </Field>
          <Field label="Context" optional>
            <input
              value={values.context}
              onChange={(event) => update("context", event.target.value)}
              placeholder="bijv. nuchter"
            />
          </Field>
          <Field label="Notitie" optional wide>
            <input
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
        </>
      );
    }

    if (moduleId === "insulin") {
      return (
        <>
          <Field label="Eenheden" error={errors.units}>
            <input
              ref={firstInputRef}
              type="number"
              min="0.1"
              step="0.1"
              inputMode="decimal"
              value={values.units}
              onChange={(event) => update("units", event.target.value)}
              placeholder="bijv. 4"
            />
          </Field>
          <Field label="Soort" error={errors.insulinType}>
            <select
              value={values.insulinType}
              onChange={(event) => update("insulinType", event.target.value)}
            >
              <option value="Novorapid">Novorapid</option>
              <option value="Tresiba">Tresiba</option>
              <option value="Anders">Anders</option>
            </select>
          </Field>
          <Field label="Notitie" optional wide>
            <input
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
        </>
      );
    }

    if (moduleId === "medicine") {
      return (
        <>
          <Field label="Naam">
            <input
              ref={firstInputRef}
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="bijv. Creon 25.000"
            />
          </Field>
          <Field label="Dosering">
            <input
              value={values.dosage}
              onChange={(event) => update("dosage", event.target.value)}
              placeholder="bijv. 2 capsules"
            />
          </Field>
          <Field label="Herhalen">
            <select
              value={values.repeat}
              onChange={(event) => update("repeat", event.target.value)}
            >
              <option value="none">Niet herhalen</option>
              <option value="daily">Dagelijks</option>
            </select>
          </Field>
          <Field label="Notitie" optional>
            <input
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
        </>
      );
    }

    if (moduleId === "supplement") {
      return (
        <>
          <Field label="Supplementnaam" error={errors.name}>
            <input
              ref={firstInputRef}
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </Field>
          <Field label="Dosering" error={errors.dosage}>
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
          <Field label="Notitie" optional>
            <input
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
        </>
      );
    }

    if (moduleId === "weight") {
      return (
        <>
          <Field label="Gewicht (kg)" error={errors.weight} wide>
            <input
              ref={firstInputRef}
              type="text"
              inputMode="decimal"
              value={values.weight}
              onChange={(event) => update("weight", event.target.value)}
              placeholder="bijv. 78,4"
            />
          </Field>
        </>
      );
    }

    if (moduleId === "movement") {
      return (
        <>
          <Field label="Soort beweging">
            <input
              ref={firstInputRef}
              value={values.activityType}
              onChange={(event) => update("activityType", event.target.value)}
              placeholder="bijv. wandelen of fietsen"
            />
          </Field>
          <Field label="Duur (minuten)">
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={values.durationMinutes}
              onChange={(event) =>
                update("durationMinutes", event.target.value)
              }
              placeholder="bijv. 30"
            />
          </Field>
          <Field label="Intensiteit" optional>
            <input
              value={values.intensityType}
              onChange={(event) => update("intensityType", event.target.value)}
              placeholder="bijv. rustig of stevig"
            />
          </Field>
          <Field label="Notitie" optional>
            <input
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
          <Field label="Herhalen">
            <select
              value={values.repeat}
              onChange={(event) => update("repeat", event.target.value)}
            >
              <option value="none">Niet herhalen</option>
              <option value="daily">Dagelijks</option>
            </select>
          </Field>
        </>
      );
    }

    if (moduleId === "bowel") {
      return (
        <>
          <Field label="Bristol-score">
            <select
              ref={firstInputRef}
              value={values.bristolScore}
              onChange={(event) => update("bristolScore", event.target.value)}
            >
              <option value="1">1 - keutels / zeer hard</option>
              <option value="2">2 - klonterig / hard</option>
              <option value="3">3 - worstvormig met scheurtjes</option>
              <option value="4">4 - glad / ideaal</option>
              <option value="5">5 - zacht</option>
              <option value="6">6 - brijig</option>
              <option value="7">7 - waterdun</option>
            </select>
          </Field>
          <Field label="Kleur">
            <select
              value={values.bowelColor}
              onChange={(event) => update("bowelColor", event.target.value)}
            >
              {BOWEL_COLOR_OPTIONS.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Urgentie" optional>
            <input
              value={values.urgency}
              onChange={(event) => update("urgency", event.target.value)}
            />
          </Field>
          <Field label="Notitie" optional>
            <input
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
        </>
      );
    }

    if (moduleId === "note") {
      return (
        <>
          <Field label="Notitie" wide>
            <textarea
              ref={firstInputRef}
              rows="2"
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Wat wil je vastleggen?"
            />
          </Field>
          <Field label="Context" optional wide>
            <input
              value={values.context}
              onChange={(event) => update("context", event.target.value)}
            />
          </Field>
        </>
      );
    }

    return null;
  }

  return (
    <section
      className="compact-event"
      aria-label={config.title}
      data-compact-event={moduleId}
    >
      <header className="compact-event__header">
        <span aria-hidden="true">{config.icon}</span>
        <h2>{config.title}</h2>
      </header>

      {(showDiscardWarning || discardPrompt) && (
        <div className="compact-event__warning" role="alert">
          <span>Je hebt niet-opgeslagen wijzigingen.</span>
          <div>
            <button
              type="button"
              onClick={() => {
                setShowDiscardWarning(false);
                onKeepEditing?.();
              }}
            >
              Doorgaan met invoeren
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDiscardWarning(false);
                if (discardPrompt) onDiscard?.();
                else onCancel?.();
              }}
            >
              Wijzigingen weggooien
            </button>
          </div>
        </div>
      )}

      <div className="compact-event__grid">
        {renderFields()}
        <Field label="Datum en tijd" wide>
          <input
            type="datetime-local"
            value={eventTime}
            onChange={(event) => setEventTime(event.target.value)}
          />
        </Field>
      </div>

      {moduleId === "weight" && (
        <>
          <button
            type="button"
            className="compact-event__more"
            aria-expanded={showMore}
            onClick={() => setShowMore((current) => !current)}
          >
            Meer opties {showMore ? "▲" : "▼"}
          </button>
          {showMore && (
            <div className="compact-event__grid compact-event__more-fields">
              <Field label="Notitie" optional wide>
                <input
                  value={values.note}
                  onChange={(event) => update("note", event.target.value)}
                />
              </Field>
            </div>
          )}
        </>
      )}

      <footer className="compact-event__actions">
        <button type="button" onClick={requestCancel}>
          Annuleren
        </button>
        <button
          type="button"
          className="is-primary"
          onClick={submit}
        >
          Zet op tijdlijn
        </button>
      </footer>
    </section>
  );
}

export default CompactEventPanel;
