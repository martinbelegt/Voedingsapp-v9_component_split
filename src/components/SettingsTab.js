import React from "react";
import { CreonSettingsCard } from "../CreonSettingsCard";

export function SettingsTab({
  settings,
  setSettings,
  resetSettings,
  resetAppData,
  cardStyle,
  labelStyle,
  inputStyle,
  enzymeTriggerPresets,
}) {
  const settingsCardBase = {
    borderRadius: 16,
    padding: 16,
    border: "1px solid #e5e7eb",
    display: "grid",
    gap: 12,
  };

  const helperStyle = {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 1.4,
  };

  const sectionTitleStyle = {
    fontSize: 12,
    fontWeight: 800,
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 4,
  };

  const creonInfoBoxStyle = {
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: "#166534",
    lineHeight: 1.5,
  };

  const softInfoBoxStyle = {
    fontSize: 12,
    color: "#166534",
    background: "#ffffff",
    border: "1px solid #d1fae5",
    borderRadius: 10,
    padding: "8px 10px",
    lineHeight: 1.45,
  };

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Instellingen</h2>

        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "start",
            }}
          >
            <div
              style={{
                ...settingsCardBase,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1d4ed8" }}>
                Insuline
              </div>

              <div>
                <label style={labelStyle}>Gram KH per 1E insuline</label>
                <input
                  value={settings.gramsKhPerUnit}
                  onChange={(e) =>
                    setSettings({ ...settings, gramsKhPerUnit: e.target.value })
                  }
                  style={inputStyle}
                />
                <div style={helperStyle}>
                  Basisverhouding voor koolhydraten → insuline.
                </div>
              </div>
            </div>

            <div
              style={{
                ...settingsCardBase,
                background: "#fefce8",
                border: "1px solid #fde68a",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: "#a16207" }}>
                Timing
              </div>

              <div>
                <label style={labelStyle}>
                  Persoonlijke timingprofielen gebruiken
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    border: "1px solid #cbd5e1",
                    borderRadius: 12,
                    background: "#ffffff",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.usePersonalTiming !== false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        usePersonalTiming: e.target.checked,
                      })
                    }
                  />
                  <span>
                    {settings.usePersonalTiming !== false
                      ? "Ja, persoonlijke timing gebruiken"
                      : "Nee, alleen algemene GI-regel gebruiken"}
                  </span>
                </label>
                <div style={helperStyle}>
                  Hiermee laat je de app jouw persoonlijke timingprofielen
                  meewegen naast het algemene GI-advies.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              alignItems: "start",
            }}
          >
            <CreonSettingsCard
              settings={settings}
              setSettings={setSettings}
              settingsCardBase={settingsCardBase}
              helperStyle={helperStyle}
              labelStyle={labelStyle}
              inputStyle={inputStyle}
              enzymeTriggerPresets={enzymeTriggerPresets}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
