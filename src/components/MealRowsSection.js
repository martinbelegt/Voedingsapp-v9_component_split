import React from "react";
import { MealRowCard } from "./MealRowCard";
import { getCategoryColor } from "../services/productHelpers";

export function MealRowsSection(props) {
  const {
    rowsWithCalc,
    filteredProducts,
    categories,
    updateRow,
    removeRow,
    addRow,
    clearMeal,
    newRowRef,
    cardStyle,
    buttonStyle,
    inputStyle,
    labelStyle,
  } = props;

  return (
    <>
      {rowsWithCalc.map((r, idx) => (
        <MealRowCard
          key={r.id}
          index={idx}
          row={r}
          products={filteredProducts}
          categories={categories}
          onChange={updateRow}
          onRemove={removeRow}
          newRowRef={newRowRef}
          isLastRow={idx === rowsWithCalc.length - 1}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
          buttonStyle={buttonStyle}
          getCategoryColor={getCategoryColor}
        />
      ))}

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
        >
          <button onClick={addRow} style={buttonStyle}>
            Rij toevoegen
          </button>

          <button
            onClick={clearMeal}
            style={{
              ...buttonStyle,
              background: "#dbeafe",
              color: "#1d4ed8",
              border: "1px solid #93c5fd",
              fontWeight: 700,
            }}
          >
            Nieuwe maaltijd
          </button>
        </div>
      </div>
    </>
  );
}
