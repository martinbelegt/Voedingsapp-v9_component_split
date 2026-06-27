import React from "react";
import { DashboardTab } from "./DashboardTab";

const libraryTabs = [
  { id: "meals", label: "Maaltijden", color: "#2563eb" },
  { id: "supplements", label: "Supplementen", color: "#7c3aed" },
  { id: "strength", label: "Krachttraining", color: "#0f766e" },
];

const workspaceSteps = [
  "Bestaande keuzes",
  "Snel kiezen",
  "Samenstellen",
  "Zet op tijdlijn",
  "Controle / totaal",
  "Analyse / notities",
];

function WorkspacePlaceholder({ title, color, cardStyle, buttonStyle }) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  return (
    <div style={{ display: "grid", gap: isMobile ? 8 : 12 }}>
      <div
        style={{
          ...cardStyle,
          borderLeft: `4px solid ${color}`,
          display: "grid",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: isMobile ? 18 : 22,
              color: "#0f172a",
              fontWeight: 950,
            }}
          >
            {title}
          </h2>
          <button
            type="button"
            disabled
            style={{
              ...buttonStyle,
              borderRadius: 999,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#64748b",
              cursor: "not-allowed",
            }}
          >
            Zet op tijdlijn
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(3, minmax(0, 1fr))",
          gap: isMobile ? 8 : 12,
        }}
      >
        {workspaceSteps.map((step) => (
          <div
            key={step}
            style={{
              ...cardStyle,
              minHeight: 96,
              display: "grid",
              alignContent: "start",
              gap: 8,
              borderTop: `3px solid ${color}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 950,
                color,
              }}
            >
              {step}
            </div>
            <div
              style={{
                height: 8,
                width: "42%",
                borderRadius: 999,
                background: "#e2e8f0",
              }}
            />
            <div
              style={{
                height: 8,
                width: "70%",
                borderRadius: 999,
                background: "#f1f5f9",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LibrariesTab({
  activeLibraryTab,
  setActiveLibraryTab,
  dashboardProps,
  cardStyle,
  buttonStyle,
  primaryButtonStyle,
}) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);
  const activeTab =
    libraryTabs.find((tab) => tab.id === activeLibraryTab) || libraryTabs[0];

  return (
    <div style={{ display: "grid", gap: isMobile ? 8 : 12 }}>
      <div
        style={{
          ...cardStyle,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          padding: isMobile ? 8 : cardStyle.padding,
        }}
      >
        {libraryTabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveLibraryTab(tab.id)}
              style={{
                ...(isActive ? primaryButtonStyle : buttonStyle),
                flex: "0 0 auto",
                borderRadius: 999,
                border: `1px solid ${tab.color}`,
                background: isActive ? tab.color : "#ffffff",
                color: isActive ? "#ffffff" : tab.color,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab.id === "meals" && <DashboardTab {...dashboardProps} />}

      {activeTab.id === "supplements" && (
        <WorkspacePlaceholder
          title="Supplementen"
          color={activeTab.color}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />
      )}

      {activeTab.id === "strength" && (
        <WorkspacePlaceholder
          title="Krachttraining"
          color={activeTab.color}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />
      )}
    </div>
  );
}
