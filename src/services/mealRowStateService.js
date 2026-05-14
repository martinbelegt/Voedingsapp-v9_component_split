export function addEmptyMealRow(rows, makeRow) {
  return [...rows, makeRow()];
}

export function removeMealRowById(rows, id, makeRow, ensureLastEmptyRow) {
  const filtered = rows.filter((r) => r.id !== id);
  return filtered.length ? ensureLastEmptyRow(filtered) : [makeRow()];
}
export function createEmptyMealRows(makeRow, count = 3) {
  return Array.from({ length: count }, () => makeRow());
}
export function quickAddProductToRows(
  rows,
  productId,
  makeRow,
  ensureLastEmptyRow,
) {
  const copy = [...rows];
  const filledCount = copy.filter((r) => r.productId).length;
  const targetIndex = filledCount;

  if (!copy[targetIndex]) copy.push(makeRow());

  copy[targetIndex] = {
    ...copy[targetIndex],
    productId,
    mode: "portion",
    amount: "1",
  };

  return ensureLastEmptyRow(copy);
}
export function updateMealRowById(rows, id, patch, ensureLastEmptyRow) {
  return ensureLastEmptyRow(
    rows.map((r) => {
      if (r.id !== id) return r;

      const next = { ...r, ...patch };

      if (patch.productId && !next.amount) next.amount = "1";
      if (patch.productId === "") next.amount = "";

      return next;
    }),
  );
}
