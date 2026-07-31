import React, { useState } from "react";
import { CompanionButton } from "../ui/buttons/CompanionButton";
import { CompanionNumberInput } from "../ui/inputs/CompanionInput";
import { CompanionModalShell } from "../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../ui/pickers/CompanionDateTimePicker";
import {
  parseWeightKg,
  validateWeightKg,
} from "../services/weightEventService";

const BOWEL_COLOR_OPTIONS = [
  {
    value: "",
    label: "Kleur niet ingevuld",
    info: "",
  },
  {
    value: "dark_brown",
    label: "🟤 Donkerbruin",
    info: "Meestal normale kleur.",
  },
  {
    value: "brown",
    label: "🟫 Bruin",
    info: "Normale kleur van ontlasting.",
  },
  {
    value: "light_brown",
    label: "🟨 Lichtbruin",
    info: "Kan normaal zijn, maar let op veranderingen in combinatie met vet, geur of consistentie.",
  },
  {
    value: "yellow",
    label: "🟡 Geel",
    info: "Kan passen bij snelle passage of vetmalabsorptie. Let op vet/glans, geur en Creon-dosering.",
  },
  {
    value: "green",
    label: "🟢 Groen",
    info: "Kan komen door voeding, supplementen of snelle darmpassage.",
  },
  {
    value: "grey",
    label: "⚪ Grijs / kleikleurig",
    info: "Kan wijzen op gal-/leverproblemen. Bij aanhouden of klachten: arts raadplegen.",
  },
  {
    value: "black",
    label: "⚫ Zwart",
    info: "Kan onschuldig zijn door voeding/ijzer, maar kan ook bloedverlies betekenen. Bij twijfel: arts raadplegen.",
  },
  {
    value: "red",
    label: "🔴 Rood",
    info: "Kan door voeding komen, maar ook door bloed. Bij twijfel of aanhouden: arts raadplegen.",
  },
];

function getBowelColorInfo(value) {
  return BOWEL_COLOR_OPTIONS.find((opt) => opt.value === value)?.info || "";
}

export function DailyEventEditModal({
  eventType,
  event,
  onClose,
  onSave,
  onDelete,
}) {
  const [eventTime, setEventTime] = useState(
    event?.eventTime?.slice(0, 16) || "",
  );

  const [alarmAt, setAlarmAt] = useState(
    event?.alarmAt
      ? event.alarmAt.slice(0, 16)
      : event?.eventTime
        ? event.eventTime.slice(0, 16)
        : new Date().toISOString().slice(0, 16),
  );

  const [value1, setValue1] = useState(
    eventType === "insulin"
      ? event?.units || ""
      : eventType === "glucose"
        ? event?.glucoseValue || ""
        : eventType === "weight"
          ? String(event?.valueKg ?? "").replace(".", ",")
        : eventType === "glucoseBoost"
          ? event?.kh || ""
        : eventType === "movement"
          ? event?.activityType || ""
        : eventType === "supplement"
          ? event?.name || ""
        : eventType === "note"
          ? event?.note || ""
          : eventType === "bowel"
            ? ["1", "2", "3", "4", "5", "6", "7"].includes(
                String(event?.bristolScore),
              )
              ? String(event.bristolScore)
              : "4"
            : "",
  );

  const [note, setNote] = useState(
    eventType === "note" ? event?.context || "" : event?.note || "",
  );

  const [alarmEnabled, setAlarmEnabled] = useState(
    Boolean(event?.alarmEnabled),
  );

  const [bowelColor, setBowelColor] = useState(event?.bowelColor || "");

  const isGlucose = eventType === "glucose";
  const isInsulin = eventType === "insulin";
  const isBowel = eventType === "bowel";
  const isWeight = eventType === "weight";

  const footerStart = (
    <CompanionButton
      variant="danger"
      onClick={() => {
        const ok = window.confirm("Dit moment verwijderen?");
        if (!ok) return;
        onDelete(event.id);
        onClose();
      }}
    >
      Verwijder
    </CompanionButton>
  );
  const [value2, setValue2] = useState(
    eventType === "glucoseBoost"
      ? event?.source || ""
      : eventType === "movement"
        ? event?.intensityType || ""
        : eventType === "supplement"
          ? event?.dosage || ""
          : "",
  );
  const [value3, setValue3] = useState(
    eventType === "movement" ? event?.durationMinutes || "" : "",
  );

  const footer = (
    <>
      <CompanionButton variant="secondary" onClick={onClose}>
        Annuleer
      </CompanionButton>

      <CompanionButton
        variant="primary"
        onClick={() => {
          if (isWeight) {
            const error = validateWeightKg(value1);
            if (error) {
              window.alert(error);
              return;
            }
          }
          onSave(event.id, {
            eventTime,
            ...(isInsulin ? { units: value1 } : {}),
            ...(isGlucose ? { glucoseValue: value1 } : {}),
            ...(isWeight ? { valueKg: parseWeightKg(value1) } : {}),
            ...(eventType === "glucoseBoost"
              ? { kh: value1, source: value2 }
              : {}),
            ...(eventType === "movement"
              ? {
                  activityType: value1,
                  intensityType: value2,
                  durationMinutes: value3,
                }
              : {}),
            ...(eventType === "supplement"
              ? { name: value1, dosage: value2 }
              : {}),
            ...(isBowel ? { bristolScore: value1, bowelColor } : {}),
            ...(eventType === "note" ? { note: value1 } : {}),
            ...(eventType === "note" ? { context: note } : { note }),
            ...(eventType === "note"
              ? {
                  alarmEnabled,
                  alarmAt: alarmEnabled ? alarmAt : null,
                }
              : {}),
          });

          onClose();
        }}
      >
        Opslaan
      </CompanionButton>
    </>
  );

  return (
    <CompanionModalShell
      open
      onClose={onClose}
      title="Moment wijzigen"
      size="sm"
      footerStart={footerStart}
      footer={footer}
    >
        <CompanionDateTimePicker
          value={eventTime}
          onChange={setEventTime}
          mode="datetime"
          label="Datum en tijd"
          compact
          contextItems={[]}
        />

        <label style={{ fontSize: 13, fontWeight: 800 }}>
          {isInsulin
            ? "Aantal eenheden"
            : isGlucose
              ? "Glucosewaarde"
              : isWeight
                ? "Gewicht (kg)"
              : isBowel
                ? "Bristol-score"
                : eventType === "movement"
                  ? "Type beweging"
                  : eventType === "supplement"
                    ? "Naam"
                    : eventType === "glucoseBoost"
                      ? "Snelle koolhydraten (gram)"
                : eventType === "note"
                  ? "Notitie"
                  : "Waarde"}
        </label>

        {isBowel ? (
          <select
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 16,
              padding: "10px 11px",
              marginTop: 4,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
            }}
          >
            <option value="1">1 - keutels / zeer hard</option>
            <option value="2">2 - klonterig / hard</option>
            <option value="3">3 - worstvormig met scheurtjes</option>
            <option value="4">4 - glad / ideaal</option>
            <option value="5">5 - zacht</option>
            <option value="6">6 - brijig</option>
            <option value="7">7 - waterdun</option>
          </select>
        ) : isInsulin || isGlucose ? (
          <CompanionNumberInput
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 16,
              padding: "10px 11px",
              marginTop: 4,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
            }}
          />
        ) : (
          <input
            inputMode={isWeight ? "decimal" : undefined}
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 16,
              padding: "10px 11px",
              marginTop: 4,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
            }}
          />
        )}

        {(eventType === "glucoseBoost" ||
          eventType === "movement" ||
          eventType === "supplement") && (
          <>
            <label style={{ fontSize: 13, fontWeight: 800 }}>
              {eventType === "glucoseBoost"
                ? "Bron"
                : eventType === "movement"
                  ? "Belasting"
                  : "Dosering"}
            </label>
            <input
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontSize: 16,
                padding: "10px 11px",
                marginTop: 4,
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            />
          </>
        )}

        {eventType === "movement" && (
          <>
            <label style={{ fontSize: 13, fontWeight: 800 }}>
              Duur (minuten)
            </label>
            <CompanionNumberInput
              decimal={false}
              value={value3}
              onChange={(e) => setValue3(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontSize: 16,
                padding: "10px 11px",
                marginTop: 4,
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            />
          </>
        )}

        {isBowel && (
          <>
            <label style={{ fontSize: 13, fontWeight: 800 }}>
              Kleur ontlasting
            </label>

            <select
              value={bowelColor}
              onChange={(e) => setBowelColor(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                fontSize: 16,
                padding: "10px 11px",
                marginTop: 4,
                marginBottom: 8,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
              }}
            >
              {BOWEL_COLOR_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {getBowelColorInfo(bowelColor) && (
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.35,
                  color: "#334155",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 10,
                }}
              >
                {getBowelColorInfo(bowelColor)}
              </div>
            )}
          </>
        )}

        <label style={{ fontSize: 13, fontWeight: 800 }}>
          {eventType === "note" ? "Context" : "Notitie"}
        </label>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontSize: 16,
            padding: "10px 11px",
            marginTop: 4,
            marginBottom: 14,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
          }}
        />

        {eventType === "note" && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              fontSize: 13,
              fontWeight: 800,
              color: "#334155",
            }}
          >
            <input
              type="checkbox"
              checked={alarmEnabled}
              onChange={(e) => setAlarmEnabled(e.target.checked)}
            />
            🔔 Alarm actief op tijdstip van deze notitie
          </label>
        )}

        {eventType === "note" && alarmEnabled && (
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                marginBottom: 4,
                fontSize: 13,
                fontWeight: 800,
                color: "#334155",
              }}
            >
              Alarmtijd
            </label>

            <CompanionDateTimePicker
              value={alarmAt}
              onChange={setAlarmAt}
              mode="datetime"
              label="Alarmtijd"
              compact
              contextItems={[]}
            />
          </div>
        )}
    </CompanionModalShell>
  );
}
