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
