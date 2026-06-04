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

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  return (
    <div
      style={{
        ...cardStyle,
        marginBottom: isMobile ? 8 : 16,
        padding: isMobile ? 0 : cardStyle?.padding,
      }}
    >
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
          padding: isMobile ? "3px 8px" : undefined,
          fontSize: isMobile ? 13 : undefined,
          padding: isMobile ? "2px 8px" : undefined,
          fontSize: isMobile ? 12 : undefined,
          borderRadius: isMobile ? 2 : buttonStyle?.borderRadius,
          lineHeight: isMobile ? 1.15 : undefined,
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
            gap: isMobile ? 4 : 10,
            marginTop: isMobile ? 5 : 12,
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
                padding: isMobile ? "2px 6px" : "10px 12px",
                fontSize: isMobile ? 10 : undefined,
                fontWeight: isMobile ? 600 : 700,
                borderRadius: isMobile ? 2 : buttonStyle?.borderRadius,
                lineHeight: isMobile ? 1.05 : undefined,
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
