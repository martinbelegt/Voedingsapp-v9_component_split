import React, { useEffect, useState } from "react";
import { DailyMealMedicalLogBlock } from "./DailyMealMedicalLogBlock";
import { DailyMealActions } from "./DailyMealActions";
import { DailyMealDetailModal } from "./DailyMealDetailModal";

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

  // ESC sluit detailvenster
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setShowDetails(false);
      }
    }

    if (showDetails) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDetails]);

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

    onUpdateMedicalLog(meal.id, {
      mealNote,
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
          background: "#f1f5f9",
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
            fontWeight: 600,
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

      {showDetails && (
        <DailyMealDetailModal
          meal={meal}
          products={products}
          mealMomentLabel={mealMomentLabel}
          mealTimeLabel={mealTimeLabel}
          buttonStyle={buttonStyle}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
