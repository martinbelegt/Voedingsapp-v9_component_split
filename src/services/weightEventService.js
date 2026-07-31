export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 400;

export function parseWeightKg(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateWeightKg(value) {
  const valueKg = parseWeightKg(value);
  if (valueKg == null) return "Vul een geldig gewicht in.";
  if (valueKg <= 0) return "Gewicht moet groter zijn dan 0.";
  if (valueKg < MIN_WEIGHT_KG || valueKg > MAX_WEIGHT_KG) {
    return `Vul een gewicht tussen ${MIN_WEIGHT_KG} en ${MAX_WEIGHT_KG} kg in.`;
  }
  return null;
}

export function createWeightEvent(input, options = {}) {
  const error = validateWeightKg(input?.valueKg);
  if (error) throw new Error(error);

  const eventTime = String(input?.eventTime || input?.datetime || "");
  const date = eventTime.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Een gewichtsregistratie heeft een geldige datum en tijd nodig.");
  }

  if (typeof options.createId !== "function") {
    throw new Error("Een gewichtsregistratie heeft een ID-generator nodig.");
  }

  return {
    date,
    event: {
      id: options.createId("weight-event"),
      type: "weight",
      valueKg: parseWeightKg(input.valueKg),
      datetime: eventTime,
      eventTime,
      note: String(input.note || "").trim(),
      createdAt:
        input.createdAt ||
        (options.now ? options.now() : new Date()).toLocaleString("nl-NL"),
    },
  };
}

export function formatWeightKg(value) {
  const parsed = parseWeightKg(value);
  if (parsed == null) return "";
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: 2,
  }).format(parsed);
}
