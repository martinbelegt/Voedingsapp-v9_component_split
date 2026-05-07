import React, { useState } from "react";
import { CreonResultCard } from "../CreonResultCard";

export function ResultCard({ totals, rowsWithCalc }) {
  const [showResultDetail, setShowResultDetail] = useState(false);

  const cardBox = {
    borderRadius: 10,
    padding: 10,
    border: "1px solid #e2e8f0",
    background: "white",
    minHeight: 72,
  };

  const labelStyleMini = {
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 6,
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
        return { color: "#dc2626", fontWeight: 800 }; // rood
      case "medium":
        return { color: "#f59e0b", fontWeight: 700 }; // oranje
      case "low":
        return { color: "#16a34a", fontWeight: 700 }; // groen
      default:
        return { color: "#64748b" }; // grijs
    }
  }

  return (
    <>
      <div
        style={{
          border: "1px solid #94a3b8",
          borderRadius: 14,
          padding: 12,
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
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: "#0f172a",
            }}
          >
            Maaltijd resultaat
          </div>

          <button
            onClick={() => setShowResultDetail(true)}
            style={{
              border: "1px solid #94a3b8",
              borderRadius: 10,
              padding: "8px 12px",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Vergroot / analyse
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {/* LINKER KOLOM */}
          <div style={{ display: "grid", gap: 10 }}>
            {/* Macro's */}
            <div style={{ ...cardBox, borderTop: "3px solid #1d4ed8" }}>
              <div style={{ ...labelStyleMini, color: "#1d4ed8" }}>
                Macro&apos;s
              </div>
              <div style={valueStyleMini}>
                <div style={getMacroStyle(totals.enzymeColorMap?.kh)}>
                  <strong>KH:</strong> {totals.kh} g
                </div>

                <div style={getMacroStyle(totals.enzymeColorMap?.protein)}>
                  <strong>Eiwit:</strong> {totals.protein} g
                </div>
              </div>
            </div>

            {/* Energie */}
            <div style={{ ...cardBox, borderTop: "3px solid #b45309" }}>
              <div style={{ ...labelStyleMini, color: "#b45309" }}>Energie</div>
              <div style={valueStyleMini}>
                <div>
                  <strong>Vet:</strong> {totals.fat} g
                </div>
                <div>
                  <strong>Kcal:</strong> {totals.kcal}
                </div>
              </div>
            </div>

            {/* Insuline / timing / GI */}
            <div style={{ ...cardBox, borderTop: "3px solid #7c3aed" }}>
              <div style={{ ...labelStyleMini, color: "#7c3aed" }}>
                Insuline / timing / GI
              </div>
              <div style={valueStyleMini}>
                <div>
                  <strong>Insuline:</strong> {totals.insulin} E
                </div>
                <div>
                  <strong>Timing:</strong> {totals.personalTimingAdvice}
                </div>
                <div>
                  <strong>GI:</strong> {totals.mealGiLabel}
                </div>
              </div>
            </div>
          </div>

          {/* RECHTER KOLOM */}
          <div
            style={{
              ...cardBox,
              borderTop: "3px solid #166534",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
            }}
          >
            <div style={{ ...labelStyleMini, color: "#166534" }}>Creon</div>
            <div style={valueStyleMini}>
              <CreonResultCard totals={totals} />
            </div>
          </div>
        </div>
      </div>

      {showResultDetail && (
        <div
          onClick={() => setShowResultDetail(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
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
              borderRadius: 18,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              padding: 20,
              border: "1px solid #cbd5e1",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
                Uitgebreide maaltijdanalyse
              </div>

              <button
                onClick={() => setShowResultDetail(false)}
                style={{
                  border: "1px solid #94a3b8",
                  borderRadius: 10,
                  padding: "8px 12px",
                  background: "#f8fafc",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Sluiten
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 16,
                alignItems: "start",
              }}
            >
              {/* Linker blok */}
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 10 }}>
                  Samenvatting
                </div>

                <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
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
                    <strong>Insuline:</strong> {totals.insulin} E
                  </div>
                  <div>
                    <strong>Timing:</strong> {totals.personalTimingAdvice}
                  </div>
                  <div>
                    <strong>GI:</strong> {totals.mealGiLabel}
                  </div>
                </div>

                <div
                  style={{ fontWeight: 800, marginTop: 16, marginBottom: 10 }}
                >
                  Producten in deze maaltijd
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {(rowsWithCalc || [])
                    .filter((r) => r.product)
                    .map((r, idx) => (
                      <div
                        key={r.id || idx}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: 10,
                          background: "white",
                          fontSize: 13,
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

              {/* Rechter blok */}
              <div
                style={{
                  border: "1px solid #bbf7d0",
                  borderRadius: 14,
                  padding: 14,
                  background: "#f0fdf4",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 10 }}>
                  Creon-analyse
                </div>

                <CreonResultCard totals={totals} />

                <div
                  style={{
                    marginTop: 16,
                    borderTop: "1px solid #d1fae5",
                    paddingTop: 12,
                    fontSize: 14,
                    color: "#14532d",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Korte interpretatie</div>

                  <div>
                    {totals.fat > totals.kh && totals.fat > totals.protein
                      ? "Deze maaltijd lijkt vooral vet-gedreven. Creon wordt hier waarschijnlijk vooral door vetbelasting bepaald."
                      : totals.protein > totals.fat &&
                          totals.protein > totals.kh
                        ? "Deze maaltijd lijkt relatief eiwit-zwaar. Let mogelijk ook op latere glucose-invloed."
                        : totals.kh > totals.fat && totals.kh > totals.protein
                          ? "Deze maaltijd lijkt relatief KH-zwaar. Timing en GI kunnen hier extra belangrijk zijn."
                          : "Deze maaltijd heeft een gemengd profiel. De uitkomst is gebaseerd op meerdere bijdragen tegelijk."}
                  </div>

                  {totals.needsLightMealSupport && (
                    <div>
                      Lichte maaltijd-ondersteuning was actief. Dat betekent dat
                      de app extra rekening hield met KH/eiwit ondanks lage
                      vetbelasting.
                    </div>
                  )}

                  {totals.mealHasDelayedCarbs && (
                    <div>
                      Er zitten producten met vertraagde opname in deze
                      maaltijd: <strong>{totals.delayedItemsText}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
