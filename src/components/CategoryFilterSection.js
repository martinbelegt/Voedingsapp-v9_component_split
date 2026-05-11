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

  return (
    <div style={cardStyle}>
      <button
        onClick={() => setShowCategoryFilter((v) => !v)}
        style={{
          ...buttonStyle,
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Categorie filter</span>
        <span>{showCategoryFilter ? "▲" : "▼"}</span>
      </button>

      {showCategoryFilter && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
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
                  background: isActive ? "#0f172a" : bg,
                  color: isActive ? "white" : "#0f172a",
                  border: isActive ? "1px solid #0f172a" : "1px solid #dbe3ee",
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
