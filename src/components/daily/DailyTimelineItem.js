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
  indentLevel = 0,
  itemType,
}) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const indentPx = isMobile
    ? indentLevel * 14
    : compact
      ? indentLevel * 14
      : indentLevel * 32;

  return (
    <div
      data-timeline-item={itemType}
      style={{
        marginBottom: isMobile ? 4 : 6,
        marginLeft: indentLevel > 0 ? indentPx : 0,
        borderRadius: isMobile ? 2 : 4,
        border: `1px solid ${borderColor}`,
        borderLeft: `5px solid ${accentColor}`,
        background: backgroundColor,
        overflow: "hidden",
        boxShadow: "none",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          padding: isMobile ? "5px 7px" : compact ? "6px 9px" : "8px 10px",
          cursor: "pointer",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: isMobile ? 5 : 8,
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              color: accentColor,
              fontSize: isMobile ? 12 : compact ? 13 : 14,
              lineHeight: isMobile ? 1.12 : 1.2,
              overflow: compact ? "hidden" : undefined,
              textOverflow: compact ? "ellipsis" : undefined,
              whiteSpace: compact ? "nowrap" : undefined,
            }}
          >
            {timeLabel ? (
              <span
                style={{
                  display: "inline-block",
                  minWidth: isMobile ? 39 : 46,
                  color: "#0f172a",
                  fontWeight: 700,
                }}
              >
                {timeLabel}
              </span>
            ) : null}

            <span style={{ marginRight: 3 }}>{icon}</span>
            {title}
          </div>

          {!compact && subtitle ? (
            <div
              style={{
                marginTop: isMobile ? 1 : 2,
                fontSize: isMobile ? 10.5 : 12,
                color: "#64748b",
                lineHeight: 1.15,
                whiteSpace: "pre-line",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {actions || (!compact && detailContent) ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? 3 : 5,
            }}
          >
            {actions}

            {!compact && detailContent ? (
              <button
                type="button"
                onClick={onToggle}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: isMobile ? 12 : 14,
                  cursor: "pointer",
                  color: "#64748b",
                  fontWeight: 800,
                  padding: isMobile ? 2 : undefined,
                }}
              >
                {expanded ? "▲" : "▼"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {!compact && expanded && detailContent ? (
        <div
          style={{
            borderTop: "1px solid rgba(15,23,42,0.08)",
            padding: isMobile ? "4px 6px" : "5px 7px",
            background: "rgba(255,255,255,0.72)",
            fontSize: isMobile ? 11 : undefined,
          }}
        >
          {detailContent}
        </div>
      ) : null}
    </div>
  );
}
