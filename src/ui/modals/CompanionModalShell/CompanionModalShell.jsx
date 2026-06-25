import React, { useEffect } from "react";
import { createPortal } from "react-dom";

const COLORS = {
  sage: "#6D9F71",
  sageDark: "#4F7D55",
  sageVeryLight: "#EAF3EC",
  sageValue: "#EEF7F0",
  border: "#C9DDCE",
  text: "#0F172A",
  muted: "#6B7280",
  card: "#FFFFFF",
};

const FONT_STACK =
  '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const SIZE_WIDTHS = {
  sm: 380,
  md: 560,
  lg: 760,
};

function getWidth(size) {
  return SIZE_WIDTHS[size] || SIZE_WIDTHS.md;
}

export function CompanionModalShell({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  footer,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const modal = (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        display: "grid",
        placeItems: "center",
        padding: "max(16px, env(safe-area-inset-top)) 12px max(16px, env(safe-area-inset-bottom))",
        background: "rgba(15, 23, 42, 0.28)",
        boxSizing: "border-box",
        fontFamily: FONT_STACK,
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title || "Companion modal"}
        style={{
          width: "min(100%, calc(100vw - 24px))",
          maxWidth: getWidth(size),
          maxHeight: "min(88vh, calc(100vh - 32px))",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          overflow: "hidden",
          borderRadius: 18,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.card,
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
          color: COLORS.text,
        }}
      >
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 34px",
            gap: 12,
            alignItems: "start",
            padding: "16px 16px 12px",
            borderBottom: "1px solid #E5EEE7",
            background: "linear-gradient(180deg, #FFFFFF 0%, #FAFDFA 100%)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title ? (
              <h2
                style={{
                  margin: 0,
                  color: COLORS.text,
                  fontSize: 20,
                  fontWeight: 850,
                  lineHeight: 1.18,
                }}
              >
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p
                style={{
                  margin: "5px 0 0",
                  color: COLORS.muted,
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            aria-label="Sluiten"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.sageVeryLight,
              color: COLORS.sageDark,
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </header>

        <div
          style={{
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
            background: COLORS.card,
          }}
        >
          {children}
        </div>

        {footer ? (
          <footer
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              flexWrap: "wrap",
              padding: "12px 16px 16px",
              borderTop: "1px solid #E5EEE7",
              background: COLORS.sageValue,
            }}
          >
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}

export default CompanionModalShell;
