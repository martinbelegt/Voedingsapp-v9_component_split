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
        marginBottom: isMobile ? 0 : 16,
        padding: isMobile ? 4 : cardStyle?.padding,
        border: isMobile ? "1px solid #e5e7eb" : cardStyle?.border,
        borderRadius: isMobile ? 10 : cardStyle?.borderRadius,
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={() => setShowFavorites((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          height: isMobile ? 32 : undefined,
          minHeight: isMobile ? 32 : undefined,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          color: "#9a3412",
          fontWeight: 700,
          padding: isMobile ? "4px 8px" : undefined,
          fontSize: isMobile ? 12 : undefined,
          borderRadius: isMobile ? 6 : buttonStyle?.borderRadius,
          lineHeight: isMobile ? 1.05 : undefined,
          boxSizing: "border-box",
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
            marginTop: isMobile ? 8 : 12,
          }}
        >
          {favoriteProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => quickAddProduct(p.id)}
              style={{
                ...buttonStyle,
                textAlign: "left",
                justifyContent: "flex-start",
                alignItems: "center",
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
