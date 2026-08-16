import { buildSupplementTimelineInputs, createSupplementEvent } from "./supplementEventService";

test("maakt een leesbare, zelfstandige supplement-snapshot", () => {
  const catalogItem = {
    id: "supp-hmb",
    product: { name: "HMB", brand: "Pure", productName: "HMB 1000" },
  };
  const event = createSupplementEvent(
    {
      eventTime: "2026-07-31T08:00",
      supplementId: catalogItem.id,
      supplementName: catalogItem.product.name,
      name: catalogItem.product.name,
      brand: catalogItem.product.brand,
      productName: catalogItem.product.productName,
      dosage: "4",
      unit: "capsules",
      note: "Bij ontbijt",
    },
    { createId: () => "event-1", now: new Date("2026-07-31T06:00:00Z") },
  );

  catalogItem.product.name = "Gewijzigd";
  expect(event).toMatchObject({
    id: "event-1",
    type: "supplement",
    supplementId: "supp-hmb",
    supplementName: "HMB",
    name: "HMB",
    dosage: "4",
    unit: "capsules",
    brand: "Pure",
    productName: "HMB 1000",
    note: "Bij ontbijt",
  });
});

test("catalogusverwijdering heeft geen invloed op het gemaakte event", () => {
  const catalog = [{ id: "supp-1", product: { name: "Vitamine D3" } }];
  const event = createSupplementEvent(
    { supplementId: "supp-1", supplementName: "Vitamine D3", name: "Vitamine D3" },
    { createId: () => "event-2", now: new Date("2026-07-31T06:00:00Z") },
  );

  catalog.splice(0, 1);
  expect(catalog).toHaveLength(0);
  expect(event.supplementName).toBe("Vitamine D3");
});

test("multi-select maakt afzonderlijke events met exact dezelfde timestamp", () => {
  const timestamp = "2026-08-15T08:00";
  const inputs = buildSupplementTimelineInputs([
    { id: "supp-1", product: { name: "Collagen + Vitamin C", manufacturerAdvice: "2 scoops" }, personal: { dosage: "1", dosageUnit: "scoop" } },
    { id: "supp-2", product: { name: "Creatine Monohydrate Creapure®", manufacturerAdvice: "10 g" }, personal: { dosage: "5", dosageUnit: "g" } },
    { id: "supp-3", product: { name: "HMB", manufacturerAdvice: "6 capsules" }, personal: { dosage: "3", dosageUnit: "capsules" } },
  ], timestamp);
  let id = 0;
  const events = inputs.map((input) => createSupplementEvent(input, {
    createId: () => `event-${++id}`,
    now: new Date("2026-08-15T06:00:00Z"),
  }));

  expect(events).toHaveLength(3);
  expect(events.map((event) => event.id)).toEqual(["event-1", "event-2", "event-3"]);
  expect(events.map((event) => event.eventTime)).toEqual([timestamp, timestamp, timestamp]);
  expect(events.map((event) => event.supplementId)).toEqual(["supp-1", "supp-2", "supp-3"]);
  expect(events.map((event) => [event.dosage, event.unit])).toEqual([
    ["1", "scoop"],
    ["5", "g"],
    ["3", "capsules"],
  ]);
});

test("persoonlijke dosering wint altijd van fabrikantadvies", () => {
  const [input] = buildSupplementTimelineInputs([{
    id: "supp-r-ala",
    product: { name: "R-Alfa-Liponzuur", manufacturerAdvice: "2 capsules" },
    personal: { dosage: "1", dosageUnit: "capsule" },
  }], "2026-08-15T06:00");

  const event = createSupplementEvent(input, {
    createId: () => "event-r-ala",
    now: new Date("2026-08-15T04:00:00Z"),
  });
  expect([event.dosage, event.unit]).toEqual(["1", "capsule"]);
  expect(JSON.stringify(event)).not.toContain("2 capsules");
});

test("ontbrekende persoonlijke dosering neemt fabrikantadvies niet over", () => {
  const [input] = buildSupplementTimelineInputs([{
    id: "supp-r-ala",
    product: { name: "R-Alfa-Liponzuur", manufacturerAdvice: "2 capsules" },
    personal: { dosage: "", dosageUnit: "" },
  }], "2026-08-15T06:00");

  expect(input.dosage).toBe("");
  expect(input.unit).toBe("");
  expect(JSON.stringify(input)).not.toContain("2 capsules");
});
