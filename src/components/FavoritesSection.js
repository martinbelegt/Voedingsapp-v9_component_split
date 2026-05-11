import React from "react";
import { getCategoryColor, getCategoryName } from "../services/productHelpers";

export function FavoritesSection(props) {
  const {
    categories,
    favoriteProducts,
    showFavorites,
    setShowFavorites,
    quickAddProduct,
    cardStyle,
    buttonStyle,
  } = props;

  return (
    <div style={{ ...cardStyle, marginBottom: 16 }}>
      <button
        onClick={() => setShowFavorites((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          color: "#9a3412",
          fontWeight: 700,
        }}
      >
        <span>Favorieten ({favoriteProducts.length})</span>
        <span>{showFavorites ? "▲" : "▼"}</span>
      </button>

      {showFavorites && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 12,
          }}
        >
          {favoriteProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => quickAddProduct(p.id)}
              style={{
                ...buttonStyle,
                background: getCategoryColor(categories, p.categoryId),
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#0f172a",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                padding: "10px 12px",
                fontWeight: 700,
              }}
              title={`${getCategoryName(categories, p.categoryId)} | ${p.name}`}
            >
              ★ {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
