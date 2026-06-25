import React, { useState } from "react";
import { CompanionDateTimePicker } from "../ui/pickers/CompanionDateTimePicker";

const colors = {
  amber: "#D89A3A",
  amberSoft: "#FFF4E0",
  amberBorder: "#F2C879",
  sage: "#8FAF87",
  sageSoft: "#F0F7EE",
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

const sectionStyle = {
  background: colors.card,
  border: "1px solid #edf0ed",
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

function DemoButton({ variant, children, large = false, small = false }) {
  const styles = {
    primary: {
      background: colors.amber,
      border: `1px solid ${colors.amber}`,
      color: "#ffffff",
    },
    secondary: {
      background: colors.amberSoft,
      border: `1px solid ${colors.amberBorder}`,
      color: "#8A5A16",
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
      style={{
        minHeight: large ? 56 : small ? 34 : 44,
        padding: large ? "14px 20px" : small ? "6px 10px" : "10px 14px",
        borderRadius: large ? 18 : 999,
        fontSize: small ? 13 : 15,
        fontWeight: 900,
        cursor: "pointer",
        boxShadow:
          variant === "primary" ? "0 8px 20px rgba(216, 154, 58, 0.22)" : "none",
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
      ? { background: colors.amberSoft, border: `1px solid ${colors.amberBorder}` }
      : tone === "alert"
        ? { background: colors.linenSoft, border: "1px solid #e7d7ba" }
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

  return (
    <main
      style={{
        display: "grid",
        gap: 18,
        background: colors.app,
        color: colors.text,
      }}
    >
      <header style={sectionStyle}>
        <div
          style={{
            color: colors.amber,
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
          <Swatch name="Warm Amber" value="#D89A3A" background={colors.amber} />
          <Swatch name="Sage Green" value="#8FAF87" background={colors.sage} />
          <Swatch name="Soft Teal" value="#6AAEAA" background={colors.teal} />
          <Swatch name="Mist Blue" value="#9CB7D6" background={colors.blue} />
          <Swatch name="Sand / Linen" value="#E8DCC8" background={colors.linen} />
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
            Zachte amberkaart voor positieve nadruk of actieve selectie.
          </DemoCard>
          <DemoCard title="Soft Alert Card" tone="alert">
            Warme, niet-schreeuwerige kaart voor context of aandacht.
          </DemoCard>
        </div>
      </Section>

      <Section title="Pickers">
        <div style={gridStyle}>
          <CompanionDateTimePicker
            mode="date"
            label="Datum"
            value={dateValue}
            onChange={setDateValue}
          />
          <CompanionDateTimePicker
            mode="time"
            label="Tijd"
            value={timeValue}
            onChange={setTimeValue}
          />
          <CompanionDateTimePicker
            mode="datetime"
            label="Datum en tijd"
            value={dateTimeValue}
            onChange={setDateTimeValue}
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
    </main>
  );
}

export default CompanionDesignLab;
