import React, { useEffect, useState } from "react";

export function DailyMealDetailModal({
  meal,
  products,
  mealMomentLabel,
  mealTimeLabel,
  buttonStyle,
  onClose,
  onChangeTime,
  onUpdateMeal,
  onDelete,
}) {
  const [alarmEnabled, setAlarmEnabled] = useState(Boolean(meal?.alarmEnabled));
  const [repeat, setRepeat] = useState(meal?.repeat || "none");

  const [alarmAt, setAlarmAt] = useState(
    meal?.alarmAt
      ? meal.alarmAt.slice(0, 16)
      : meal?.eatenAt
        ? meal.eatenAt.slice(0, 16)
        : new Date().toISOString().slice(0, 16),
  );

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
        <div
          style={{
            marginBottom: 14,
            padding: 10,
            borderRadius: 12,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 800,
              color: "#1e3a8a",
              marginBottom: alarmEnabled ? 8 : 0,
            }}
          >
            <input
              type="checkbox"
              checked={alarmEnabled}
              onChange={(e) => setAlarmEnabled(e.target.checked)}
            />
            🔔 Alarm actief voor dit eetmoment
          </label>

          {alarmEnabled && (
            <input
              type="datetime-local"
              value={alarmAt}
              onChange={(e) => setAlarmAt(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 8,
                border: "1px solid #93c5fd",
                borderRadius: 8,
                fontSize: 16,
              }}
            />
          )}

          <button
            onClick={() =>
              onUpdateMeal({
                alarmEnabled,
                alarmAt: alarmEnabled ? alarmAt : null,
              })
            }
            style={{
              ...buttonStyle,
              marginTop: 8,
              background: "#dbeafe",
              border: "1px solid #93c5fd",
              color: "#1d4ed8",
              fontWeight: 800,
            }}
          >
            Alarm opslaan
          </button>
        </div>

        <div
          style={{
            marginBottom: 14,
            padding: 10,
            borderRadius: 12,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
          }}
        >
          <label
            htmlFor="daily-meal-repeat"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 900,
              color: "#14532d",
              marginBottom: 6,
            }}
          >
            Dagelijkse routine
          </label>

          <select
            id="daily-meal-repeat"
            value={repeat}
            onChange={(e) => {
              const nextRepeat = e.target.value;
              setRepeat(nextRepeat);
              onUpdateMeal({ repeat: nextRepeat });
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 8,
              border: "1px solid #86efac",
              borderRadius: 8,
              fontSize: 16,
              background: "white",
              color: "#0f172a",
            }}
          >
            <option value="none">Niet herhalen</option>
            <option value="daily">Dagelijks</option>
          </select>
        </div>

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

          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeTime();
              }}
              style={{
                ...buttonStyle,
                padding: "7px 11px",
                fontSize: 12,
                borderRadius: 10,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                fontWeight: 800,
              }}
            >
              Tijd wijzigen
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();

                onDelete();
              }}
              style={{
                ...buttonStyle,
                padding: "7px 11px",
                fontSize: 12,
                borderRadius: 10,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontWeight: 800,
              }}
            >
              Verwijder
            </button>

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
            ["Insulineadvies", `${meal.totals.insulin || 0} E`],
            [
              "Creonadvies",
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

                const amount = Number(row.amount) || 0;
                const grams =
                  row.mode === "gram"
                    ? amount
                    : amount * (Number(product?.portionGram) || 0);

                const kh = product
                  ? Math.round(
                      (((Number(product.kh100) || 0) * grams) / 100) * 100,
                    ) / 100
                  : 0;
                const protein = product
                  ? Math.round(
                      (((Number(product.protein100) || 0) * grams) / 100) * 100,
                    ) / 100
                  : 0;
                const fat = product
                  ? Math.round(
                      (((Number(product.fat100) || 0) * grams) / 100) * 100,
                    ) / 100
                  : 0;
                const kcal = product
                  ? Math.round(
                      (((Number(product.kcal100) || 0) * grams) / 100) * 100,
                    ) / 100
                  : 0;

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
                      {grams} g
                    </div>

                    <div style={{ marginTop: 4, color: "#334155" }}>
                      KH {kh} g · Eiwit {protein} g · Vet {fat} g · Kcal {kcal}
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
