import React, { useState } from "react";

export function SavedMealCard({
  meal,
  index,
  products,
  onLoad,
  onDelete,
  onAppend,
  onEdit,
  buttonStyle,
}) {
  const [open, setOpen] = useState(false);

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  return (
    <div
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: isMobile ? 2 : 10,
        padding: isMobile ? "3px 6px" : 10,
        background: "#f8fafc",
      }}
    >
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: isMobile ? 4 : 10,
          cursor: "pointer",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: isMobile ? 600 : 700,
              fontSize: isMobile ? 11 : undefined,
              lineHeight: isMobile ? 1.05 : undefined,
              whiteSpace: "normal",
            }}
          >
            {index + 1}. {meal.name}
          </div>

          {meal.createdAt && (
            <div
              style={{
                fontSize: isMobile ? 10 : 12,
                color: "#64748b",
              }}
            >
              {meal.createdAt}
            </div>
          )}
        </div>

        <div style={{ fontSize: isMobile ? 11 : 14 }}>{open ? "▲" : "▼"}</div>
      </div>

      {open && (
        <div style={{ marginTop: isMobile ? 5 : 10 }}>
          <div
            style={{
              display: "grid",
              gap: isMobile ? 2 : 4,
              marginBottom: isMobile ? 5 : 10,
            }}
          >
            {meal.rows?.map((r, i) => {
              const product = products.find((p) => p.id === r.productId);

              return (
                <div
                  key={i}
                  style={{
                    fontSize: isMobile ? 11 : 13,
                    color: "#334155",
                  }}
                >
                  • {product?.name || "Onbekend"} ({r.amount})
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              gap: isMobile ? 4 : 8,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => onLoad(meal.id)}
              style={{
                ...buttonStyle,
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                fontWeight: 700,
                padding: isMobile ? "3px 6px" : undefined,
                fontSize: isMobile ? 11 : undefined,
              }}
            >
              Laden
            </button>

            <button
              onClick={() => onAppend(meal.id)}
              style={{
                ...buttonStyle,
                padding: isMobile ? "3px 6px" : undefined,
                fontSize: isMobile ? 11 : undefined,
              }}
            >
              Voeg toe
            </button>

            <button
              onClick={() => onEdit(meal.id)}
              style={{
                ...buttonStyle,
                background: "#eef2ff",
                border: "1px solid #c7d2fe",
                color: "#3730a3",
                fontWeight: 700,
                padding: isMobile ? "3px 6px" : undefined,
                fontSize: isMobile ? 11 : undefined,
              }}
            >
              Wijzig
            </button>

            <button
              onClick={() => onDelete(meal.id)}
              style={{
                ...buttonStyle,
                background: "#fee2e2",
                border: "1px solid #fecaca",
                padding: isMobile ? "3px 6px" : undefined,
                fontSize: isMobile ? 11 : undefined,
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
