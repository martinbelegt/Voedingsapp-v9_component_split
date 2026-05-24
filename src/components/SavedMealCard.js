import React, { useState } from "react";

export function SavedMealCard({
  meal,
  index,
  products,
  onLoad,
  onDelete,
  onAppend,
  buttonStyle,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 10,
        padding: 10,
        background: "#f8fafc",
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>
            {index + 1}. {meal.name}
          </div>
          {meal.createdAt && (
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {meal.createdAt}
            </div>
          )}
        </div>

        <div style={{ fontSize: 14 }}>{open ? "▲" : "▼"}</div>
      </div>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gap: 4, marginBottom: 10 }}>
            {meal.rows?.map((r, i) => {
              const product = products.find((p) => p.id === r.productId);
              return (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "#334155",
                  }}
                >
                  • {product?.name || "Onbekend"} ({r.amount})
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onLoad(meal.id)}
              style={{
                ...buttonStyle,
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                fontWeight: 700,
              }}
            >
              Laden
            </button>

            <button onClick={() => onAppend(meal.id)} style={buttonStyle}>
              Voeg toe
            </button>

            <button
              onClick={() => onDelete(meal.id)}
              style={{
                ...buttonStyle,
                background: "#fee2e2",
                border: "1px solid #fecaca",
              }}
            >
              Wis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
