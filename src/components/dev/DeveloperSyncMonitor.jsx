import React from "react";

function formatTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatValue(value) {
  return value === null || value === undefined ? "-" : value;
}

function isLocalDevelopment() {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function getStatus(syncDebug) {
  if (!syncDebug) return { label: "Status onbekend", tone: "#64748b" };

  if (syncDebug.conflict) {
    return { label: "⚠ Revision mismatch", tone: "#b45309" };
  }

  if (
    Number.isInteger(syncDebug.cloud.revision) &&
    Number.isInteger(syncDebug.local.revision) &&
    syncDebug.cloud.revision !== syncDebug.local.revision
  ) {
    return { label: "⚠ Revision mismatch", tone: "#b45309" };
  }

  if (
    syncDebug.cloud.days !== syncDebug.local.days ||
    syncDebug.cloud.events !== syncDebug.local.events
  ) {
    return { label: "⚠ Local != Cloud", tone: "#b45309" };
  }

  return { label: "✅ In sync", tone: "#15803d" };
}

export function DeveloperSyncMonitor({
  syncDebug,
  onAcceptLatestCloud,
}) {
  if (!syncDebug) return null;
  const localDevelopment = isLocalDevelopment();
  if (!localDevelopment && !syncDebug.conflict) return null;

  const status = getStatus(syncDebug);

  return (
    <aside
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 9999,
        width: 260,
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
      aria-label="Developer Sync Monitor"
    >
      <div style={{ fontWeight: 900, marginBottom: 8 }}>
        Developer Sync Monitor
      </div>

      <div style={{ display: "grid", gap: 2 }}>
        <strong>Cloud</strong>
        <span>Revision: {formatValue(syncDebug.cloud.revision)}</span>
        <span>Dagen: {formatValue(syncDebug.cloud.days)}</span>
        <span>updated_at: {formatTime(syncDebug.cloud.updatedAt)}</span>
        <span>
          Laatste save: {formatTime(syncDebug.cloud.lastSuccessfulSaveAt)}
        </span>
      </div>

      <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
        <strong>Local</strong>
        <span>Revision: {formatValue(syncDebug.local.revision)}</span>
        <span>Dagen: {formatValue(syncDebug.local.days)}</span>
        <span>Laatste save: {formatTime(syncDebug.local.lastSaveAt)}</span>
      </div>

      <div style={{ display: "grid", gap: 2, marginTop: 8 }}>
        <strong>Status</strong>
        <span>Cloud revision: {formatValue(syncDebug.cloud.revision)}</span>
        <span>Local revision: {formatValue(syncDebug.local.revision)}</span>
        <span>Cloud days: {formatValue(syncDebug.cloud.days)}</span>
        <span>Local days: {formatValue(syncDebug.local.days)}</span>
        <span>
          Laatste cloud sync:{" "}
          {formatTime(
            syncDebug.cloud.lastSuccessfulSaveAt || syncDebug.cloud.updatedAt,
          )}
        </span>
        <span>Bron: {syncDebug.source || "-"}</span>
        <span style={{ color: status.tone, fontWeight: 900 }}>
          Status: {status.label}
        </span>
      </div>

      {syncDebug.conflict && onAcceptLatestCloud ? (
        <div
          style={{
            display: "grid",
            gap: 8,
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <span>
            Synchronisatie is geblokkeerd om lokale wijzigingen te beschermen.
          </span>
          <button
            type="button"
            onClick={() => {
              const accepted = window.confirm(
                "Nieuwste clouddata laden? De huidige lokale versie wordt eerst veilig lokaal geback-upt en daarna vervangen.",
              );
              if (accepted) onAcceptLatestCloud();
            }}
            style={{
              minHeight: 36,
              border: "1px solid #b45309",
              borderRadius: 8,
              background: "#fff7ed",
              color: "#9a3412",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Nieuwste cloudversie laden
          </button>
        </div>
      ) : null}
    </aside>
  );
}
