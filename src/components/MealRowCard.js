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
  const backgroundColor =
    row.product && getCategoryColor
      ? getCategoryColor(categories, row.product.categoryId)
      : "white";

  const compactInputStyle = {
    ...inputStyle,
    padding: "7px 9px",
    fontSize: 13,
    borderRadius: 10,
  };

  const metricStyle = {
    background: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    padding: "5px 7px",
    fontSize: 12,
    whiteSpace: "nowrap",
  };

  return (
    <div
      ref={isLastRow ? newRowRef : null}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 8,
        marginBottom: 6,
        background: backgroundColor,
      }}
    >
      {/* Compacte maaltijdregel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 2fr) 110px 95px auto",
          gap: 6,
          alignItems: "center",
        }}
      >
        <select
          value={row.productId}
          onChange={(e) =>
            onChange(row.id, {
              productId: e.target.value,
            })
          }
          style={compactInputStyle}
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
          onChange={(e) =>
            onChange(row.id, {
              mode: e.target.value,
            })
          }
          style={compactInputStyle}
        >
          <option value="portion">Porties</option>
          <option value="gram">Gram</option>
        </select>

        <input
          value={row.amount}
          onChange={(e) =>
            onChange(row.id, {
              amount: e.target.value,
            })
          }
          style={compactInputStyle}
          placeholder={row.mode === "portion" ? "1" : "100"}
        />

        <button
          onClick={() => onRemove(row.id)}
          style={{
            ...buttonStyle,
            padding: "7px 10px",
            fontSize: 13,
            borderRadius: 10,
          }}
        >
          Wis
        </button>
      </div>

      {/* Compacte berekende info */}
      <div
        style={{
          marginTop: 6,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
          color: "#334155",
        }}
      >
        {row.product ? (
          <>
            <span style={{ fontSize: 12, color: "#475569" }}>
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
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Kies een product
          </span>
        )}
      </div>
    </div>
  );
}
