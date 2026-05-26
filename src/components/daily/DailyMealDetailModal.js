import React, { useEffect } from "react";

export function DailyMealDetailModal({
  meal,
  products,
  mealMomentLabel,
  mealTimeLabel,
  buttonStyle,
  onClose,
}) {
  // ESC sluit detailvenster
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.48)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 9999,
      }}
    >
      {/* Modalcontainer */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(820px, 96vw)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#f8fafc",
          borderRadius: 20,
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
          padding: 18,
          border: "1px solid #cbd5e1",
        }}
      >
        {/* Modalheader */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 950,
                color: "#0f172a",
                lineHeight: 1.15,
              }}
            >
              {mealMomentLabel}
              {meal.mealNote ? (
                <span style={{ color: "#166534", fontWeight: 850 }}>
                  {" "}
                  – {meal.mealNote}
                </span>
              ) : null}
            </div>

            <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
              {mealTimeLabel}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              ...buttonStyle,
              padding: "7px 11px",
              fontSize: 12,
              borderRadius: 10,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            Sluiten
          </button>
        </div>

        {/* Samenvatting macro's */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            ["KH", `${meal.totals.kh} g`],
            ["Eiwit", `${meal.totals.protein} g`],
            ["Vet", `${meal.totals.fat} g`],
            ["Kcal", meal.totals.kcal],
            [
              "Creon",
              `${meal.totals.creon25 || 0}x25k + ${
                meal.totals.creon10 || 0
              }x10k`,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 14,
                padding: "10px 11px",
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
                  fontWeight: 950,
                  color: "#0f172a",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Productdetails */}
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 12,
          }}
        >
          <div
            style={{
              fontWeight: 900,
              color: "#0f172a",
              fontSize: 15,
              marginBottom: 10,
            }}
          >
            Productdetails
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {(meal.rows || [])
              .filter((row) => row.productId)
              .map((row) => {
                const product = products.find((p) => p.id === row.productId);

                return (
                  <div
                    key={row.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 10,
                      background: "#ffffff",
                      borderLeft: "5px solid #93c5fd",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>
                      {product?.name || "Onbekend product"}
                    </div>

                    <div style={{ marginTop: 4, color: "#334155" }}>
                      Hoeveelheid: {row.amount}{" "}
                      {row.mode === "gram" ? "gram" : "portie(s)"} · Berekend:{" "}
                      {row.grams || 0} g
                    </div>

                    <div style={{ marginTop: 4, color: "#334155" }}>
                      KH {row.kh || 0} g · Eiwit {row.protein || 0} g · Vet{" "}
                      {row.fat || 0} g · Kcal {row.kcal || 0}
                    </div>

                    {product && (
                      <div
                        style={{
                          marginTop: 6,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          GI: {product.giClass || "onbekend"}
                          {product.giValue ? ` (${product.giValue})` : ""}
                        </span>

                        <span
                          style={{
                            background: "#ede9fe",
                            color: "#5b21b6",
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          Timing: {product.timingTag || "onbekend"}
                        </span>

                        <span
                          style={{
                            background: "#fef3c7",
                            color: "#92400e",
                            padding: "3px 8px",
                            borderRadius: 999,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          Absorptie: {product.absorptionProfile || "onbekend"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
