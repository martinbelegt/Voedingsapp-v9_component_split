import React, { useState } from "react";
import { CompanionButton } from "../../ui/buttons/CompanionButton";
import { CompanionNumberInput } from "../../ui/inputs/CompanionInput";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

const BOWEL_COLOR_OPTIONS = [
  {
    value: "",
    label: "Kleur niet ingevuld",
  },
  {
    value: "dark_brown",
    label: "🟤 Donkerbruin - meestal normaal",
  },
  {
    value: "brown",
    label: "🟫 Bruin - normale kleur",
  },
  {
    value: "light_brown",
    label: "🟨 Lichtbruin - meestal normaal, let op veranderingen",
  },
  {
    value: "yellow",
    label: "🟡 Geel - kan wijzen op vetmalabsorptie of snelle passage",
  },
  {
    value: "green",
    label: "🟢 Groen - voeding, supplementen of snelle passage",
  },
  {
    value: "grey",
    label: "⚪ Grijs - kan wijzen op galproblemen",
  },
  {
    value: "black",
    label: "⚫ Zwart - kan bloedverlies betekenen",
  },
  {
    value: "red",
    label: "🔴 Rood - kan bloedverlies betekenen",
  },
];

export function DailyEventAddModal({
  eventType,
  selectedDate,
  onClose,
  onSave,
}) {
  const [eventTime, setEventTime] = useState(
    `${selectedDate}T${new Date().toTimeString().slice(0, 5)}`,
  );

  const [value1, setValue1] = useState(eventType === "bowel" ? "4" : "");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [bowelColor, setBowelColor] = useState("brown");
  const [repeat, setRepeat] = useState("none");

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const mobileInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: isMobile ? "12px 11px" : "10px 11px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: isMobile ? 16 : 14,
    minHeight: isMobile ? 46 : 44,
    WebkitAppearance: "none",
  };

  const config = {
    insulin: {
      title: "Insuline toevoegen",
      label1: "Aantal eenheden",
      placeholder1: "bijv. 4",
      label2: "Notitie",
      placeholder2: "bijv. dageraad / correctie / voor maaltijd",
    },
    glucose: {
      title: "Glucosemeting toevoegen",
      label1: "Glucosewaarde mmol/L",
      placeholder1: "bijv. 7.8",
      label2: "Notitie",
      placeholder2: "bijv. nuchter / 1 uur na ontbijt",
    },
    glucoseBoost: {
      title: "Glucoseboost toevoegen",
      label1: "Snelle KH gram",
      placeholder1: "bijv. 15",
      label2: "Bron",
      placeholder2: "bijv. druivensuiker",
      label3: "Notitie",
      placeholder3: "bijv. hypo-correctie",
    },
    movement: {
      title: "Beweging/sport toevoegen",
      label1: "Type",
      placeholder1: "bijv. krachttraining",
      label2: "Belasting",
      placeholder2: "aeroob / anaeroob / gemengd",
      label3: "Duur minuten",
      placeholder3: "bijv. 60",
    },
    bowel: {
      title: "Stoelgang toevoegen",
      label1: "Bristol score",
      placeholder1: "1 t/m 7",
    },
    note: {
      title: "Notitie toevoegen",
      label1: "Notitie",
      placeholder1: "bijv. 2 HMB pillen voor training",
      label2: "Context",
      placeholder2: "optioneel",
    },
    supplement: {
      title: "Supplement toevoegen",
      label1: "Naam supplement",
      placeholder1: "bijv. HMB",
      label2: "Dosering",
      placeholder2: "bijv. 2 capsules",
      label3: "Notitie",
      placeholder3: "optioneel",
    },
  }[eventType];

  if (!config) return null;

  const primaryValueIsNumeric = ["insulin", "glucose", "glucoseBoost"].includes(
    eventType,
  );

  function save() {
    onSave({
      eventType,
      eventTime,
      value1,
      value2,
      value3,
      bowelColor,
      repeat,
    });
    onClose();
  }

  const footer = (
    <>
      <CompanionButton variant="secondary" onClick={onClose}>
        Annuleren
      </CompanionButton>

      <CompanionButton
        variant="primary"
        onClick={save}
      >
        Opslaan
      </CompanionButton>
    </>
  );

  return (
    <CompanionModalShell
      open
      onClose={onClose}
      title={config.title}
      size="sm"
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

        <label style={{ fontSize: 13, fontWeight: 800 }}>{config.label1}</label>

        {eventType === "bowel" ? (
          <select
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            style={{
              ...mobileInputStyle,
              marginTop: 4,
              marginBottom: 12,
              minHeight: 44,
              cursor: "pointer",
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
        ) : (
          primaryValueIsNumeric ? (
            <CompanionNumberInput
              decimal={eventType !== "glucoseBoost"}
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              placeholder={config.placeholder1}
              style={{
                ...mobileInputStyle,
                marginTop: 4,
                marginBottom: 12,
              }}
            />
          ) : (
            <input
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              placeholder={config.placeholder1}
              style={{
                ...mobileInputStyle,
                marginTop: 4,
                marginBottom: 12,
              }}
            />
          )
        )}

        {eventType === "bowel" && (
          <>
            <label style={{ fontSize: 13, fontWeight: 800 }}>
              Kleur ontlasting
            </label>

            <select
              value={bowelColor}
              onChange={(e) => setBowelColor(e.target.value)}
              style={{
                ...mobileInputStyle,
                marginTop: 4,
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              {BOWEL_COLOR_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        )}

        {eventType !== "bowel" && (
          <>
            <label style={{ fontSize: 13, fontWeight: 800 }}>
              {config.label2}
            </label>

            <input
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              placeholder={config.placeholder2}
              style={{
                ...mobileInputStyle,
                marginTop: 4,
                marginBottom: 12,
              }}
            />

            {config.label3 && (
              <>
                <label style={{ fontSize: 13, fontWeight: 800 }}>
                  {config.label3}
                </label>

                {eventType === "movement" ? (
                  <CompanionNumberInput
                    decimal={false}
                    value={value3}
                    onChange={(e) => setValue3(e.target.value)}
                    placeholder={config.placeholder3}
                    style={{
                      ...mobileInputStyle,
                      marginTop: 4,
                      marginBottom: 14,
                    }}
                  />
                ) : (
                  <input
                    value={value3}
                    onChange={(e) => setValue3(e.target.value)}
                    placeholder={config.placeholder3}
                    style={{
                      ...mobileInputStyle,
                      marginTop: 4,
                      marginBottom: 14,
                    }}
                  />
                )}
              </>
            )}
          </>
        )}

        {(eventType === "supplement" || eventType === "movement") && (
          <>
            <label style={{ fontSize: 13, fontWeight: 800 }}>Herhalen</label>

            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              style={{
                ...mobileInputStyle,
                marginTop: 4,
                marginBottom: 14,
              }}
            >
              <option value="none">Niet herhalen</option>
              <option value="daily">Dagelijks</option>
            </select>
          </>
        )}
    </CompanionModalShell>
  );
}
