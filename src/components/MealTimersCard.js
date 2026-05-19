import React, { useEffect, useState } from "react";
import {
  TIMER_DURATION_OPTIONS,
  TIMER_TYPES,
  formatRemainingTime,
  formatTimerEndTime,
  getTimerTypeMeta,
  isTimerExpired,
} from "../services/timerService";

export function MealTimersCard({
  timers = [],
  startTimer,
  deleteTimer,
  clearTimers,
  cardStyle,
  buttonStyle,
  primaryButtonStyle,
  inputStyle,
  labelStyle,
}) {
  const [timerType, setTimerType] = useState("satiety");
  const [durationHours, setDurationHours] = useState(3);
  const [note, setNote] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  function handleStartTimer() {
    startTimer({
      type: timerType,
      durationHours,
      note,
    });

    setNote("");
  }

  const activeTimers = timers.filter((timer) => !isTimerExpired(timer, now));
  const expiredTimers = timers.filter((timer) => isTimerExpired(timer, now));

  const compactInputStyle = {
    ...inputStyle,
    padding: "7px 9px",
    fontSize: 13,
    borderRadius: 10,
  };

  const compactButtonStyle = {
    ...buttonStyle,
    padding: "7px 10px",
    fontSize: 13,
    borderRadius: 10,
  };

  return (
    <div
      style={{
        ...cardStyle,
        padding: 10,
        borderRadius: 12,
      }}
    >
      {/* Kopregel maaltijd-timers */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
            Maaltijd-timers
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            Testmodel voor verzadiging, eetpauze, glucose en vertering.
          </div>
        </div>

        {timers.length > 0 && (
          <button onClick={clearTimers} style={compactButtonStyle}>
            Alles wissen
          </button>
        )}
      </div>

      {/* Timer starten */}
      <div
        style={{
          marginTop: 10,
          display: "grid",
          gap: 8,
          gridTemplateColumns: "150px 95px minmax(180px, 1fr) auto",
          alignItems: "end",
        }}
      >
        <div>
          <label style={{ ...labelStyle, fontSize: 11 }}>Type</label>
          <select
            value={timerType}
            onChange={(e) => setTimerType(e.target.value)}
            style={compactInputStyle}
          >
            {TIMER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ ...labelStyle, fontSize: 11 }}>Duur</label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            style={compactInputStyle}
          >
            {TIMER_DURATION_OPTIONS.map((hours) => (
              <option key={hours} value={hours}>
                {hours} uur
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ ...labelStyle, fontSize: 11 }}>Notitie</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="bijv. Griekse yoghurt test"
            style={compactInputStyle}
          />
        </div>

        <button
          onClick={handleStartTimer}
          style={{
            ...primaryButtonStyle,
            padding: "8px 12px",
            fontSize: 13,
            borderRadius: 10,
          }}
        >
          Start
        </button>
      </div>

      {/* Actieve timers */}
      <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
        {activeTimers.length === 0 && (
          <div
            style={{
              padding: "7px 9px",
              borderRadius: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Geen actieve timers.
          </div>
        )}

        {activeTimers.map((timer) => {
          const meta = getTimerTypeMeta(timer.type);

          return (
            <div
              key={timer.id}
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                padding: "7px 9px",
                borderRadius: 10,
                border: "1px solid #dbeafe",
                background: "#eff6ff",
              }}
            >
              <div>
                <div
                  style={{ fontWeight: 800, color: "#1e3a8a", fontSize: 13 }}
                >
                  {meta.label} · nog {formatRemainingTime(timer, now)}
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
                  Eindigt om {formatTimerEndTime(timer)}
                  {timer.note ? ` · ${timer.note}` : ""}
                </div>
              </div>

              <button
                onClick={() => deleteTimer(timer.id)}
                style={compactButtonStyle}
              >
                Stop
              </button>
            </div>
          );
        })}

        {expiredTimers.length > 0 && (
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {expiredTimers.length} afgelopen timer(s). Gebruik “Alles wissen” om
            op te ruimen.
          </div>
        )}
      </div>
    </div>
  );
}
