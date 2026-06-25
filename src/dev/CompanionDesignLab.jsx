import React, { useState } from "react";
import { CompanionDateTimePicker } from "../ui/pickers/CompanionDateTimePicker";
import { CompanionModalShell } from "../ui/modals/CompanionModalShell";

const colors = {
  sage: "#6D9F71",
  sageDark: "#4F7D55",
  sageSoft: "#A7CFAF",
  sageVeryLight: "#EAF3EC",
  sageValue: "#EEF7F0",
  sageBorder: "#C9DDCE",
  teal: "#6AAEAA",
  tealSoft: "#EEF8F7",
  blue: "#9CB7D6",
  blueSoft: "#F1F6FB",
  linen: "#E8DCC8",
  linenSoft: "#FAF7F0",
  text: "#1F2933",
  muted: "#6B7280",
  app: "#FAFBFA",
  card: "#FFFFFF",
};

const fontStack =
  '"Segoe UI", "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

const sectionStyle = {
  background: colors.card,
  border: `1px solid ${colors.sageBorder}`,
  borderRadius: 24,
  padding: 20,
  boxShadow: "0 14px 36px rgba(31, 41, 51, 0.08)",
};

const gridStyle = {
  display: "grid",
  gap: 14,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

function Section({ title, children }) {
  return (
    <section style={sectionStyle}>
      <h2
        style={{
          margin: "0 0 14px",
          color: colors.text,
          fontSize: 22,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ name, value, background }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        background: colors.card,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 82, background }} />
      <div style={{ padding: 12 }}>
        <div style={{ color: colors.text, fontWeight: 900 }}>{name}</div>
        <div style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function DemoButton({
  variant,
  children,
  large = false,
  small = false,
  onClick,
}) {
  const styles = {
    primary: {
      background: colors.sage,
      border: `1px solid ${colors.sage}`,
      color: "#ffffff",
    },
    secondary: {
      background: colors.sageVeryLight,
      border: `1px solid ${colors.sageBorder}`,
      color: colors.text,
    },
    ghost: {
      background: "transparent",
      border: "1px solid transparent",
      color: colors.text,
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: large ? 56 : small ? 34 : 44,
        padding: large ? "14px 20px" : small ? "6px 10px" : "10px 14px",
        borderRadius: large ? 18 : 999,
        fontSize: small ? 13 : 15,
        fontWeight: 900,
        cursor: "pointer",
        boxShadow:
          variant === "primary" ? "0 8px 20px rgba(109, 159, 113, 0.22)" : "none",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}

function DemoCard({ title, children, tone = "basic" }) {
  const toneStyle =
    tone === "highlight"
      ? { background: colors.sageVeryLight, border: `1px solid ${colors.sageBorder}` }
      : tone === "alert"
        ? { background: colors.sageValue, border: "1px solid #D8E7DB" }
        : { background: colors.card, border: "1px solid #e5e7eb" };

  return (
    <div
      style={{
        borderRadius: 20,
        padding: 16,
        boxShadow: "0 10px 24px rgba(31, 41, 51, 0.07)",
        ...toneStyle,
      }}
    >
      <div style={{ color: colors.text, fontWeight: 900, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ color: colors.muted, lineHeight: 1.45, fontSize: 14 }}>
        {children}
      </div>
    </div>
  );
}

export function CompanionDesignLab() {
  const [dateValue, setDateValue] = useState("2026-06-24");
  const [timeValue, setTimeValue] = useState("08:30");
  const [dateTimeValue, setDateTimeValue] = useState("2026-06-24T08:30");
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);

  return (
    <main
      style={{
        display: "grid",
        gap: 18,
        background: colors.app,
        color: colors.text,
        fontFamily: fontStack,
      }}
    >
      <header style={sectionStyle}>
        <div
          style={{
            color: colors.sageDark,
            fontSize: 12,
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Foundation sandbox
        </div>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.05 }}>
          Companion Design Lab
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            color: colors.muted,
            fontSize: 16,
            lineHeight: 1.5,
            maxWidth: 760,
          }}
        >
          Een veilige plek om visuele keuzes te bekijken zonder echte
          app-features of data te raken.
        </p>
      </header>

      <Section title="Kleurpalet">
        <div style={gridStyle}>
          <Swatch name="Primary Sage" value="#6D9F71" background={colors.sage} />
          <Swatch name="Soft Sage" value="#A7CFAF" background={colors.sageSoft} />
          <Swatch
            name="Very Light Sage"
            value="#EAF3EC"
            background={colors.sageVeryLight}
          />
          <Swatch name="Soft Teal" value="#6AAEAA" background={colors.teal} />
          <Swatch name="Mist Blue" value="#9CB7D6" background={colors.blue} />
          <Swatch name="Sand / Linen" value="#E8DCC8" background={colors.linen} />
          <Swatch name="Text Dark Blue" value="#0F172A" background={colors.text} />
        </div>
      </Section>

      <Section title="Buttons">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <DemoButton variant="primary">Primary button</DemoButton>
          <DemoButton variant="secondary">Secondary button</DemoButton>
          <DemoButton variant="ghost">Ghost button</DemoButton>
          <DemoButton variant="secondary" small>
            Small button
          </DemoButton>
          <DemoButton variant="primary" large>
            Large touch button
          </DemoButton>
        </div>
      </Section>

      <Section title="Cards">
        <div style={gridStyle}>
          <DemoCard title="Basic Companion Card">
            Rustige basiskaart voor informatie, instellingen of kleine tools.
          </DemoCard>
          <DemoCard title="Highlight Card" tone="highlight">
            Zachte sagekaart voor positieve nadruk of actieve selectie.
          </DemoCard>
          <DemoCard title="Soft Alert Card" tone="alert">
            Lichte contextkaart voor aandacht zonder alarmgevoel.
          </DemoCard>
        </div>
      </Section>

      <Section title="Modals">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <DemoButton variant="secondary" onClick={() => setActiveModal("small")}>
            Kleine modal
          </DemoButton>
          <DemoButton variant="secondary" onClick={() => setActiveModal("medium")}>
            Medium modal
          </DemoButton>
          <DemoButton variant="secondary" onClick={() => setActiveModal("scroll")}>
            Scrollbare modal
          </DemoButton>
          <DemoButton variant="primary" onClick={() => setActiveModal("footer")}>
            Modal met footer
          </DemoButton>
        </div>
      </Section>

      <Section title="Pickers">
        <div
          style={{
            color: colors.muted,
            fontSize: 14,
            lineHeight: 1.45,
            marginBottom: 12,
          }}
        >
          De compacte v1 staat onderaan als app-weergave. De drie grote
          voorbeelden zijn design demo's voor visuele states.
        </div>
        <div style={gridStyle}>
          <CompanionDateTimePicker
            mode="date"
            label="Datum"
            value={dateValue}
            onChange={setDateValue}
            presentation="expanded"
          />
          <CompanionDateTimePicker
            mode="time"
            label="Tijd"
            value={timeValue}
            onChange={setTimeValue}
            presentation="expanded"
          />
          <CompanionDateTimePicker
            mode="datetime"
            label="Datum en tijd"
            value={dateTimeValue}
            onChange={setDateTimeValue}
            presentation="expanded"
          />
        </div>
        <div style={{ marginTop: 14 }}>
          <CompanionDateTimePicker
            mode="datetime"
            label="Compacte app-weergave"
            value={dateTimeValue}
            onChange={setDateTimeValue}
            compact
            contextItems={[]}
          />
        </div>
      </Section>

      <Section title="Typography">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>
            Page title
          </div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Section title</div>
          <div style={{ fontSize: 16, color: colors.text, lineHeight: 1.55 }}>
            Body text voor rustige uitleg, korte context en leesbare inhoud.
          </div>
          <div style={{ fontSize: 14, color: colors.muted, lineHeight: 1.45 }}>
            Muted helper text voor aanvullende informatie zonder te schreeuwen.
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: colors.muted,
              textTransform: "uppercase",
            }}
          >
            Small label
          </div>
        </div>
      </Section>

      <Section title="Contextruimte">
        <div style={gridStyle}>
          {[
            ["Laatste maaltijd", "Havermout · 08:10"],
            ["Geplande medicatie", "Creon bij lunch · 12:00"],
            ["Glucosemeting", "Laatste waarde 6.8 mmol/L"],
          ].map(([title, text]) => (
            <div
              key={title}
              style={{
                padding: 16,
                borderRadius: 20,
                background: colors.sageValue,
                border: `1px solid ${colors.sageBorder}`,
              }}
            >
              <div style={{ color: colors.text, fontWeight: 800 }}>{title}</div>
              <div
                style={{
                  color: colors.muted,
                  fontSize: 14,
                  lineHeight: 1.45,
                  marginTop: 4,
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CompanionModalShell
        open={activeModal === "small"}
        onClose={closeModal}
        title="Kleine modal"
        subtitle="Compacte bevestiging of korte uitleg."
        size="sm"
      >
        <div style={{ color: colors.text, lineHeight: 1.5 }}>
          Een kleine Companion modal voor korte beslissingen, heldere feedback
          of een compacte instelling.
        </div>
      </CompanionModalShell>

      <CompanionModalShell
        open={activeModal === "medium"}
        onClose={closeModal}
        title="Medium modal"
        subtitle="Basisformaat voor de meeste Companion dialogen."
        size="md"
      >
        <div style={{ display: "grid", gap: 12 }}>
          <DemoCard title="Rustige inhoud" tone="highlight">
            De shell houdt header, body en sluitknop consistent, terwijl de body
            vrij blijft voor feature-inhoud.
          </DemoCard>
          <DemoCard title="Veilige mobiele basis">
            De inhoud blijft binnen het scherm en kan intern scrollen wanneer
            dat nodig is.
          </DemoCard>
        </div>
      </CompanionModalShell>

      <CompanionModalShell
        open={activeModal === "scroll"}
        onClose={closeModal}
        title="Lange scrollbare inhoud"
        subtitle="De body scrollt binnen de modal."
        size="md"
      >
        <div style={{ display: "grid", gap: 10 }}>
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              style={{
                padding: 12,
                borderRadius: 14,
                background: colors.sageValue,
                border: `1px solid ${colors.sageBorder}`,
                color: colors.text,
                lineHeight: 1.4,
              }}
            >
              Scroll item {index + 1}: voorbeeldinhoud voor langere lijsten,
              instellingen of context rond een gezondheidsmoment.
            </div>
          ))}
        </div>
      </CompanionModalShell>

      <CompanionModalShell
        open={activeModal === "footer"}
        onClose={closeModal}
        title="Modal met footer"
        subtitle="Acties blijven gescheiden van de inhoud."
        size="lg"
        footer={
          <>
            <DemoButton variant="ghost" small onClick={closeModal}>
              Annuleren
            </DemoButton>
            <DemoButton variant="primary" small onClick={closeModal}>
              Opslaan
            </DemoButton>
          </>
        }
      >
        <div style={{ color: colors.text, lineHeight: 1.55 }}>
          Footer-acties krijgen een vaste, rustige plek onderaan. Dit is bedoeld
          voor toekomstige formulieren, bevestigingen en begeleide workflows.
        </div>
      </CompanionModalShell>
    </main>
  );
}

export default CompanionDesignLab;
