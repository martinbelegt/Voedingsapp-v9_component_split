import { useEffect, useState } from "react";
import { createEmptyRow, normalizeMealRows } from "../services/mealService";

export function useMealRows() {
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem("dc_rows_v4");

    return saved
      ? normalizeMealRows(JSON.parse(saved))
      : [createEmptyRow(), createEmptyRow(), createEmptyRow()];
  });

  useEffect(() => {
    localStorage.setItem("dc_rows_v4", JSON.stringify(rows));
  }, [rows]);

  const setRowsSafe = (nextRows) => {
    setRows(normalizeMealRows(nextRows));
  };

  const resetRows = () => {
    setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()]);
  };

  return {
    rows,
    setRows,
    setRowsSafe,
    resetRows,
  };
}
