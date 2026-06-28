import React from "react";

function isLocalDevelopment() {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function formatValue(value) {
  return value === null || value === undefined ? "-" : value;
}

function getStatus(debug) {
  if (!debug) return { label: "Status onbekend", tone: "#64748b" };

  const checks = [
    debug.cloud.products === debug.local.products,
    debug.cloud.favorites === debug.local.favorites,
    debug.cloud.savedMeals === debug.local.savedMeals,
    debug.cloud.categories === debug.local.categories,
    debug.cloud.settingsOk === debug.local.settingsOk,
  ];

  if (checks.every(Boolean)) {
    return { label: "✅ In sync", tone: "#15803d" };
  }

  return { label: "⚠ verschil", tone: "#b45309" };
}

export function AppDataSyncMonitor({ debug }) {
  if (!isLocalDevelopment() || !debug) return null;

  const status = getStatus(debug);

  return (
    <aside
      style={{
        position: "fixed",
        right: 12,
        bottom: 430,
        zIndex: 9999,
        width: 280,
        maxWidth: "calc(100vw - 24px)",
        padding: 12,
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        background: "rgba(255, 255, 255, 0.96)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.14)",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
        fontSize: 12,
        lineHeight: 1.45,
      }}
      aria-label="App Data Sync Monitor"
    >
      <div style={{ fontWeight: 900, marginBottom: 8 }}>
        App Data Sync Monitor
      </div>

      <div style={{ display: "grid", gap: 2 }}>
        <strong>Cloud / Local</strong>
        <span>
          Products: {formatValue(debug.cloud.products)} /{" "}
          {formatValue(debug.local.products)}
        </span>
        <span>
          Favorites: {formatValue(debug.cloud.favorites)} /{" "}
          {formatValue(debug.local.favorites)}
        </span>
        <span>
          SavedMeals: {formatValue(debug.cloud.savedMeals)} /{" "}
          {formatValue(debug.local.savedMeals)}
        </span>
        <span>
          Categories: {formatValue(debug.cloud.categories)} /{" "}
          {formatValue(debug.local.categories)}
        </span>
        <span>
          Settings: {debug.cloud.settingsOk ? "OK" : "-"} /{" "}
          {debug.local.settingsOk ? "OK" : "-"}
        </span>
      </div>

      <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
        <strong>Status</strong>
        <span>Source: {debug.source}</span>
        <span style={{ color: status.tone, fontWeight: 900 }}>
          Status: {status.label}
        </span>
      </div>
    </aside>
  );
}
