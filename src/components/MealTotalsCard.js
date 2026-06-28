import React from "react";

export function MealTotalsCard({ totals, cardStyle }) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);
  const totalItems = [
    { label: "KH", value: `${totals.kh}g`, bg: "#dbeafe", color: "#1d4ed8" },
    {
      label: "Eiwit",
      value: `${totals.protein}g`,
      bg: "#ede9fe",
      color: "#6d28d9",
    },
    { label: "Vet", value: `${totals.fat}g`, bg: "#ffedd5", color: "#c2410c" },
    {
      label: "kcal",
      value: totals.kcal,
      bg: "#dcfce7",
      color: "#166534",
    },
  ];

  const chipStyle = (bg, color) => ({
    background: bg,
    color,
    padding: isMobile ? "3px 8px" : "4px 9px",
    borderRadius: 999,
    fontSize: isMobile ? 11 : 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ ...cardStyle, padding: isMobile ? 7 : cardStyle?.padding }}>
      <h2
        style={{
          margin: 0,
          marginBottom: isMobile ? 5 : 8,
          fontSize: isMobile ? 13 : 15,
        }}
      >
        Maaltijdtotaal
      </h2>

      <div
        style={{
          display: "flex",
          gap: isMobile ? 4 : 6,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {totalItems.map((item) => (
          <span key={item.label} style={chipStyle(item.bg, item.color)}>
            {item.label} {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}
