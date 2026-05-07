export function CreonResultCard({ totals }) {
  if (!totals) return null;

  const enzymeLoad = totals.enzymeLoad ?? totals.effectiveFat ?? 0;
  const rawEnzymeLoad = totals.rawEnzymeLoad ?? enzymeLoad;

  const inputFat = totals.inputMacros?.fat ?? totals.fat ?? 0;
  const inputKh = totals.inputMacros?.kh ?? totals.kh ?? 0;
  const inputProtein = totals.inputMacros?.protein ?? totals.protein ?? 0;

  const creonMode = totals.usedFactors?.creonMode ?? totals.creonMode ?? "-";
  const creonGoal = totals.usedFactors?.creonGoal ?? totals.creonGoal ?? "-";
  const khFactor =
    totals.usedFactors?.khCreonFactor ?? totals.khCreonFactorUsed ?? 0;
  const proteinFactor =
    totals.usedFactors?.proteinCreonFactor ??
    totals.proteinCreonFactorUsed ??
    0;
  const proteinCorrection =
    totals.usedFactors?.proteinCorrection ?? totals.proteinCorrectionUsed ?? 0;
  const includeProteinGlucose =
    totals.usedFactors?.includeProteinGlucoseInCreon ??
    totals.includeProteinGlucoseInCreon ??
    false;

  const fatValue = Number(totals.fatContribution ?? 0);
  const khValue = Number(totals.khCreonContribution ?? 0);
  const proteinValue = Number(totals.proteinCreonContribution ?? 0);

  const contributions = [
    { key: "fat", label: "Vet", value: fatValue },
    { key: "kh", label: "KH", value: khValue },
    { key: "protein", label: "Eiwit", value: proteinValue },
  ].sort((a, b) => b.value - a.value);

  const max = contributions[0]?.value ?? 0;
  const second = contributions[1]?.value ?? 0;

  function getContributionMeta(value) {
    const numeric = Number(value ?? 0);

    if (numeric <= 0) {
      return {
        textColor: "#64748b",
        bgColor: "#f8fafc",
        borderColor: "#cbd5e1",
        badgeBg: "#e2e8f0",
        badgeText: "#475569",
        badgeLabel: "geen",
      };
    }

    if (numeric === max) {
      return {
        textColor: "#991b1b",
        bgColor: "#fef2f2",
        borderColor: "#fecaca",
        badgeBg: "#dc2626",
        badgeText: "#ffffff",
        badgeLabel: "dominant",
      };
    }

    if (numeric === second) {
      return {
        textColor: "#92400e",
        bgColor: "#fffbeb",
        borderColor: "#fde68a",
        badgeBg: "#f59e0b",
        badgeText: "#ffffff",
        badgeLabel: "midden",
      };
    }

    return {
      textColor: "#166534",
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
      badgeBg: "#16a34a",
      badgeText: "#ffffff",
      badgeLabel: "laag",
    };
  }

  function renderContributionRow(label, value, formulaText) {
    const meta = getContributionMeta(value);

    return (
      <div
        style={{
          border: `1px solid ${meta.borderColor}`,
          background: meta.bgColor,
          borderRadius: 10,
          padding: "8px 10px",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <div style={{ color: meta.textColor, fontWeight: 700 }}>
            {label}: <strong>{value ?? 0}</strong>
          </div>

          <span
            style={{
              background: meta.badgeBg,
              color: meta.badgeText,
              borderRadius: 999,
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.4,
              whiteSpace: "nowrap",
            }}
          >
            {meta.badgeLabel}
          </span>
        </div>

        {formulaText ? (
          <div style={{ color: "#64748b", fontSize: 12 }}>{formulaText}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        padding: 12,
        background: "#f8fafc",
        marginTop: 10,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <strong>Advies:</strong> {totals.best?.description || "0"}
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Eindbelasting:</strong> {enzymeLoad} g
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoer</div>
          <div>
            Vet: <strong>{inputFat}</strong> g
          </div>
          <div>
            KH: <strong>{inputKh}</strong> g
          </div>
          <div>
            Eiwit: <strong>{inputProtein}</strong> g
          </div>

          <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 6 }}>
            Gebruikte instellingen
          </div>
          <div>
            Mode: <strong>{creonMode}</strong>
          </div>
          <div>
            Doel: <strong>{creonGoal}</strong>
          </div>
          <div>
            KH-factor: <strong>{khFactor}</strong>
          </div>
          <div>
            Eiwit-factor: <strong>{proteinFactor}</strong>
          </div>
          <div>
            Eiwit→glucose-factor: <strong>{proteinCorrection}</strong>
          </div>
          <div>
            Eiwit→glucose meenemen:{" "}
            <strong>{includeProteinGlucose ? "ja" : "nee"}</strong>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Berekening</div>

          {renderContributionRow(
            "Vetbijdrage",
            totals.fatContribution ?? 0,
            null,
          )}

          {renderContributionRow(
            "KH-bijdrage",
            totals.khCreonContribution ?? 0,
            `${inputKh} × ${khFactor}`,
          )}

          {renderContributionRow(
            "Eiwitbijdrage",
            totals.proteinCreonContribution ?? 0,
            `${inputProtein} × ${proteinFactor}`,
          )}

          {(totals.proteinGlucoseContribution ?? 0) > 0 && (
            <div
              style={{
                border: "1px solid #dbeafe",
                background: "#eff6ff",
                borderRadius: 10,
                padding: "8px 10px",
                marginBottom: 8,
              }}
            >
              <div style={{ color: "#1d4ed8", fontWeight: 700 }}>
                Eiwit→glucose:{" "}
                <strong>{totals.proteinGlucoseContribution}</strong>
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                {inputProtein} × {proteinCorrection}
              </div>
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            Voorlopige belasting: <strong>{rawEnzymeLoad}</strong>
          </div>

          {totals.needsLightMealSupport && (
            <div
              style={{
                marginTop: 10,
                padding: 8,
                borderRadius: 8,
                background: "#fef3c7",
                fontSize: 12,
              }}
            >
              <div>
                <strong>Lichte maaltijd-regel actief</strong>
              </div>
              <div>Reden: {totals.lightMealReason}</div>
              <div>Minimum toegepast: {totals.lightMealMinEnzymeLoad}</div>
            </div>
          )}

          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            Kleur: groen = laag • oranje = midden • rood = dominant
          </div>

          <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 6 }}>
            Capsulekeuze
          </div>
          <div>
            Dekking: <strong>{totals.best?.covered ?? 0}</strong>
          </div>
          <div>
            Overdekking: <strong>{totals.best?.over ?? 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
