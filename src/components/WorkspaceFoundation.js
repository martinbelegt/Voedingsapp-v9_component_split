import React from "react";

export function getIsMobileViewport() {
  return (
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent)
  );
}

export function WorkspaceSection({
  title,
  children,
  accent = "#2563eb",
  compact,
}) {
  const isMobile = getIsMobileViewport();

  return (
    <section
      style={{
        display: "grid",
        gap: isMobile ? 6 : 8,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: compact ? 22 : 26,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 7,
            background: accent,
            flex: "0 0 auto",
          }}
        />
        <h3
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: compact || isMobile ? 13 : 15,
            fontWeight: 950,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

