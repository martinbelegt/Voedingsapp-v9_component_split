import React from "react";
import { CreonSettingsCard } from "../CreonSettingsCard";

export function SettingsTab({
  settings,
  setSettings,
  resetSettings,
  resetAppData,
  exportBackup,
  importBackupFromFile,
  restoreEmergencyBackup,
  backupFileRef,
  cardStyle,
  labelStyle,
  inputStyle,
  buttonStyle,
  primaryButtonStyle,
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
        <div style={{ marginBottom: 16 }}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: 4,
            }}
          >
            👤 Mijn Profiel
          </h2>

          <div
            style={{
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Jouw persoonlijke kenmerken, voorkeuren en gezondheidsgegevens
          </div>
        </div>

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
              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 18,
                    color: "#1d4ed8",
                  }}
                >
                  💉 Diabetes & Glucose
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  Hier leg je vast hoe jouw lichaam meestal reageert op
                  insuline, eten, hoge bloedsuiker en ochtendstijging.
                </div>
              </div>

              {/* Insulineprofiel: langwerkend en kortwerkend */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {/* Langwerkende / basale insuline */}
                <div>
                  <label style={labelStyle}>Langwerkende insuline</label>
                  <input
                    value={settings.basalInsulinName || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        basalInsulinName: e.target.value,
                      })
                    }
                    style={inputStyle}
                    placeholder="bijv. Tresiba"
                  />
                  <div style={helperStyle}>
                    Basale insuline. Deze telt niet mee in de KH-insulinecheck.
                  </div>
                </div>

                {/* Kortwerkende / bolus-insuline */}
                <div>
                  <label style={labelStyle}>Kortwerkende insuline</label>
                  <input
                    value={settings.bolusInsulinName || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bolusInsulinName: e.target.value,
                      })
                    }
                    style={inputStyle}
                    placeholder="bijv. Novorapid"
                  />
                  <div style={helperStyle}>
                    Maaltijd/correctie-insuline. Deze wordt gebruikt bij KH per
                    1E.
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  🍽️ Als je gaat eten
                  <span
                    style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}
                  >
                    {" "}
                    (koolhydraatratio)
                  </span>
                </label>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginTop: 4,
                    marginBottom: 6,
                  }}
                >
                  Hoeveel koolhydraten kun je eten per 1 eenheid insuline?
                  <br />
                  <br />
                  Kortom:
                  <br />
                  Je berekent hoeveel insuline je nodig hebt voor de maaltijd
                  die voor je staat, zodat je bloedsuiker netjes stabiel blijft.
                </div>
                <input
                  value={settings.gramsKhPerUnit}
                  onChange={(e) =>
                    setSettings({ ...settings, gramsKhPerUnit: e.target.value })
                  }
                  style={inputStyle}
                />

                <div>
                  <label style={labelStyle}>
                    📈 Als je bloedsuiker te hoog is
                    <span
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {" "}
                      (correctiefactor / insulinegevoeligheidsfactor)
                    </span>
                  </label>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 4,
                      marginBottom: 6,
                    }}
                  >
                    Hoeveel zakt je bloedsuiker door 1 eenheid insuline?
                    <br />
                    <br />
                    Kortom:
                    <br />
                    Zit je na het eten nog te hoog, maar ga je nog niet eten?
                    Dan helpt dit getal bepalen hoeveel extra insuline nodig is
                    om weer richting je gewenste waarde te gaan.
                  </div>
                  <input
                    value={settings.correctionFactor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        correctionFactor: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>🎯 Gewenste glucosewaarde</label>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      marginTop: 4,
                      marginBottom: 6,
                    }}
                  >
                    Naar welke glucosewaarde probeer je meestal terug te keren?
                  </div>
                  <input
                    value={settings.targetGlucose}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        targetGlucose: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <input
                      type="checkbox"
                      checked={settings.dawnPhenomenonEnabled}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          dawnPhenomenonEnabled: e.target.checked,
                        })
                      }
                      style={{ marginRight: 8 }}
                    />
                    🌅 Mijn bloedsuiker stijgt vaak in de ochtend zonder dat ik
                    gegeten heb
                  </label>
                </div>

                {settings.dawnPhenomenonEnabled && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Van</label>
                      <input
                        type="time"
                        value={settings.dawnStart}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            dawnStart: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Tot</label>
                      <input
                        type="time"
                        value={settings.dawnEnd}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            dawnEnd: e.target.value,
                          })
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                    color: "#475569",
                    lineHeight: 1.45,
                  }}
                >
                  <strong>💡 Belangrijk</strong>
                  <br />
                  <br />
                  Deze waarden zijn persoonlijk.
                  <br />
                  Spreek ze altijd af met je diabetesverpleegkundige, diëtist of
                  behandelaar.
                  <br />
                  <br />
                  Wat voor de ene persoon werkt, kan voor een andere persoon
                  heel anders zijn.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: "1px solid #cbd5e1",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 16,
                  marginBottom: 12,
                  color: "#0f172a",
                }}
              >
                Persoonlijke doelen
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>Onderhoud kcal</label>

                  <input
                    value={settings.dailyTargets?.maintenanceKcal || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dailyTargets: {
                          ...settings.dailyTargets,
                          maintenanceKcal: e.target.value,
                        },
                      })
                    }
                    style={inputStyle}
                  />

                  <div style={helperStyle}>
                    Geschatte kcal om op gewicht te blijven.
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Dagdoel kcal</label>

                  <input
                    value={settings.dailyTargets?.targetKcal || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dailyTargets: {
                          ...settings.dailyTargets,
                          targetKcal: e.target.value,
                        },
                      })
                    }
                    style={inputStyle}
                  />

                  <div style={helperStyle}>
                    Doel voor afvallen / onderhoud / opbouw.
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Eiwitdoel per dag</label>

                  <input
                    value={settings.dailyTargets?.proteinGoal || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dailyTargets: {
                          ...settings.dailyTargets,
                          proteinGoal: e.target.value,
                        },
                      })
                    }
                    style={inputStyle}
                  />

                  <div style={helperStyle}>
                    Persoonlijk eiwitdoel in gram per dag.
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Min eiwit per maaltijd</label>

                  <input
                    value={settings.dailyTargets?.proteinMealGoal || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dailyTargets: {
                          ...settings.dailyTargets,
                          proteinMealGoal: e.target.value,
                        },
                      })
                    }
                    style={inputStyle}
                  />

                  <div style={helperStyle}>
                    Richtwaarde voor eiwitsynthese per eetmoment.
                  </div>
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
            <div
              style={{
                ...settingsCardBase,
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 16, color: "#334155" }}>
                Backup & herstel
              </div>

              <div style={softInfoBoxStyle}>
                Hier beheer je de volledige app-backup. Dit gaat dus niet alleen
                over productlijsten, maar ook over instellingen, maaltijden,
                daglogboek en testlogboek.
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button onClick={exportBackup} style={buttonStyle}>
                  App-backup exporteren
                </button>

                <button
                  onClick={() => backupFileRef.current?.click()}
                  style={buttonStyle}
                >
                  App-backup importeren
                </button>

                <button onClick={restoreEmergencyBackup} style={buttonStyle}>
                  Laatste noodkopie herstellen
                </button>

                <button onClick={resetSettings} style={buttonStyle}>
                  Alleen instellingen resetten
                </button>

                <button onClick={resetAppData} style={primaryButtonStyle}>
                  Reset app / wis alle data
                </button>

                <input
                  ref={backupFileRef}
                  type="file"
                  accept="application/json"
                  onChange={importBackupFromFile}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
