import { createId as defaultCreateId } from "./idService";

export function createSupplementEvent(input, options = {}) {
  const createId = options.createId || defaultCreateId;
  const now = options.now || new Date();

  return {
    id: createId("supplement-event"),
    type: "supplement",
    eventTime: input.eventTime || now.toISOString(),
    name: input.name || "",
    dosage: input.dosage || "",
    unit: input.unit || "",
    note: input.note || "",
    intakeType: input.intakeType || "supplement",
    supplementId: input.supplementId || "",
    supplementName: input.supplementName || input.name || "",
    brand: input.brand || "",
    productName: input.productName || "",
    createdAt: now.toLocaleString("nl-NL"),
    repeat: input.repeat || "none",
  };
}

export function buildSupplementTimelineInputs(supplements, eventTime) {
  // A catalog recommendation describes the product, not what the user takes.
  // Timeline registrations therefore read exclusively from personal usage.
  return supplements.map((supplement) => ({
    date: eventTime.slice(0, 10),
    eventTime,
    name: supplement.product?.name || "Supplement",
    supplementName: supplement.product?.name || "Supplement",
    supplementId: supplement.id,
    dosage: supplement.personal?.dosage ?? "",
    unit: supplement.personal?.dosageUnit ?? "",
    note: supplement.personal?.notes || "",
    brand: supplement.product?.brand || "",
    productName: supplement.product?.productName || "",
  }));
}
