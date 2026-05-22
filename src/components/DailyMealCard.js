import React from "react";

export function DailyMealCard({
  meal,
  index,
  products,
  onDelete,
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
    </div>
  );
}
