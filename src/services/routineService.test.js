import {
  buildRoutineRegistrations,
  createRoutine,
  createRoutineItem,
  loadRoutines,
  saveRoutines,
} from "./routineService";

const idFactory = (() => {
  let value = 0;
  return () => `id-${++value}`;
})();

test("routine-items bewaren alleen de catalogusverwijzing en standaardwaarden", () => {
  const item = createRoutineItem({
    type: "food",
    catalogItemId: "food-1",
    defaultAmount: 75,
    defaultUnit: "g",
    defaultNote: "Na training",
    order: 2,
  }, { createId: idFactory });

  expect(item).toEqual({
    id: expect.any(String),
    type: "food",
    catalogItemId: "food-1",
    defaultAmount: 75,
    defaultUnit: "g",
    defaultNote: "Na training",
    order: 2,
  });
  expect(item.name).toBeUndefined();
  expect(item.catalogItem).toBeUndefined();
});

test("routines worden lokaal opgeslagen en toekomstvelden blijven behouden", () => {
  const storage = {
    value: null,
    setItem(key, value) { this.value = value; },
    getItem() { return this.value; },
  };
  const routine = createRoutine({ name: "Ochtend", schedule: { weekdays: [1, 2] } }, { createId: idFactory, now: "2026-08-03T08:00:00.000Z" });

  expect(saveRoutines([routine], storage)).toBe(true);
  expect(loadRoutines(storage)[0]).toMatchObject({
    name: "Ochtend",
    schedule: { weekdays: [1, 2], times: [], dayType: "any" },
    extensions: { ai: null, community: null, marketplace: null },
  });
});

test("alleen aangevinkte bestaande catalogusitems worden registratie-input", () => {
  const routine = createRoutine({
    name: "Ontbijt",
    startTime: "08:15",
    items: [
      createRoutineItem({ id: "a", type: "food", catalogItemId: "food-1", order: 0 }),
      createRoutineItem({ id: "b", type: "supplement", catalogItemId: "supp-1", order: 1 }),
    ],
  }, { createId: idFactory });
  const registrations = buildRoutineRegistrations(routine, ["b"], {
    products: [{ id: "food-1", name: "Havermout" }],
    supplements: [{ id: "supp-1", product: { name: "Magnesium", brand: "Merk" }, personal: { dosage: "1", dosageUnit: "capsule" } }],
  }, new Date("2026-08-03T12:00:00.000Z"));

  expect(registrations).toHaveLength(1);
  expect(registrations[0]).toMatchObject({
    type: "supplement",
    input: {
      supplementId: "supp-1",
      supplementName: "Magnesium",
      dosage: "1",
      routineExecution: {
        routineId: routine.id,
        name: "Ontbijt",
        itemCount: 1,
      },
    },
  });
});

test("een oefening blijft via het bestaande routinepad een losse uitvoering", () => {
  const routine = createRoutine({
    name: "Schouderroutine",
    items: [createRoutineItem({ id: "exercise-item", type: "exercise", catalogItemId: "exercise-1" })],
  }, { createId: idFactory });
  const [registration] = buildRoutineRegistrations(routine, ["exercise-item"], {
    products: [], supplements: [],
    exercises: [{ id: "exercise-1", name: "Externe rotatie", personalDosage: "20 seconden × 1", side: "Links", notes: "Rustig" }],
  }, new Date("2026-08-16T10:00:00.000Z"));
  expect(registration).toMatchObject({
    type: "exercise",
    input: { exerciseId: "exercise-1", exerciseName: "Externe rotatie", personalDosage: "20 seconden × 1", side: "Links" },
  });
});
