import React from "react";
import { DashboardTab } from "./DashboardTab";
import { QuickAddSection } from "./QuickAddSection";
import {
  getIsMobileViewport,
  WorkspaceSection,
} from "./WorkspaceFoundation";

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
    control: "Controle / totaal",
    timeline: "Zet op tijdlijn",
    analysis: "Analyse / notities",
  },
  supplements: {
    title: "Supplementen",
    existing: "Mijn supplementen",
    routines: "Favorieten / routines",
    quick: "Snel supplement kiezen",
    workspace: "Supplementen voor dit moment",
    control: "Controle / totaal",
    timeline: "Zet op tijdlijn",
    analysis: "Analyse / notities",
  },
  strength: {
    title: "Krachttraining",
    existing: "Trainingsschema's",
    routines: "Favorieten / routines",
    quick: "Snel oefening kiezen",
    workspace: "Training samenstellen",
    control: "Controle / totaal",
    timeline: "Zet op tijdlijn",
    analysis: "Analyse / notities",
  },
  medicine: {
    title: "Medicijnen",
    existing: "Mijn medicijnen",
    routines: "Favorieten / routines",
    quick: "Snel medicijn kiezen",
    workspace: "Medicatie voor dit moment",
    control: "Controle / totaal",
    timeline: "Zet op tijdlijn",
    analysis: "Analyse / notities",
  },
};

const workspaceSections = [
  { key: "existing", accent: "#7c3aed", compact: true },
  { key: "routines", accent: "#ea580c", compact: true },
  { key: "quick", accent: "#16a34a" },
  { key: "workspace", accent: "#2563eb" },
  { key: "control", accent: "#0f766e" },
  { key: "analysis", accent: "#0284c7" },
];

const placeholderRows = {
  existing: ["Eigen lijst", "Later te vullen"],
  routines: ["Veelgebruikte keuzes", "Routinebasis"],
  quick: ["Zoeken", "Snel toevoegen"],
  workspace: ["Werkruimte", "Voor dit moment"],
  control: ["Samenvatting", "Nog geen totaal"],
  timeline: ["Nog geen actie"],
  analysis: ["Notities", "Analyse volgt later"],
};

function getIsMobile() {
  return getIsMobileViewport();
}

export function ComposeSubnavigation({
  activeLibraryTab,
  setActiveLibraryTab,
  buttonStyle,
  primaryButtonStyle,
}) {
  const isMobile = getIsMobile();
  const activeTab =
    libraryTabs.find((tab) => tab.id === activeLibraryTab) || libraryTabs[0];

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        padding: "0 4px",
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 0,
        marginBottom: 0,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#f8fafc",
        boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
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
              minHeight: isMobile ? 28 : 26,
              padding: isMobile ? "4px 8px" : "3px 9px",
              borderRadius: 6,
              border: `1px solid ${isActive ? tab.color : "#cbd5e1"}`,
              background: isActive ? tab.color : "#ffffff",
              color: isActive ? "#ffffff" : "#334155",
              fontSize: 11,
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

function PlaceholderSection({
  section,
  config,
  cardStyle,
  buttonStyle,
}) {
  const isMobile = getIsMobile();
  const rows =
    section.key === "timeline"
      ? [...placeholderRows.timeline, config.timeline]
      : placeholderRows[section.key];

  return (
    <WorkspaceSection
      title={config[section.key]}
      accent={section.accent}
      compact={section.compact}
    >
      <div
        style={{
          ...cardStyle,
          minHeight: section.compact ? 72 : 92,
          padding: isMobile ? 10 : 12,
          borderTop: `3px solid ${section.accent}`,
          display: "grid",
          alignContent: "start",
          gap: 9,
        }}
      >
        {rows.map((row) => (
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
                background: section.accent,
                opacity: 0.45,
                flex: "0 0 auto",
              }}
            />
            {row}
          </div>
        ))}

        {section.key === "timeline" && (
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
              border: `1px solid ${section.accent}`,
              color: section.accent,
              fontSize: 12,
              cursor: "not-allowed",
            }}
          >
            {config.timeline}
          </button>
        )}
      </div>
    </WorkspaceSection>
  );
}

function PlaceholderWorkspace({ activeTab, cardStyle, buttonStyle }) {
  const isMobile = getIsMobile();
  const config = workspaceConfigs[activeTab.id] || workspaceConfigs.meals;

  return (
    <div
      style={{
        display: "grid",
        gap: isMobile ? 10 : 14,
      }}
    >
      <QuickAddSection
        addCurrentMealToSelectedDay={() =>
          window.alert(`${config.timeline} volgt later.`)
        }
        cardStyle={cardStyle}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1.35fr 0.85fr" : "1fr",
          gap: isMobile ? 4 : 14,
          alignItems: "start",
        }}
      >
        {workspaceSections.slice(0, 2).map((section) => (
          <PlaceholderSection
            key={section.key}
            section={section}
            config={config}
            cardStyle={cardStyle}
            buttonStyle={buttonStyle}
          />
        ))}
      </div>

      {workspaceSections.slice(2).map((section) => (
        <PlaceholderSection
          key={section.key}
          section={section}
          config={config}
          cardStyle={cardStyle}
          buttonStyle={buttonStyle}
        />
      ))}
    </div>
  );
}

export function LibrariesTab({
  activeLibraryTab,
  dashboardProps,
  cardStyle,
  buttonStyle,
}) {
  const isMobile = getIsMobile();
  const activeTab =
    libraryTabs.find((tab) => tab.id === activeLibraryTab) || libraryTabs[0];

  return (
    <div
      style={{
        display: "grid",
        gap: isMobile ? 6 : 8,
      }}
    >
      <div
        style={{
          display: "grid",
          gap: isMobile ? 8 : 10,
        }}
      >
        {activeTab.id === "meals" ? (
          <DashboardTab {...dashboardProps} />
        ) : (
          <PlaceholderWorkspace
            activeTab={activeTab}
            cardStyle={cardStyle}
            buttonStyle={buttonStyle}
          />
        )}
      </div>
    </div>
  );
}
