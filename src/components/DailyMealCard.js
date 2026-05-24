import React from "react";

export function DailyMealCard({
  meal,
  index,
  products,
  onDelete,
  onUpdateTime,
  onUpdateMedicalLog,
  buttonStyle,
}) {
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

    const actualInsulin = window.prompt(
      "Werkelijk gespoten insuline (E):",
      meal.actualInsulin || "",
    );
    if (actualInsulin === null) return;

    const insulinType = window.prompt(
      "Type insuline:",
      meal.insulinType || "Novorapid",
    );
    if (insulinType === null) return;

    const insulinTime = window.prompt(
      "Tijd insuline (HH:mm):",
      meal.insulinTime || "",
    );
    if (insulinTime === null) return;

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
      actualInsulin,
      insulinType,
      insulinTime,
      actualCreon25,
      actualCreon10,
      creonTime,
    });
  }

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        padding: "8px 10px",
        marginBottom: 8,
        background: "#f8fafc",
      }}
    >
      {/* Kopregel maaltijd/snack */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>
            {mealMomentLabel}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {meal.eatenAt
              ? new Date(meal.eatenAt).toLocaleString("nl-NL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : meal.createdAt}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button
            onClick={() => changeMealTime()}
            style={{
              ...buttonStyle,
              padding: "6px 9px",
              fontSize: 12,
              borderRadius: 10,
              background: "#eef2ff",
              border: "1px solid #c7d2fe",
              color: "#3730a3",
            }}
          >
            Tijd wijzigen
          </button>

          <button
            onClick={() => changeMedicalLog()}
            style={{
              ...buttonStyle,
              padding: "6px 9px",
              fontSize: 12,
              borderRadius: 10,
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              color: "#166534",
            }}
          >
            Log wijzigen
          </button>

          <button
            onClick={() => onDelete(meal.id)}
            style={{
              ...buttonStyle,
              padding: "6px 9px",
              fontSize: 12,
              borderRadius: 10,
            }}
          >
            Verwijder
          </button>
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
        {meal.totals.insulin != null && (
          <span>
            <strong>Insuline</strong> {meal.totals.insulin} E
          </span>
        )}
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

      {(meal.mealNote ||
        meal.actualInsulin ||
        meal.actualCreon25 ||
        meal.actualCreon10) && (
        <div
          style={{
            marginTop: 8,
            padding: "7px 9px",
            borderRadius: 10,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 12,
            color: "#14532d",
            display: "grid",
            gap: 4,
          }}
        >
          {meal.mealNote && (
            <div>
              <strong>Notitie:</strong> {meal.mealNote}
            </div>
          )}

          {meal.actualInsulin && (
            <div>
              <strong>Werkelijk insuline:</strong>{" "}
              {meal.insulinType || "Insuline"} {meal.actualInsulin} E
              {meal.insulinTime ? ` om ${meal.insulinTime}` : ""}
            </div>
          )}

          {(meal.actualCreon25 || meal.actualCreon10) && (
            <div>
              <strong>Werkelijk Creon:</strong> {meal.actualCreon25 || 0}x25k +{" "}
              {meal.actualCreon10 || 0}x10k
              {meal.creonTime ? ` om ${meal.creonTime}` : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
