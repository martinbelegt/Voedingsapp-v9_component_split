import { createId } from "./idService";

export function createEmptyRow() {
  return {
    id: createId("row"),
    productId: "",
    mode: "portion",
    amount: "",
  };
}

export function normalizeMealRows(rows) {
  if (!rows || rows.length === 0) {
    return [createEmptyRow()];
  }

  const normalizedRows = rows.map((row) => ({
    id: row.id || createId("row"),
    productId: row.productId || "",
    mode: row.mode || "portion",
    amount: row.amount ?? "",
  }));

  const last = normalizedRows[normalizedRows.length - 1];

  if (last.productId) {
    return [...normalizedRows, createEmptyRow()];
  }

  return normalizedRows;
}
