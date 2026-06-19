import React from "react";

export function MealRowCard({
  row,
  products,
  categories,
  onChange,
  onRemove,
  newRowRef,
  isLastRow,
  inputStyle,
  buttonStyle,
  getCategoryColor,
}) {
  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  const backgroundColor =
    row.product && getCategoryColor
      ? getCategoryColor(categories, row.product.categoryId)
      : "white";

  const compactInputStyle = {
    ...inputStyle,
    padding: isMobile ? "5px 8px" : "7px 9px",
    fontSize: isMobile ? 16 : 13,
    lineHeight: isMobile ? 1.1 : undefined,
    borderRadius: isMobile ? 6 : 10,
    minHeight: isMobile ? 34 : undefined,
    minWidth: 0,
  };

  const metricStyle = {
    background: "rgba(255,255,255,0.6)",
    borderRadius: isMobile ? 6 : 10,
    padding: isMobile ? "3px 6px" : "5px 7px",
    fontSize: isMobile ? 11 : 12,
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={isLastRow ? newRowRef : null}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: isMobile ? 6 : 12,
        padding: isMobile ? 5 : 8,
        marginBottom: isMobile ? 4 : 6,
        background: backgroundColor,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 68px 46px"
            : "minmax(220px, 2fr) 110px 95px auto",
          gap: isMobile ? 4 : 6,
          alignItems: "center",
        }}
      >
        <select
          value={row.productId}
          onChange={(e) => onChange(row.id, { productId: e.target.value })}
          style={{
            ...compactInputStyle,
            gridColumn: isMobile ? "1 / -1" : "auto",
          }}
        >
          <option value="">Kies product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.favorite ? "★ " : ""}
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={row.mode}
          onChange={(e) => onChange(row.id, { mode: e.target.value })}
          style={compactInputStyle}
        >
          <option value="portion">Porties</option>
          <option value="gram">Gram</option>
        </select>

        <input
          value={row.amount}
          onChange={(e) => onChange(row.id, { amount: e.target.value })}
          style={{
            ...compactInputStyle,

            width: isMobile ? 42 : undefined,
            minWidth: isMobile ? 42 : undefined,
            maxWidth: isMobile ? 42 : undefined,

            fontSize: 16,

            minHeight: 0,

            height: isMobile ? 32 : undefined,

            padding: 0,

            margin: 0,

            textAlign: "center",

            lineHeight: isMobile ? "32px" : "30px",

            boxSizing: "border-box",

            background: "#f1f1f1",

            border: "1px solid #cbd5e1",

            borderRadius: isMobile ? 6 : 10,

            color: "#0f172a",
          }}
          placeholder={row.mode === "portion" ? "1" : "100"}
        />

        <button
          onClick={() => onRemove(row.id)}
          style={{
            ...buttonStyle,
            padding: isMobile ? "4px 6px" : "7px 10px",
            minHeight: isMobile ? 30 : undefined,
            fontSize: isMobile ? 12 : 13,
            lineHeight: isMobile ? 1.05 : undefined,
            borderRadius: isMobile ? 6 : 10,
            display: "inline-block",
            minWidth: 0,
          }}
        >
          Wis
        </button>
      </div>

      <div
        style={{
          marginTop: isMobile ? 4 : 6,
          display: "flex",
          gap: isMobile ? 3 : 6,
          flexWrap: "wrap",
          alignItems: "center",
          color: "#334155",
          fontSize: isMobile ? 11 : 12,
          lineHeight: 1.2,
        }}
      >
        {row.product ? (
          <>
            <span
              style={{
                fontSize: isMobile ? 11 : 12,
                color: "#475569",
                flexBasis: "100%",
                lineHeight: 1.2,
              }}
            >
              {row.product.portion} = {row.product.portionGram} g · totaal{" "}
              <strong>{row.grams} g</strong>
            </span>

            <span style={metricStyle}>
              <strong>KH</strong> {row.kh}
            </span>
            <span style={metricStyle}>
              <strong>Eiwit</strong> {row.protein}
            </span>
            <span style={metricStyle}>
              <strong>Vet</strong> {row.fat}
            </span>
            <span style={metricStyle}>
              <strong>Kcal</strong> {row.kcal}
            </span>
          </>
        ) : (
          <span style={{ fontSize: isMobile ? 11 : 12, color: "#64748b" }}>
            Kies een product
          </span>
        )}
      </div>
    </div>
  );
}
