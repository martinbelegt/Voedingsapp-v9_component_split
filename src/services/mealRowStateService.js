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
