import React from "react";

export function MobileHeader({ onHomeClick }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        marginBottom: 10,
      }}
    >
      <button
        type="button"
        onClick={onHomeClick}
        style={{
          appearance: "none",
          border: 0,
          background: "transparent",
          padding: 0,
          margin: 0,
          fontSize: 20,
          fontWeight: 900,
          color: "#0f766e",
          lineHeight: 1.1,
          letterSpacing: "-0.3px",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        Companion
      </button>

      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginTop: 4,
          lineHeight: 1.2,
        }}
      >
        Jouw persoonlijke gezondheidsmaatje
      </div>
    </div>
  );
}
