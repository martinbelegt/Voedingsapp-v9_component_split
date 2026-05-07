export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function toNumber(value) {
  return Number(String(value).replace(",", ".")) || 0;
}

export function computeMealRow(row, products) {
  const product = products.find((p) => p.id === row.productId) || null;
  const amount = toNumber(row.amount);

  if (!product) {
    return {
      ...row,
      product: null,
      grams: 0,
      kh: 0,
      protein: 0,
      fat: 0,
      kcal: 0,
    };
  }

  const grams = row.mode === "portion" ? amount * product.portionGram : amount;

  return {
    ...row,
    product,
    grams: round2(grams),
    kh: round2((product.kh100 / 100) * grams),
    protein: round2((product.protein100 / 100) * grams),
    fat: round2((product.fat100 / 100) * grams),
    kcal: round2((product.kcal100 / 100) * grams),
  };
}

export function computeMealRows(rows, products) {
  return rows.map((row) => computeMealRow(row, products));
}

export function computeMacroTotals(rows) {
  return {
    kh: round2(rows.reduce((a, r) => a + r.kh, 0)),
    protein: round2(rows.reduce((a, r) => a + r.protein, 0)),
    fat: round2(rows.reduce((a, r) => a + r.fat, 0)),
    kcal: round2(rows.reduce((a, r) => a + r.kcal, 0)),
  };
}
