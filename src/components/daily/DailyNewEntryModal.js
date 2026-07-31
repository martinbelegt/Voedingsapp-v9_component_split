import React from "react";
import { CompanionModalShell } from "../../ui/modals/CompanionModalShell";
import { term } from "../../config/terminology";

export const DAILY_NEW_ENTRY_OPTIONS = [
  { id: "meal", icon: "🍽️", label: term("food") },
  { id: "insulin", icon: "💉", label: term("insulin") },
  { id: "glucose", icon: "🩸", label: term("glucose") },
  { id: "supplement", icon: "💊", label: term("supplement") },
  { id: "medication", icon: "💊", label: term("medication") },
  { id: "training", icon: "🏋️", label: term("strengthTraining") },
  { id: "movement", icon: "🚶", label: term("movement") },
  { id: "note", icon: "📝", label: term("note") },
];

export function DailyNewEntryModal({ open, onClose, onSelect }) {
  return (
    <CompanionModalShell
      open={open}
      onClose={onClose}
      title="Nieuw registreren"
      subtitle="Wat wil je aan je dag toevoegen?"
      size="sm"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          padding: "4px 0 8px",
        }}
      >
        {DAILY_NEW_ENTRY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            data-new-entry={option.id}
            onClick={() => onSelect(option.id)}
            style={{
              display: "grid",
              gridTemplateColumns: "36px minmax(0, 1fr)",
              gap: 11,
              alignItems: "center",
              minHeight: 72,
              padding: "14px 15px",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fbfcfd",
              color: "#334155",
              cursor: "pointer",
              textAlign: "left",
              font: "inherit",
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "0.005em",
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.025)",
              transition:
                "background 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                borderRadius: 11,
                background: "#f1f5f9",
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              {option.icon}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </CompanionModalShell>
  );
}
