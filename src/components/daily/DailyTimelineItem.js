import React from "react";

export function DailyTimelineItem({
  icon,
  title,
  subtitle,
  timeLabel,
  accentColor = "#334155",
  backgroundColor = "#f8fafc",
  borderColor = "#cbd5e1",
  detailContent,
  actions,
  expanded,
  onToggle,
  compact = false,
}) {
  return (
    <div
      style={{
        marginBottom: 6,
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        borderLeft: `6px solid ${accentColor}`,
        background: backgroundColor,
        overflow: "hidden",
        boxShadow: "none",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: compact ? "6px 9px" : "8px 10px",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 850,
              color: accentColor,
              fontSize: compact ? 13 : 14,
              lineHeight: 1.2,
            }}
          >
            {timeLabel ? (
              <span
                style={{
                  display: "inline-block",
                  minWidth: 46,
                  color: "#0f172a",
                  fontWeight: 900,
                }}
              >
                {timeLabel}
              </span>
            ) : null}
            {icon} {title}
          </div>

          {!compact && subtitle ? (
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: "#475569",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {!compact && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {actions}

            <button
              type="button"
              onClick={onToggle}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 14,
                cursor: "pointer",
                color: "#64748b",
                fontWeight: 900,
              }}
            >
              {expanded ? "▲" : "▼"}
            </button>
          </div>
        )}
      </div>

      {!compact && expanded && detailContent ? (
        <div
          style={{
            borderTop: "1px solid rgba(15,23,42,0.08)",
            padding: "8px 10px",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          {detailContent}
        </div>
      ) : null}
    </div>
  );
}
