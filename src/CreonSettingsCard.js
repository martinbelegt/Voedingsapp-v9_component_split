export function CreonSettingsCard({
  settings,
  setSettings,
  settingsCardBase,
  helperStyle,
  labelStyle,
  inputStyle,
  enzymeTriggerPresets,
}) {
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

  const capsuleToggleStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <>
      <div
        style={{
          ...settingsCardBase,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, color: "#166534" }}>
          Creon basis
        </div>

        <div style={softInfoBoxStyle}>
          Creon bevat enzymen voor vetten, koolhydraten en eiwitten. Je kunt per
          soort aangeven of je die werkelijk gebruikt. Alleen ingeschakelde
          soorten worden meegenomen in de berekening.
        </div>

        <div style={sectionTitleStyle}>Capsules / granulaat</div>

        <label style={capsuleToggleStyle}>
          <input
            type="checkbox"
            checked={!!settings.useCreon35000}
            onChange={(e) =>
              setSettings({
                ...settings,
                useCreon35000: e.target.checked,
              })
            }
          />
          <span>Creon 35.000 EH gebruiken</span>
        </label>

        <div>
          <label style={labelStyle}>
            Creon 35.000 EH: gram vet per capsule
          </label>
          <input
            value={settings.fatPerCap35 || ""}
            onChange={(e) =>
              setSettings({ ...settings, fatPerCap35: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div style={creonInfoBoxStyle}>
          <strong>1 capsule Creon 35.000 EH bevat:</strong>
          <br />
          Lipase (vetten): 35.000
          <br />
          Amylase (koolhydraten): 25.200
          <br />
          Protease (eiwitten): 1.400
        </div>

        <label style={capsuleToggleStyle}>
          <input
            type="checkbox"
            checked={!!settings.useCreon25000}
            onChange={(e) =>
              setSettings({
                ...settings,
                useCreon25000: e.target.checked,
              })
            }
          />
          <span>Creon 25.000 EH gebruiken</span>
        </label>

        <div>
          <label style={labelStyle}>
            Creon 25.000 EH: gram vet per capsule
          </label>
          <input
            value={settings.fatPerCap25}
            onChange={(e) =>
              setSettings({ ...settings, fatPerCap25: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div style={creonInfoBoxStyle}>
          <strong>1 capsule Creon 25.000 EH bevat:</strong>
          <br />
          Lipase (vetten): 25.000
          <br />
          Amylase (koolhydraten): 18.000
          <br />
          Protease (eiwitten): 1.000
        </div>

        <label style={capsuleToggleStyle}>
          <input
            type="checkbox"
            checked={!!settings.useCreon10000}
            onChange={(e) =>
              setSettings({
                ...settings,
                useCreon10000: e.target.checked,
              })
            }
          />
          <span>Creon 10.000 EH gebruiken</span>
        </label>

        <div>
          <label style={labelStyle}>
            Creon 10.000 EH: gram vet per capsule
          </label>
          <input
            value={settings.fatPerCap10}
            onChange={(e) =>
              setSettings({ ...settings, fatPerCap10: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div style={creonInfoBoxStyle}>
          <strong>1 capsule Creon 10.000 EH bevat:</strong>
          <br />
          Lipase (vetten): 10.000
          <br />
          Amylase (koolhydraten): 8.000
          <br />
          Protease (eiwitten): 600
        </div>

        <label style={capsuleToggleStyle}>
          <input
            type="checkbox"
            checked={!!settings.useCreon5000}
            onChange={(e) =>
              setSettings({
                ...settings,
                useCreon5000: e.target.checked,
              })
            }
          />
          <span>Creon 5.000 EH granulaat gebruiken</span>
        </label>

        <div>
          <label style={labelStyle}>
            Creon 5.000 EH: gram vet per zakje / dosis
          </label>
          <input
            value={settings.fatPerCap5 || ""}
            onChange={(e) =>
              setSettings({ ...settings, fatPerCap5: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div style={creonInfoBoxStyle}>
          <strong>1 dosis Creon 5.000 EH bevat:</strong>
          <br />
          Lipase (vetten): 5.000
          <br />
          Amylase (koolhydraten): 3.600
          <br />
          Protease (eiwitten): 200
        </div>

        <div style={sectionTitleStyle}>Doel van Creon</div>

        <div>
          <label style={labelStyle}>Creon-doel</label>
          <select
            value={settings.creonGoal || "comfort"}
            onChange={(e) =>
              setSettings({ ...settings, creonGoal: e.target.value })
            }
            style={inputStyle}
          >
            <option value="comfort">Comfort / klachten voorkomen</option>
            <option value="optimal">
              Optimale vertering / ook lichte maaltijden ondersteunen
            </option>
          </select>
          <div style={helperStyle}>
            In optimale modus kan de app ook bij lichte maaltijden zoals fruit
            of sportvoeding een minimale enzymactiviteit adviseren.
          </div>
        </div>

        <div style={sectionTitleStyle}>Basislogica</div>

        <div>
          <label style={labelStyle}>Creon-modus</label>
          <select
            value={settings.creonMode}
            onChange={(e) =>
              setSettings({ ...settings, creonMode: e.target.value })
            }
            style={inputStyle}
          >
            <option value="standard">Standaard (alleen vet als basis)</option>
            <option value="extended">
              Persoonlijk uitgebreid (vet + KH + eiwit)
            </option>
          </select>
          <div style={helperStyle}>
            In uitgebreide modus tellen ook KH- en eiwitfactoren mee in de
            Creon-opbouw.
          </div>
        </div>

        <div>
          <label style={labelStyle}>Eiwitcorrectie glucose</label>
          <input
            value={settings.proteinCorrection}
            onChange={(e) =>
              setSettings({
                ...settings,
                proteinCorrection: e.target.value,
              })
            }
            style={inputStyle}
          />
          <div style={helperStyle}>
            Gebruik dit als eiwit bij jou later ook nog glucose-effect geeft. De
            app telt eiwit dan deels mee als extra belasting.
          </div>
        </div>
      </div>

      <div
        style={{
          ...settingsCardBase,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, color: "#166534" }}>
          Creon uitgebreid
        </div>

        <div style={softInfoBoxStyle}>
          Deze instellingen worden vooral belangrijk als je ook koolhydraten en
          eiwitten wilt laten meewegen als reden voor enzymondersteuning.
        </div>

        <div style={sectionTitleStyle}>Factoren</div>

        <div>
          <label style={labelStyle}>KH → Creon factor</label>
          <input
            value={settings.khCreonFactor}
            onChange={(e) =>
              setSettings({ ...settings, khCreonFactor: e.target.value })
            }
            style={inputStyle}
          />
          <div style={helperStyle}>
            Alleen relevant in uitgebreide Creon-modus.
          </div>
        </div>

        <div>
          <label style={labelStyle}>Eiwit → Creon factor</label>
          <input
            value={settings.proteinCreonFactor}
            onChange={(e) =>
              setSettings({
                ...settings,
                proteinCreonFactor: e.target.value,
              })
            }
            style={inputStyle}
          />
          <div style={helperStyle}>
            Alleen relevant in uitgebreide Creon-modus.
          </div>
        </div>

        <div style={sectionTitleStyle}>Lichte maaltijden slim ondersteunen</div>

        <div>
          <label style={labelStyle}>Min. KH voor lichte maaltijd-Creon</label>
          <input
            value={settings.minKhForLightMealCreon || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                minKhForLightMealCreon: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Min. eiwit voor lichte maaltijd-Creon
          </label>
          <input
            value={settings.minProteinForLightMealCreon || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                minProteinForLightMealCreon: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Minimale enzymbelasting voor lichte maaltijd
          </label>
          <input
            value={settings.lightMealMinEnzymeLoad || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                lightMealMinEnzymeLoad: e.target.value,
              })
            }
            style={inputStyle}
          />
          <div style={helperStyle}>
            Deze waarde wordt gebruikt als minimale vet-equivalentbelasting bij
            lichte maaltijden in optimale modus.
          </div>
        </div>

        <div style={sectionTitleStyle}>Triggers</div>

        <div>
          <label style={labelStyle}>Enzym-trigger preset</label>
          <select
            value={settings.enzymeTriggerPreset || "standaard"}
            onChange={(e) => {
              const preset =
                enzymeTriggerPresets[e.target.value] ||
                enzymeTriggerPresets.standaard;
              setSettings({
                ...settings,
                enzymeTriggerPreset: e.target.value,
                minKhTriggerThreshold: preset.minKhTriggerThreshold,
                minProteinTriggerThreshold: preset.minProteinTriggerThreshold,
                minEnzymeLoadValue: preset.minEnzymeLoadValue,
              });
            }}
            style={inputStyle}
          >
            <option value="voorzichtig">Voorzichtig</option>
            <option value="standaard">Standaard</option>
            <option value="gevoelig">Gevoelig</option>
            <option value="handmatig">Handmatig</option>
          </select>
          <div style={helperStyle}>
            Bepaalt hoe snel KH of eiwit meetellen als reden voor enzymen.
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            Min. KH-trigger voor enzymen (gram KH)
          </label>
          <input
            value={settings.minKhTriggerThreshold || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                enzymeTriggerPreset: "handmatig",
                minKhTriggerThreshold: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Min. eiwit-trigger voor enzymen (gram eiwit)
          </label>
          <input
            value={settings.minProteinTriggerThreshold || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                enzymeTriggerPreset: "handmatig",
                minProteinTriggerThreshold: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Minimale enzym-trigger waarde (vet-equivalent)
          </label>
          <input
            value={settings.minEnzymeLoadValue || ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                enzymeTriggerPreset: "handmatig",
                minEnzymeLoadValue: e.target.value,
              })
            }
            style={inputStyle}
          />
        </div>

        <div style={sectionTitleStyle}>Extra meenemen</div>

        <div>
          <label style={{ ...labelStyle, marginBottom: 8 }}>
            Eiwitcorrectie glucose meetellen in Creon-opbouw
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
              checked={!!settings.includeProteinGlucoseInCreon}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  includeProteinGlucoseInCreon: e.target.checked,
                })
              }
            />
            <span>
              {settings.includeProteinGlucoseInCreon
                ? "Ja, meetellen"
                : "Nee, niet meetellen"}
            </span>
          </label>
          <div style={helperStyle}>
            Alleen nodig als je wilt dat dit extra glucose-effect van eiwit ook
            echt de Creon-opbouw beïnvloedt.
          </div>
        </div>
      </div>
    </>
  );
}
