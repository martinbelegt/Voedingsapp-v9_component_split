import React from "react";
import { CompanionNumberInput } from "../ui/inputs/CompanionInput";

export function TestLogSection(props) {
  const {
    testLog,
    testLogForm,
    setTestLogForm,
    bristolOptions,
    addTestLogEntry,
    deleteTestLogEntry,
    cardStyle,
    inputStyle,
    buttonStyle,
    primaryButtonStyle,
    labelStyle,
  } = props;

  return (
    <>
      {
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Testlogboek</h2>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
            Leg per test vast wat je at, hoeveel insuline en Creon je nam, en
            hoe het uitpakte. Zo kun je je drempels en persoonlijke timing later
            beter finetunen.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.9fr 1.2fr 1fr auto",
              gap: 8,
              marginBottom: 12,
              alignItems: "end",
            }}
          >
            <input
              value={testLogForm.mealLabel}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, mealLabel: e.target.value })
              }
              style={inputStyle}
              placeholder="Maaltijd / testnaam"
            />
            <CompanionNumberInput
              value={testLogForm.insulin}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, insulin: e.target.value })
              }
              style={inputStyle}
              placeholder="Insuline"
            />
            <CompanionNumberInput
              value={testLogForm.creon}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, creon: e.target.value })
              }
              style={inputStyle}
              placeholder="Creon"
            />
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Bristol Stool Chart</label>
              <select
                value={testLogForm.stoolType || "4"}
                onChange={(e) =>
                  setTestLogForm((prev) => ({
                    ...prev,
                    stoolType: e.target.value,
                  }))
                }
                style={inputStyle}
              >
                {bristolOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={testLogForm.outcome}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, outcome: e.target.value })
              }
              style={inputStyle}
              placeholder="Uitkomst"
            />
            <input
              value={testLogForm.notes}
              onChange={(e) =>
                setTestLogForm({ ...testLogForm, notes: e.target.value })
              }
              style={inputStyle}
              placeholder="Notitie"
            />
            <button onClick={addTestLogEntry} style={primaryButtonStyle}>
              Opslaan
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {testLog.length === 0 && (
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Nog geen tests opgeslagen.
              </div>
            )}
            {testLog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 0.7fr 0.7fr 0.9fr 1.2fr 1fr auto",
                  gap: 8,
                  alignItems: "center",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 10,
                  background: "#f8fafc",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{entry.mealLabel}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {entry.loggedAt}
                  </div>
                </div>
                <div>
                  <strong>{entry.insulin || "-"}</strong>
                </div>
                <div>
                  <strong>{entry.creon || "-"}</strong>
                </div>
                <div>
                  <strong>Bristol:</strong>{" "}
                  {entry.stoolType
                    ? bristolOptions.find(
                        (opt) => opt.value === String(entry.stoolType),
                      )?.label || entry.stoolType
                    : "-"}
                </div>
                <div>
                  <strong>{entry.outcome || "-"}</strong>
                </div>
                <div style={{ fontSize: 12 }}>{entry.notes || "-"}</div>
                <button
                  onClick={() => deleteTestLogEntry(entry.id)}
                  style={{
                    ...buttonStyle,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                  }}
                >
                  Wis
                </button>
              </div>
            ))}
          </div>
        </div>
      }
    </>
  );
}
