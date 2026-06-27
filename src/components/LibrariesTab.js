import React from "react";
import { DashboardTab } from "./DashboardTab";

const libraryTabs = [
  { id: "meals", label: "Maaltijden", color: "#2563eb" },
  { id: "supplements", label: "Supplementen", color: "#7c3aed" },
  { id: "strength", label: "Krachttraining", color: "#0f766e" },
  { id: "medicine", label: "Medicijnen", color: "#be123c" },
];

const workspaceConfigs = {
  meals: {
    title: "Maaltijden",
    existing: "Standaardmaaltijden",
    routines: "Favorieten / routines",
    quick: "Snel product kiezen",
    workspace: "Maaltijd samenstellen",
    timeline: "Zet op tijdlijn",
    control: "Controle / totaal",
    analysis: "Analyse / notities",
  },
  supplements: {
    title: "Supplementen",
    existing: "Mijn supplementen",
    routines: "Favorieten / routines",
    quick: "Snel supplement kiezen",
    workspace: "Supplementen voor dit moment",
    timeline: "Zet op tijdlijn",
    control: "Controle / totaal",
    analysis: "Analyse / notities",
  },
  strength: {
    title: "Krachttraining",
    existing: "Trainingsschema's",
    routines: "Favorieten / routines",
    quick: "Snel oefening kiezen",
    workspace: "Training samenstellen",
    timeline: "Zet op tijdlijn",
    control: "Controle / totaal",
    analysis: "Analyse / notities",
  },
  medicine: {
    title: "Medicijnen",
    existing: "Mijn medicijnen",
    routines: "Favorieten / routines",
    quick: "Snel medicijn kiezen",
    workspace: "Medicatie voor dit moment",
    timeline: "Zet op tijdlijn",
    control: "Controle / totaal",
    analysis: "Analyse / notities",
  },
};

const foundationOrder = [
  "existing",
  "routines",
  "quick",
  "workspace",
  "timeline",
  "control",
  "analysis",
];

function getIsMobile() {
  return (
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent)
  );
}

function LibraryTabStrip({
  activeTab,
  setActiveLibraryTab,
  buttonStyle,
  primaryButtonStyle,
}) {
  const isMobile = getIsMobile();

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        padding: 4,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#f8fafc",
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
              minHeight: isMobile ? 30 : 28,
              padding: isMobile ? "5px 9px" : "4px 10px",
              borderRadius: 6,
              border: `1px solid ${isActive ? tab.color : "#cbd5e1"}`,
              background: isActive ? tab.color : "#ffffff",
              color: isActive ? "#ffffff" : "#334155",
              fontSize: 12,
              lineHeight: 1.15,
              fontWeight: 850,
              whiteSpace: "nowrap",
              boxShadow: "none",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function FoundationRail({ config, color }) {
  const isMobile = getIsMobile();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "repeat(2, minmax(0, 1fr))"
          : "repeat(7, minmax(0, 1fr))",
        gap: 6,
      }}
    >
      {foundationOrder.map((key) => (
        <div
          key={key}
          style={{
            minHeight: isMobile ? 42 : 48,
            padding: "8px 9px",
            border: "1px solid #e2e8f0",
            borderTop: `2px solid ${color}`,
            borderRadius: 8,
            background: "#ffffff",
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            fontWeight: 850,
            lineHeight: 1.2,
          }}
        >
          {config[key]}
        </div>
      ))}
    </div>
  );
}

function FoundationWorkspace({
  activeTab,
  children,
  cardStyle,
  buttonStyle,
}) {
  const isMobile = getIsMobile();
  const config = workspaceConfigs[activeTab.id] || workspaceConfigs.meals;

  return (
    <div style={{ display: "grid", gap: isMobile ? 8 : 10 }}>
      <div
        style={{
          ...cardStyle,
          padding: isMobile ? 10 : 12,
          borderLeft: `3px solid ${activeTab.color}`,
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
              fontSize: isMobile ? 18 : 20,
              color: "#0f172a",
              fontWeight: 950,
            }}
          >
            {config.title}
          </h2>
          <button
            type="button"
            disabled
            style={{
              ...buttonStyle,
              minHeight: 30,
              padding: "5px 10px",
              borderRadius: 6,
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#64748b",
              fontSize: 12,
              cursor: "not-allowed",
            }}
          >
            {config.timeline}
          </button>
        </div>

        <FoundationRail config={config} color={activeTab.color} />
      </div>

      {children}
    </div>
  );
}

function WorkspaceFoundationPlaceholder({ activeTab, cardStyle, buttonStyle }) {
  const isMobile = getIsMobile();
  const config = workspaceConfigs[activeTab.id] || workspaceConfigs.meals;

  const panels = [
    {
      key: "existing",
      title: config.existing,
      rows: ["Eigen lijst", "Later te vullen"],
    },
    {
      key: "routines",
      title: config.routines,
      rows: ["Veelgebruikte keuzes", "Routinebasis"],
    },
    {
      key: "quick",
      title: config.quick,
      rows: ["Zoeken", "Snel toevoegen"],
    },
    {
      key: "workspace",
      title: config.workspace,
      rows: ["Werkruimte", "Voor dit moment"],
    },
    {
      key: "control",
      title: config.control,
      rows: ["Samenvatting", "Nog geen totaal"],
    },
    {
      key: "analysis",
      title: config.analysis,
      rows: ["Notities", "Analyse volgt later"],
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
        gap: isMobile ? 8 : 10,
      }}
    >
      {panels.map((panel) => (
        <div
          key={panel.key}
          style={{
            ...cardStyle,
            minHeight: 118,
            padding: isMobile ? 10 : 12,
            borderTop: `3px solid ${activeTab.color}`,
            display: "grid",
            alignContent: "start",
            gap: 9,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 950,
              color: "#0f172a",
            }}
          >
            {panel.title}
          </div>
          {panel.rows.map((row) => (
            <div
              key={row}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#64748b",
                fontSize: 12,
                fontWeight: 750,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  background: activeTab.color,
                  opacity: 0.45,
                  flex: "0 0 auto",
                }}
              />
              {row}
            </div>
          ))}
          {panel.key === "workspace" && (
            <button
              type="button"
              disabled
              style={{
                ...buttonStyle,
                justifySelf: "start",
                marginTop: 2,
                minHeight: 30,
                padding: "5px 10px",
                borderRadius: 6,
                background: "#ffffff",
                border: `1px solid ${activeTab.color}`,
                color: activeTab.color,
                fontSize: 12,
                cursor: "not-allowed",
              }}
            >
              {config.timeline}
            </button>
          )}
        </div>
      ))}
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
  const isMobile = getIsMobile();
  const activeTab =
    libraryTabs.find((tab) => tab.id === activeLibraryTab) || libraryTabs[0];

  return (
    <div style={{ display: "grid", gap: isMobile ? 8 : 10 }}>
      <LibraryTabStrip
        activeTab={activeTab}
        setActiveLibraryTab={setActiveLibraryTab}
        buttonStyle={buttonStyle}
        primaryButtonStyle={primaryButtonStyle}
      />

      <FoundationWorkspace
        activeTab={activeTab}
        cardStyle={cardStyle}
        buttonStyle={buttonStyle}
      >
        {activeTab.id === "meals" ? (
          <DashboardTab {...dashboardProps} />
        ) : (
          <WorkspaceFoundationPlaceholder
            activeTab={activeTab}
            cardStyle={cardStyle}
            buttonStyle={buttonStyle}
          />
        )}
      </FoundationWorkspace>
    </div>
  );
}
