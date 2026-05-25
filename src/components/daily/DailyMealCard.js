import React, { useState } from "react";
import { DailyMealMedicalLogBlock } from "./DailyMealMedicalLogBlock";
import { DailyMealActions } from "./DailyMealActions";

export function DailyMealCard({
  meal,
  index,
  products,
  onDelete,
  onUpdateTime,
  onUpdateMedicalLog,
  buttonStyle,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const momentLabelMap = {
    breakfast: "Ontbijt",
    lunch: "Lunch",
    dinner: "Diner",
    snack: "Snack",
    sport: "Sport",
    dessert: "Toetje",
    fruit: "Fruit",
    neutral: "Algemeen",
  };

  const mealMomentLabel = momentLabelMap[meal.mealMoment] || "Maaltijd";
  const eatenAtValue = meal.eatenAt || "";

  function changeMealTime() {
    const currentValue = eatenAtValue
      ? eatenAtValue.slice(0, 16)
      : new Date().toISOString().slice(0, 16);

    const nextValue = window.prompt(
      "Nieuwe datum/tijd voor dit eetmoment (YYYY-MM-DDTHH:mm)",
      currentValue,
    );

    if (!nextValue) return;

    onUpdateTime(meal.id, nextValue);
  }

  function changeMedicalLog() {
    const mealNote = window.prompt(
      "Contextnotitie bij dit eetmoment:",
      meal.mealNote || "",
    );
    if (mealNote === null) return;

    const actualCreon25 = window.prompt(
      "Werkelijk genomen Creon 25k:",
      meal.actualCreon25 || "",
    );
    if (actualCreon25 === null) return;

    const actualCreon10 = window.prompt(
      "Werkelijk genomen Creon 10k:",
      meal.actualCreon10 || "",
    );
    if (actualCreon10 === null) return;

    const creonTime = window.prompt(
      "Tijd Creon (HH:mm):",
      meal.creonTime || "",
    );
    if (creonTime === null) return;

    onUpdateMedicalLog(meal.id, {
      mealNote,
      actualCreon25,
      actualCreon10,
      creonTime,
    });
  }

  const mealTimeLabel = meal.eatenAt
    ? new Date(meal.eatenAt).toLocaleString("nl-NL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : meal.createdAt;

  return (
    <>
      {/* Compacte eetmomentkaart in Dag / Archief */}
      <div
        onClick={() => setShowDetails(true)}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          padding: "8px 10px",
          marginBottom: 8,
          background: "#f8fafc",
          cursor: "pointer",
        }}
        title="Klik om maaltijdanalyse te openen"
      >
        {/* Kopregel eetmoment */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div>
            {/* Titel + belangrijke contextnotitie */}
            <div
              style={{
                fontWeight: 900,
                color: "#0f172a",
                fontSize: 16,
                lineHeight: 1.2,
              }}
            >
              {mealMomentLabel}
              {meal.mealNote ? (
                <span style={{ color: "#166534", fontWeight: 700 }}>
                  {" "}
                  – {meal.mealNote}
                </span>
              ) : null}
            </div>

            {/* Eet/planningstijd */}
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {mealTimeLabel}
            </div>
          </div>

          {/* Actieknoppen; klikken hierop opent niet de modal */}
          <div onClick={(e) => e.stopPropagation()}>
            <DailyMealActions
              changeMealTime={changeMealTime}
              changeMedicalLog={changeMedicalLog}
              onDelete={onDelete}
              meal={meal}
              buttonStyle={buttonStyle}
            />
          </div>
        </div>

        {/* Compacte totalen */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginTop: 7,
            fontSize: 12,
            color: "#334155",
          }}
        >
          <span>
            <strong>KH</strong> {meal.totals.kh} g
          </span>
          <span>
            <strong>Eiwit</strong> {meal.totals.protein} g
          </span>
          <span>
            <strong>Vet</strong> {meal.totals.fat} g
          </span>
          <span>
            <strong>Kcal</strong> {meal.totals.kcal}
          </span>

          {meal.totals.creon25 != null && (
            <span>
              <strong>Creon</strong> {meal.totals.creon25}x25k +{" "}
              {meal.totals.creon10 || 0}x10k
            </span>
          )}
        </div>

        {/* Productregels compact */}
        <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
          {(meal.rows || [])
            .map((row) => {
              const product = products.find((p) => p.id === row.productId);
              if (!product) return null;

              return `${product.name} (${row.amount} ${
                row.mode === "gram" ? "g" : "portie"
              })`;
            })
            .filter(Boolean)
            .join(" · ")}
        </div>

        {/* Werkelijke Creon/log bij dit eetmoment */}
        <DailyMealMedicalLogBlock meal={meal} />
      </div>

      {/* Modal / detailvenster maaltijdanalyse */}
      {showDetails && (
        <div
          onClick={() => setShowDetails(false)}
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

                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {mealTimeLabel}
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                style={{
                  ...buttonStyle,
                  padding: "7px 11px",
                  fontSize: 12,
                  borderRadius: 10,
                  background: "white",
                  border: "1px solid #cbd5e1",
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
                    background: "white",
                    border: "1px solid #e2e8f0",
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
                    const product = products.find(
                      (p) => p.id === row.productId,
                    );

                    return (
                      <div
                        key={row.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: 10,
                          background: "#f8fafc",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#0f172a" }}>
                          {product?.name || "Onbekend product"}
                        </div>

                        <div style={{ marginTop: 4, color: "#334155" }}>
                          Hoeveelheid: {row.amount}{" "}
                          {row.mode === "gram" ? "gram" : "portie(s)"} ·
                          Berekend: {row.grams || 0} g
                        </div>

                        <div style={{ marginTop: 4, color: "#334155" }}>
                          KH {row.kh || 0} g · Eiwit {row.protein || 0} g · Vet{" "}
                          {row.fat || 0} g · Kcal {row.kcal || 0}
                        </div>

                        {product && (
                          <div style={{ marginTop: 4, color: "#64748b" }}>
                            GI: {product.giClass || "onbekend"}
                            {product.giValue ? ` (${product.giValue})` : ""} ·
                            Timing: {product.timingTag || "onbekend"} ·
                            Absorptie: {product.absorptionProfile || "onbekend"}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
