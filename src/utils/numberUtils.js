export function parseDecimalInput(value) {
  return Number(String(value).replace(",", ".")) || 0;
}
