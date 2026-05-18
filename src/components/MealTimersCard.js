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

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Maaltijd-timers</h2>
          <div
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#64748b",
              lineHeight: 1.45,
            }}
          >
            Testmodel voor verzadiging, eetpauze, glucose opletten en
            vertering/Creon. Gebruik dit als praktisch hulpmiddel, niet als
            harde medische voorspelling.
          </div>
        </div>

        {timers.length > 0 && (
          <button onClick={clearTimers} style={buttonStyle}>
            Alle timers wissen
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          alignItems: "end",
        }}
      >
        <div>
          <label style={labelStyle}>Type timer</label>
          <select
            value={timerType}
            onChange={(e) => setTimerType(e.target.value)}
            style={inputStyle}
          >
            {TIMER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Duur</label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            style={inputStyle}
          >
            {TIMER_DURATION_OPTIONS.map((hours) => (
              <option key={hours} value={hours}>
                {hours} uur
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Notitie</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="bijv. Griekse yoghurt test"
            style={inputStyle}
          />
        </div>

        <button onClick={handleStartTimer} style={primaryButtonStyle}>
          Timer starten
        </button>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {activeTimers.length === 0 && (
          <div
            style={{
              padding: 10,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Nog geen actieve timers.
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
                padding: 10,
                borderRadius: 12,
                border: "1px solid #dbeafe",
                background: "#eff6ff",
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: "#1e3a8a" }}>
                  {meta.label} · nog {formatRemainingTime(timer, now)}
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  Eindigt om {formatTimerEndTime(timer)}
                  {timer.note ? ` · ${timer.note}` : ""}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {meta.description}
                </div>
              </div>

              <button onClick={() => deleteTimer(timer.id)} style={buttonStyle}>
                Stop
              </button>
            </div>
          );
        })}

        {expiredTimers.length > 0 && (
          <div
            style={{
              paddingTop: 6,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            {expiredTimers.length} afgelopen timer(s). Je kunt ze wissen met
            “Alle timers wissen”.
          </div>
        )}
      </div>
    </div>
  );
}
