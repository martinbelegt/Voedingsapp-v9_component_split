import React, { useState } from "react";

const COLORS = {
  sage: "#6D9F71",
  sageDark: "#4F7D55",
  sageLight: "#EAF3EC",
  sageValue: "#EEF7F0",
  sageBorder: "#C9DDCE",
  text: "#0F172A",
  muted: "#6B7280",
  danger: "#991B1B",
  dangerSoft: "#FEE2E2",
  dangerBorder: "#FECACA",
  card: "#FFFFFF",
};

const FONT_STACK =
  '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const SIZE_STYLES = {
  sm: {
    minHeight: 34,
    padding: "6px 11px",
    fontSize: 13,
    borderRadius: 9,
    gap: 6,
  },
  md: {
    minHeight: 42,
    padding: "9px 15px",
    fontSize: 14,
    borderRadius: 12,
    gap: 8,
  },
  lg: {
    minHeight: 52,
    padding: "13px 20px",
    fontSize: 16,
    borderRadius: 16,
    gap: 10,
  },
};

const VARIANT_STYLES = {
  primary: {
    background: COLORS.sage,
    border: COLORS.sage,
    color: "#FFFFFF",
    hoverBackground: COLORS.sageDark,
    activeBackground: "#436B49",
    shadow: "0 8px 18px rgba(109, 159, 113, 0.22)",
  },
  secondary: {
    background: COLORS.card,
    border: COLORS.sageBorder,
    color: COLORS.text,
    hoverBackground: COLORS.sageLight,
    activeBackground: COLORS.sageValue,
    shadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
  },
  danger: {
    background: COLORS.dangerSoft,
    border: COLORS.dangerBorder,
    color: COLORS.danger,
    hoverBackground: "#FECACA",
    activeBackground: "#FCA5A5",
    shadow: "0 1px 3px rgba(153, 27, 27, 0.08)",
  },
  ghost: {
    background: "transparent",
    border: "transparent",
    color: COLORS.text,
    hoverBackground: COLORS.sageLight,
    activeBackground: COLORS.sageValue,
    shadow: "none",
  },
};

const ICONS = {
  plus: "+",
  check: "v",
  close: "x",
  trash: "del",
  filter: "=",
  chevronRight: ">",
  chevronDown: "v",
};

function resolveIcon(icon) {
  if (!icon) return null;
  return ICONS[icon] || icon;
}

export function CompanionButton({
  children,
  variant = "secondary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  style,
  onClick,
  ...rest
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.secondary;
  const isDisabled = disabled || loading;
  const background = isDisabled
    ? "#F3F4F6"
    : isActive
      ? variantStyle.activeBackground
      : isHovered
        ? variantStyle.hoverBackground
        : variantStyle.background;
  const color = isDisabled ? "#9CA3AF" : variantStyle.color;
  const leftIcon = loading ? "..." : resolveIcon(icon);
  const rightIcon = resolveIcon(iconRight);

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        width: fullWidth ? "100%" : undefined,
        minHeight: sizeStyle.minHeight,
        minWidth: size === "sm" ? 34 : 42,
        boxSizing: "border-box",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        borderRadius: sizeStyle.borderRadius,
        border: `1px solid ${isDisabled ? "#D1D5DB" : variantStyle.border}`,
        background,
        color,
        boxShadow: isDisabled ? "none" : variantStyle.shadow,
        fontFamily: FONT_STACK,
        fontSize: sizeStyle.fontSize,
        fontWeight: 800,
        lineHeight: 1.1,
        textAlign: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.85 : 1,
        transition:
          "background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 80ms ease",
        transform: isActive && !isDisabled ? "translateY(1px)" : "none",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      {...rest}
    >
      {leftIcon ? (
        <span aria-hidden="true" style={{ lineHeight: 1, fontWeight: 900 }}>
          {leftIcon}
        </span>
      ) : null}
      <span>{loading ? "Laden" : children}</span>
      {rightIcon ? (
        <span aria-hidden="true" style={{ lineHeight: 1, fontWeight: 900 }}>
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}

export default CompanionButton;
