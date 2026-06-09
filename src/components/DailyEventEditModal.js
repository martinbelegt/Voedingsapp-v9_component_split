import React, { useState } from "react";

export function DailyEventEditModal({
  eventType,
  event,
  buttonStyle,
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
        : eventType === "note"
          ? event?.note || ""
          : "",
  );
  const [note, setNote] = useState(
    eventType === "note" ? event?.context || "" : event?.note || "",
  );
  const [alarmEnabled, setAlarmEnabled] = useState(
    Boolean(event?.alarmEnabled),
  );
  const isGlucose = eventType === "glucose";
  const isInsulin = eventType === "insulin";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(430px, 95vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "white",
          borderRadius: 12,
          padding: 14,
          border: "1px solid #cbd5e1",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Moment wijzigen</h3>

        <label style={{ fontSize: 13, fontWeight: 800 }}>Datum en tijd</label>
        <input
          type="datetime-local"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
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

        <label style={{ fontSize: 13, fontWeight: 800 }}>
          {isInsulin
            ? "Aantal eenheden"
            : isGlucose
              ? "Glucosewaarde"
              : eventType === "note"
                ? "Notitie"
                : "Waarde"}
        </label>
        <input
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

            <input
              type="datetime-local"
              value={alarmAt}
              onChange={(e) => setAlarmAt(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 16,
              }}
            />
          </div>
        )}

        <div
          style={{ display: "flex", gap: 8, justifyContent: "space-between" }}
        >
          <button
            onClick={() => {
              const ok = window.confirm("Dit moment verwijderen?");
              if (!ok) return;
              onDelete(event.id);
              onClose();
            }}
            style={{
              ...buttonStyle,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 800,
            }}
          >
            Verwijder
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={buttonStyle}>
              Annuleer
            </button>

            <button
              onClick={() => {
                onSave(event.id, {
                  eventTime,
                  ...(isInsulin ? { units: value1 } : {}),
                  ...(isGlucose ? { glucoseValue: value1 } : {}),
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
              style={{
                ...buttonStyle,
                background: "#dcfce7",
                border: "1px solid #86efac",
                color: "#166534",
                fontWeight: 800,
              }}
            >
              Opslaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
