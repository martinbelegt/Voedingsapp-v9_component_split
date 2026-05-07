import React from "react";

export function DailyMealCard({
  meal,
  index,
  products,
  onDelete,
  buttonStyle,
}) {
  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "start",
          marginBottom: 8,
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>
            {index + 1}. {meal.name}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{meal.createdAt}</div>
        </div>

        <button onClick={() => onDelete(meal.id)} style={buttonStyle}>
          Verwijder
        </button>
      </div>

      <div style={{ marginBottom: 8, lineHeight: 1.6 }}>
        <div>KH: {meal.totals.kh} g</div>
        <div>Eiwit: {meal.totals.protein} g</div>
        <div>Vet: {meal.totals.fat} g</div>
        <div>kcal: {meal.totals.kcal}</div>
      </div>

      <div style={{ fontSize: 13, color: "#334155" }}>
        <strong>Regels:</strong>

        <ul style={{ marginTop: 6 }}>
          {meal.rows.map((row) => {
            const product = products.find((p) => p.id === row.productId);

            if (!product) return null;

            return (
              <li key={row.id}>
                {product.name} — {row.amount}{" "}
                {row.mode === "gram" ? "gram" : "portie(s)"}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
