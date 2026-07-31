import React, { useState } from "react";

export function DailyTotalsCard({
  cardStyle,
  dayTotalTitle,
  selectedDate,
  dayTotalHint,
  maintenanceKcal,
  targetKcal,
  proteinGoal,
  proteinMealGoal,
  dayTotals,
  settings,
}) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const [open, setOpen] = useState(!isMobile);

  const gramsKhPerUnit = Number(settings?.gramsKhPerUnit) || 0;
  const calculatedInsulinFromKh =
    gramsKhPerUnit > 0 ? dayTotals.kh / gramsKhPerUnit : 0;

  const insulinDifference =
    Number(dayTotals.insulin || 0) - calculatedInsulinFromKh;

  return (
    <div
      style={{
        ...cardStyle,
        padding: isMobile ? "6px 8px" : 14,
        background: "#ecfdf5",
        border: "1px solid #86efac",
        boxShadow: "0 2px 6px rgba(22, 101, 52, 0.08)",
        marginBottom: isMobile ? 8 : undefined,
      }}
    >
      <div
        onClick={() => {
          if (isMobile) {
            setOpen((v) => !v);
          }
        }}
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          gap: 10,

          flexWrap: "wrap",

          marginBottom: open ? 10 : 0,

          cursor: isMobile ? "pointer" : "default",
        }}
      >
        <div
          onClick={() => isMobile && setOpen((v) => !v)}
          style={{
            fontWeight: 900,
            color: "#14532d",
            fontSize: isMobile ? 13 : 17,
            cursor: isMobile ? "pointer" : "default",
          }}
        >
          {dayTotalTitle} {isMobile ? (open ? "▲" : "▼") : ""}
        </div>

        <div style={{ fontSize: 12, color: "#166534", fontWeight: 700 }}>
          {selectedDate}
        </div>
      </div>

      {open && (
        <>
          <div
            style={{
              fontSize: 13,
              color: "#14532d",
              marginBottom: 10,
              lineHeight: 1.45,
              fontWeight: 700,
              background: "rgba(255,255,255,0.65)",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              padding: "7px 9px",
            }}
          >
            {dayTotalHint}

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#14532d",
                fontWeight: 800,
              }}
            >
              Onderhoud {maintenanceKcal} kcal · Dagdoel {targetKcal} kcal ·
              Eiwitdoel {proteinGoal} g · Min voeding {proteinMealGoal} g
            </div>

            {gramsKhPerUnit > 0 && (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: "1px solid #bbf7d0",
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#14532d",
                }}
              >
                Insulinecheck: KH {dayTotals.kh} g ÷ {gramsKhPerUnit} ={" "}
                {calculatedInsulinFromKh.toFixed(2)} E advies · toegediend{" "}
                {Number(dayTotals.insulin || 0).toFixed(2)} E · verschil{" "}
                {insulinDifference.toFixed(2)} E
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {[
              ["KH", `${dayTotals.kh} g`],
              ["Eiwit", `${dayTotals.protein} g`],
              ["Vet", `${dayTotals.fat} g`],
              ["Kcal", dayTotals.kcal],
              ["Toegediende insuline", `${dayTotals.insulin || 0} E`],
              [
                "Creonadvies",
                `${dayTotals.creon25 || 0}x25k + ${dayTotals.creon10 || 0}x10k`,
              ],
              ...(dayTotals.hasActualCreon
                ? [
                    [
                      "Werkelijk ingenomen Creon",
                      `${dayTotals.actualCreon25 || 0}x25k + ${
                        dayTotals.actualCreon10 || 0
                      }x10k`,
                    ],
                  ]
                : []),
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.82)",
                  border: "1px solid #bbf7d0",
                  borderRadius: 12,
                  padding: "9px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    marginBottom: 3,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#14532d",
                    lineHeight: 1.1,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
