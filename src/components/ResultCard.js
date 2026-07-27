import React, { useState } from "react";
import { CreonResultCard } from "../CreonResultCard";
import {
  getMealInterpretation,
  getMealFlags,
} from "../services/mealAnalysisService";

export function ResultCard({
  totals,
  rowsWithCalc,
  buttonStyle = {},
  forceDetailOpen = false,
  onForceClose,
}) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const [open, setOpen] = useState(!isMobile);
  const [showResultDetail, setShowResultDetail] = useState(false);

  const mealFlags = getMealFlags(totals);

  const compactBox = {
    borderRadius: 10,
    padding: "8px 10px",
    border: "1px solid #e2e8f0",
    background: "white",
    minHeight: 56,
  };

  const labelStyleMini = {
    fontSize: 11,
    fontWeight: 800,
    marginBottom: 5,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  };

  const valueStyleMini = {
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 1.35,
  };

  function getMacroStyle(level) {
    switch (level) {
      case "high":
        return { color: "#dc2626", fontWeight: 800 };
      case "medium":
        return { color: "#f59e0b", fontWeight: 700 };
      case "low":
        return { color: "#16a34a", fontWeight: 700 };
      default:
        return { color: "#64748b" };
    }
  }

  const mobileCompactResult = null;

  return (
    <>
      {isMobile ? (
        mobileCompactResult
      ) : (
        <div
          style={{
            border: "1px solid #94a3b8",
            borderRadius: 14,
            padding: 10,
            background: "#f1f5f9",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: open ? 8 : 0,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#0f172a",
              }}
            >
              Maaltijdresultaat
            </div>
          </div>

          {open && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
                gap: 8,
                alignItems: "stretch",
              }}
            >
              <div style={{ ...compactBox, borderTop: "3px solid #1d4ed8" }}>
                <div style={{ ...labelStyleMini, color: "#1d4ed8" }}>
                  Macro&apos;s / energie
                </div>
                <div style={valueStyleMini}>
                  <div style={getMacroStyle(totals.enzymeColorMap?.kh)}>
                    <strong>KH:</strong> {totals.kh} g
                  </div>
                  <div style={getMacroStyle(totals.enzymeColorMap?.protein)}>
                    <strong>Eiwit:</strong> {totals.protein} g
                  </div>
                  <div>
                    <strong>Vet:</strong> {totals.fat} g ·{" "}
                    <strong>{totals.kcal}</strong> kcal
                  </div>
                </div>
              </div>

              <div style={{ ...compactBox, borderTop: "3px solid #7c3aed" }}>
                <div style={{ ...labelStyleMini, color: "#7c3aed" }}>
                  Insulineadvies
                </div>
                <div
                  style={{ ...valueStyleMini, fontSize: 16, fontWeight: 800 }}
                >
                  {totals.insulin} E
                </div>
              </div>

              <div style={{ ...compactBox, borderTop: "3px solid #0891b2" }}>
                <div style={{ ...labelStyleMini, color: "#0891b2" }}>
                  Timing / GI
                </div>
                <div style={valueStyleMini}>
                  <div>
                    <strong>Timing:</strong> {totals.personalTimingAdvice}
                  </div>
                  <div>
                    <strong>GI:</strong> {totals.mealGiLabel}
                  </div>
                </div>
              </div>

              <div
                style={{
                  ...compactBox,
                  borderTop: "3px solid #166534",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div style={{ ...labelStyleMini, color: "#166534" }}>Creon</div>
                <div style={valueStyleMini}>
                  <div>
                    <strong>Advies:</strong> {totals.best?.c25 || 0} x 25k +{" "}
                    {totals.best?.c10 || 0} x 10k
                  </div>
                  <div>
                    <strong>Dominant:</strong> {totals.dominantEnzymeLabel}
                  </div>
                  <div>
                    <strong>Load:</strong> {totals.enzymeLoad}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(showResultDetail || forceDetailOpen) && (
        <div
          onClick={() => {
            if (onForceClose) {
              onForceClose();
            } else {
              setShowResultDetail(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? 10 : 20,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1000px, 96vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: isMobile ? 10 : 18,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: isMobile ? 10 : 20,
              border: "1px solid #cbd5e1",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: isMobile ? 8 : 16,
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? 16 : 20,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                🍽 Maaltijdanalyse
              </div>

              <button
                onClick={() => {
                  if (onForceClose) {
                    onForceClose();
                  } else {
                    setShowResultDetail(false);
                  }
                }}
                style={{
                  border: "1px solid #94a3b8",
                  borderRadius: 8,
                  padding: isMobile ? "5px 8px" : "8px 12px",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: isMobile ? 12 : undefined,
                }}
              >
                Sluiten
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(320px, 1fr))",
                gap: isMobile ? 8 : 16,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  padding: isMobile ? 8 : 14,
                  borderRadius: isMobile ? 6 : 14,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: isMobile ? 6 : 10,
                    fontSize: isMobile ? 14 : undefined,
                  }}
                >
                  Samenvatting
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr",
                    gap: isMobile ? 3 : 6,
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  <div>
                    <strong>KH:</strong> {totals.kh} g
                  </div>
                  <div>
                    <strong>Eiwit:</strong> {totals.protein} g
                  </div>
                  <div>
                    <strong>Vet:</strong> {totals.fat} g
                  </div>
                  <div>
                    <strong>Kcal:</strong> {totals.kcal}
                  </div>
                  <div>
                    <strong>Insulineadvies:</strong> {totals.insulin} E
                  </div>
                  <div>
                    <strong>Timing:</strong> {totals.personalTimingAdvice}
                  </div>
                  <div>
                    <strong>GI:</strong> {totals.mealGiLabel}
                  </div>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #bbf7d0",
                  borderRadius: isMobile ? 6 : 14,
                  padding: isMobile ? 8 : 14,
                  background: "#f0fdf4",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: isMobile ? 6 : 10,
                    fontSize: isMobile ? 14 : undefined,
                  }}
                >
                  Creon-analyse
                </div>

                {isMobile ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 3,
                      fontSize: 12,
                      color: "#14532d",
                    }}
                  >
                    <div>
                      <strong>Advies:</strong> {totals.best?.c25 || 0} x 25k +{" "}
                      {totals.best?.c10 || 0} x 10k
                    </div>

                    <div>
                      <strong>Vetbelasting:</strong> {totals.fat} g
                    </div>

                    <div>
                      <strong>Dominant:</strong> {totals.dominantEnzymeLabel}
                    </div>

                    <div>
                      <strong>Load:</strong> {totals.enzymeLoad}
                    </div>
                  </div>
                ) : (
                  <CreonResultCard totals={totals} />
                )}

                <div
                  style={{
                    marginTop: isMobile ? 8 : 16,
                    borderTop: "1px solid #d1fae5",
                    paddingTop: isMobile ? 8 : 12,
                    fontSize: isMobile ? 12 : 14,
                    color: "#14532d",
                    display: "grid",
                    gap: isMobile ? 4 : 6,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Korte interpretatie</div>

                  <div>{getMealInterpretation(totals)}</div>

                  {mealFlags.needsLightMealSupport && (
                    <div>
                      Lichte maaltijd-ondersteuning was actief. Dat betekent dat
                      de app extra rekening hield met KH/eiwit ondanks lage
                      vetbelasting.
                    </div>
                  )}

                  {mealFlags.hasDelayedCarbs && (
                    <div>
                      Er zitten producten met vertraagde opname in deze
                      maaltijd: <strong>{mealFlags.delayedItemsText}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: isMobile ? 6 : 14,
                  padding: isMobile ? 8 : 14,
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    marginBottom: isMobile ? 6 : 10,
                    fontSize: isMobile ? 14 : undefined,
                  }}
                >
                  Producten in deze maaltijd
                </div>

                <div style={{ display: "grid", gap: isMobile ? 4 : 8 }}>
                  {(rowsWithCalc || [])
                    .filter((r) => r.product)
                    .map((r, idx) => (
                      <div
                        key={r.id || idx}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: isMobile ? 4 : 10,
                          padding: isMobile ? 6 : 10,
                          background: "white",
                          fontSize: isMobile ? 11 : 13,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{r.product.name}</div>
                        <div style={{ color: "#475569", marginTop: 4 }}>
                          {r.grams} g • KH {r.kh} • Eiwit {r.protein} • Vet{" "}
                          {r.fat}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
