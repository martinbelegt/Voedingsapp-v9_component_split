import React from "react";

export function DailyTimelineItem({
  icon,
  title,
  subtitle,
  accentColor = "#334155",
  backgroundColor = "#f8fafc",
  borderColor = "#cbd5e1",
  detailContent,
  actions,
  expanded,
  onToggle,
}) {
  return (
    <div
      style={{
        marginBottom: 8,
        borderRadius: 14,
        border: `1px solid ${borderColor}`,
        background: backgroundColor,
        overflow: "hidden",
      }}
    >
      {/* Tijdlijnkop */}
      <div
        onClick={onToggle}
        style={{
          padding: "9px 11px",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* Linker info */}
        <div>
          <div
            style={{
              fontWeight: 900,
              color: accentColor,
              fontSize: 14,
              lineHeight: 1.2,
            }}
          >
            {icon} {title}
          </div>

          {subtitle ? (
            <div
              style={{
                marginTop: 3,
                fontSize: 12,
                color: "#475569",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Rechter acties */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {actions}

          <button
            style={{
              border: "none",
              background: "transparent",
              fontSize: 16,
              cursor: "pointer",
              color: "#64748b",
              fontWeight: 900,
            }}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Uitklapbaar detail */}
      {expanded && detailContent ? (
        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.06)",
            padding: 12,
            background: "rgba(255,255,255,0.78)",
          }}
        >
          {detailContent}
        </div>
      ) : null}
    </div>
  );
}
