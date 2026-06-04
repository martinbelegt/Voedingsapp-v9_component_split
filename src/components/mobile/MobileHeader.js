import React from "react";

export function MobileHeader() {
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
      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: "#0f766e",
          lineHeight: 1.1,
          letterSpacing: "-0.3px",
        }}
      >
        VoedingsManager
      </div>

      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginTop: 4,
          lineHeight: 1.2,
        }}
      >
        Grip op voeding, patronen en gezondheid
      </div>
    </div>
  );
}
