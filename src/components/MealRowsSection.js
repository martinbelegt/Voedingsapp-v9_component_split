import React from "react";
import { MealRowCard } from "./MealRowCard";
import { MealTotalsCard } from "./MealTotalsCard";
import { getCategoryColor } from "../services/productHelpers";

export function MealCompositionSection(props) {
  const {
    rowsWithCalc,
    products,
    categories,
    updateRow,
    removeRow,
    newRowRef,
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
          products={products}
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
    </>
  );
}

export function MealRowsSection(props) {
  const {
    cardStyle,
    totals,
    children,
    afterComposition,
  } = props;

  return (
    <>
      {children}

      <MealTotalsCard totals={totals} cardStyle={cardStyle} />

      <MealCompositionSection {...props} />

      {afterComposition}
    </>
  );
}
