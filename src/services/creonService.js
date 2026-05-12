export function getCreonModeLabel(creonMode) {
  return creonMode === "extended" ? "Persoonlijk uitgebreid" : "Standaard";
}

export function getCreonInputNumber(value) {
  return Number(String(value).replace(",", ".")) || 0;
}
