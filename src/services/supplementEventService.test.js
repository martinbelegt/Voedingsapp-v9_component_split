import { createSupplementEvent } from "./supplementEventService";

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
