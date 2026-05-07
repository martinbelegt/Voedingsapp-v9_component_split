import React from "react";

export function MealRowCard({
  index,
  row,
  products,
  categories,
  onChange,
  onRemove,
  newRowRef,
  isLastRow,
  labelStyle,
  inputStyle,
  buttonStyle,
  getCategoryColor,
}) {
  const backgroundColor =
    row.product && getCategoryColor
      ? getCategoryColor(categories, row.product.categoryId)
      : "white";

  return (
    <div
      ref={isLastRow ? newRowRef : null}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 10,
        marginBottom: 8,
        background: backgroundColor,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        Rij {index + 1}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr auto",
          gap: 8,
        }}
      >
        <div>
          <label style={labelStyle}>Product</label>

          <select
            value={row.productId}
            onChange={(e) =>
              onChange(row.id, {
                productId: e.target.value,
              })
            }
            style={inputStyle}
          >
            <option value="">Kies product</option>

            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.favorite ? "★ " : ""}
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Methode</label>

          <select
            value={row.mode}
            onChange={(e) =>
              onChange(row.id, {
                mode: e.target.value,
              })
            }
            style={inputStyle}
          >
            <option value="portion">Porties</option>
            <option value="gram">Gram</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Hoeveelheid</label>

          <input
            value={row.amount}
            onChange={(e) =>
              onChange(row.id, {
                amount: e.target.value,
              })
            }
            style={inputStyle}
            placeholder={row.mode === "portion" ? "1" : "100"}
          />
        </div>

        <div style={{ alignSelf: "end" }}>
          <button onClick={() => onRemove(row.id)} style={buttonStyle}>
            Wis
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "#475569",
        }}
      >
        {row.product ? (
          <span>
            {row.product.portion} = {row.product.portionGram} g • Berekend
            totaal =<strong> {row.grams} g</strong>
          </span>
        ) : (
          <span>Kies een product</span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
          marginTop: 8,
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            borderRadius: 12,
            padding: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b" }}>KH</div>

          <div style={{ fontWeight: 700 }}>{row.kh}</div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            borderRadius: 12,
            padding: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b" }}>Eiwit</div>

          <div style={{ fontWeight: 700 }}>{row.protein}</div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            borderRadius: 12,
            padding: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b" }}>Vet</div>

          <div style={{ fontWeight: 700 }}>{row.fat}</div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            borderRadius: 12,
            padding: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b" }}>Kcal</div>

          <div style={{ fontWeight: 700 }}>{row.kcal}</div>
        </div>
      </div>
    </div>
  );
}
