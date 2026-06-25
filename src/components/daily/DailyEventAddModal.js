import React, { useState } from "react";
import { CompanionDateTimePicker } from "../../ui/pickers/CompanionDateTimePicker";

const BOWEL_COLOR_OPTIONS = [
  {
    value: "",
    label: "Kleur niet ingevuld",
    info: "",
  },
  {
    value: "dark_brown",
    label: "🟤 Donkerbruin - meestal normaal",
    info: "",
  },
  {
    value: "brown",
    label: "🟫 Bruin - normale kleur",
    info: "",
  },
  {
    value: "light_brown",
    label: "🟨 Lichtbruin - meestal normaal, let op veranderingen",
    info: "",
  },
  {
    value: "yellow",
    label: "🟡 Geel - kan wijzen op vetmalabsorptie of snelle passage",
    info: "",
  },
  {
    value: "green",
    label: "🟢 Groen - voeding, supplementen of snelle passage",
    info: "",
  },
  {
    value: "grey",
    label: "⚪ Grijs - kan wijzen op galproblemen",
    info: "",
  },
  {
    value: "black",
    label: "⚫ Zwart - kan bloedverlies betekenen",
    info: "",
  },
  {
    value: "red",
    label: "🔴 Rood - kan bloedverlies betekenen",
    info: "",
  },
];

function getBowelColorInfo(value) {
  return BOWEL_COLOR_OPTIONS.find((opt) => opt.value === value)?.info || "";
}

export function DailyEventAddModal({
  eventType,
  selectedDate,
  buttonStyle,
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

  console.log("DailyEventAddModal eventType:", eventType);

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

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px,95vw)",
          maxHeight: isMobile ? "85vh" : "90vh",
          overflowY: "auto",
          background: "white",
          borderRadius: isMobile ? 10 : 18,
          padding: isMobile ? 12 : 18,
          border: "1px solid #cbd5e1",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 18,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          {config.title}
        </div>

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

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={buttonStyle}>
            Annuleren
          </button>

          <button
            onClick={save}
            style={{
              ...buttonStyle,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1d4ed8",
              fontWeight: 800,
            }}
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
