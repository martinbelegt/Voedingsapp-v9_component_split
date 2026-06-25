import React, { useState } from "react";

const COLORS = {
  sage: "#6D9F71",
  sageDark: "#4F7D55",
  sageLight: "#EAF3EC",
  sageValue: "#EEF7F0",
  sageBorder: "#C9DDCE",
  text: "#0F172A",
  muted: "#6B7280",
  card: "#FFFFFF",
};

const FONT_STACK =
  '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const ICONS = {
  chart: "/",
  plus: "+",
  filter: "=",
  gear: "*",
  calendar: "#",
  clock: "o",
  check: "v",
};

function resolveIcon(icon) {
  if (!icon) return null;
  return ICONS[icon] || icon;
}

export function CompanionToolbarButton({
  label,
  children,
  icon,
  badge,
  active = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActivePress, setIsActivePress] = useState(false);
  const resolvedLabel = label || children;
  const resolvedIcon = resolveIcon(icon);
  const background = disabled
    ? "#F3F4F6"
    : active
      ? COLORS.sageValue
      : isHovered
        ? COLORS.sageLight
        : COLORS.card;
  const border = disabled
    ? "#D1D5DB"
    : active
      ? COLORS.sage
      : COLORS.sageBorder;
  const color = disabled ? "#9CA3AF" : active ? COLORS.sageDark : COLORS.text;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActivePress(false);
      }}
      onMouseDown={() => setIsActivePress(true)}
      onMouseUp={() => setIsActivePress(false)}
      style={{
        width: fullWidth ? "100%" : undefined,
        minHeight: 34,
        minWidth: 34,
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: resolvedLabel ? "6px 12px" : "6px 9px",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background,
        color,
        boxShadow: active
          ? "0 3px 10px rgba(109, 159, 113, 0.16)"
          : "0 1px 3px rgba(15, 23, 42, 0.05)",
        fontFamily: FONT_STACK,
        fontSize: 13,
        fontWeight: active ? 850 : 750,
        lineHeight: 1.1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.82 : 1,
        whiteSpace: "nowrap",
        transition:
          "background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 80ms ease",
        transform: isActivePress && !disabled ? "translateY(1px)" : "none",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      {...rest}
    >
      {resolvedIcon ? (
        <span aria-hidden="true" style={{ lineHeight: 1, fontWeight: 900 }}>
          {resolvedIcon}
        </span>
      ) : null}
      {resolvedLabel ? <span>{resolvedLabel}</span> : null}
      {badge !== undefined && badge !== null ? (
        <span
          style={{
            minWidth: 18,
            minHeight: 18,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 5px",
            borderRadius: 999,
            background: active ? COLORS.sage : COLORS.sageLight,
            color: active ? "#FFFFFF" : COLORS.sageDark,
            fontSize: 11,
            fontWeight: 850,
            lineHeight: 1,
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default CompanionToolbarButton;
