import React, { useState } from "react";

export function CategoryFilterSection(props) {
  const {
    categoryFilter,
    setCategoryFilter,
    categoryFilterOptions,
    cardStyle,
    buttonStyle,
  } = props;

  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const isMobile =
    window.innerWidth < 900 || /iPhone|Android/i.test(navigator.userAgent);

  return (
    <div
      style={{
        ...cardStyle,
        padding: isMobile ? 4 : cardStyle?.padding,
        marginBottom: isMobile ? 4 : cardStyle?.marginBottom,
        border: isMobile ? "1px solid #e5e7eb" : cardStyle?.border,
      }}
    >
      <button
        onClick={() => setShowCategoryFilter((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: isMobile ? "2px 8px" : undefined,
          fontSize: isMobile ? 12 : undefined,
          lineHeight: isMobile ? 1.1 : undefined,
          borderRadius: isMobile ? 0 : buttonStyle?.borderRadius,
        }}
      >
        <span>Categorie filter</span>
        <span>{showCategoryFilter ? "▲" : "▼"}</span>
      </button>

      {showCategoryFilter && (
        <div
          style={{
            marginTop: isMobile ? 5 : 10,
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? 4 : 8,
          }}
        >
          {categoryFilterOptions.map((c) => {
            const isActive = c.id === categoryFilter;
            const bg = c.id === "all" ? "#f8fafc" : c.color;

            return (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                style={{
                  ...buttonStyle,

                  background: isActive ? "#dcfce7" : bg,

                  color: isActive ? "#166534" : "#0f172a",

                  border: isActive ? "1px solid #86efac" : "1px solid #dbe3ee",

                  padding: isMobile ? "2px 7px" : undefined,

                  fontSize: isMobile ? 11 : undefined,

                  fontWeight: isMobile ? 600 : undefined,

                  lineHeight: isMobile ? 1.1 : undefined,

                  borderRadius: isMobile ? 2 : buttonStyle?.borderRadius,
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
