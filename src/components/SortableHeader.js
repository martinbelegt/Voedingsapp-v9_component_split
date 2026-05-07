import React from "react";

function SortableHeader({ label, sortKey, sortConfig, textAlign = "left" }) {
  const isActive = sortConfig.key === sortKey;
  const arrow = isActive ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  return (
    <div
      style={{
        width: "100%",
        textAlign,
        fontWeight: isActive ? 800 : 700,
        userSelect: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label}
      {arrow}
    </div>
  );
}

export default SortableHeader;
