import {
  CURRENT_BACKUP_VERSION,
  createFullBackupSnapshot,
  prepareRestoredBackupData,
  validateFullBackupObject,
} from "./backupService";

const adapters = {
  normalizeProduct: (product) => product,
  normalizeMealRows: (rows) => rows,
  ensureLastEmptyRow: (rows) => rows,
  migrateSettings: (settings) => settings,
};

function createDurableState() {
  return {
    categories: [{ id: "category-1", name: "Ontbijt" }],
    products: [{ id: "product-1", name: "Havermout", favorite: true }],
    rows: [{ id: "row-1", productId: "product-1", amount: "50" }],
    settings: { gramsKhPerUnit: 10 },
    savedMeals: [{ id: "saved-meal-1", name: "Basis" }],
    testLog: [{ id: "test-1", outcome: "goed" }],
    dailyLog: [
      {
        date: "2026-07-27",
        meals: [
          {
            id: "daily-meal-1",
            eatenAt: "2026-07-27T08:15",
            rows: [{ id: "meal-row-1", productId: "product-1" }],
            totals: { kh: 30, insulin: 3, creon25: 1 },
            actualInsulin: "2.5",
            insulinType: "Novorapid",
            insulinTime: "08:10",
            actualCreon25: "1",
            actualCreon10: "2",
            creonTime: "08:12",
            alarmEnabled: true,
            alarmAt: "2026-07-27T08:00",
            repeat: "daily",
            futureMealField: { preserved: true },
          },
        ],
        insulinEvents: [
          {
            id: "insulin-1",
            eventTime: "2026-07-27T08:10",
            units: "2.5",
          },
        ],
        glucoseEvents: [
          {
            id: "glucose-1",
            eventTime: "2026-07-27T09:15",
            glucoseValue: "6.1",
          },
        ],
        glucoseBoostEvents: [],
        movementEvents: [],
        weightEvents: [
          {
            id: "weight-1",
            type: "weight",
            eventTime: "2026-07-27T07:42",
            datetime: "2026-07-27T07:42",
            valueKg: 78.4,
            note: "",
          },
        ],
        supplementEvents: [],
        bowelEvents: [],
        noteEvents: [
          {
            id: "note-1",
            eventTime: "2026-07-27T12:00",
            alarmEnabled: true,
            alarmAt: "2026-07-27T12:00",
          },
        ],
        trainingPlanEvents: [],
        sportSupplementPlanEvents: [],
        futureDayField: "preserved",
      },
    ],
    timers: [
      {
        id: "timer-1",
        type: "digestion",
        startedAt: "2026-07-27T08:15:00.000Z",
        endsAt: "2026-07-27T11:15:00.000Z",
        note: "Ontbijt",
      },
    ],
  };
}

test("nieuwe volledige backup bevat alle duurzame datasets en metadata", () => {
  const state = createDurableState();
  const snapshot = createFullBackupSnapshot(state);

  expect(snapshot).toMatchObject({
    app: "diabetes-creon-webapp",
    version: CURRENT_BACKUP_VERSION,
  });
  expect(typeof snapshot.exportedAt).toBe("string");

  for (const key of Object.keys(state)) {
    expect(snapshot[key]).toEqual(state[key]);
  }
});

test("round trip behoudt dailyLog, medische velden, tijden, IDs en timers", () => {
  const state = createDurableState();
  const serialized = JSON.stringify(createFullBackupSnapshot(state));
  const restored = prepareRestoredBackupData(
    JSON.parse(serialized),
    adapters,
  );

  expect(restored.dailyLog).toEqual(state.dailyLog);
  expect(restored.timers).toEqual(state.timers);
  expect(restored.dailyLog).toHaveLength(1);
  expect(restored.dailyLog[0].meals).toHaveLength(1);
  expect(restored.dailyLog[0].insulinEvents).toHaveLength(1);
  expect(restored.dailyLog[0].glucoseEvents).toHaveLength(1);
  expect(restored.dailyLog[0].weightEvents).toEqual(
    state.dailyLog[0].weightEvents,
  );
  expect(restored.dailyLog[0].meals[0]).toMatchObject({
    id: "daily-meal-1",
    eatenAt: "2026-07-27T08:15",
    actualInsulin: "2.5",
    actualCreon25: "1",
    actualCreon10: "2",
    alarmEnabled: true,
    repeat: "daily",
    futureMealField: { preserved: true },
  });
});

test("legacy backup blijft geldig en laat ontbrekende dailyLog en timers ongemoeid", () => {
  const legacy = {
    app: "diabetes-creon-webapp",
    version: 2,
    categories: [],
    products: [],
    rows: [],
    settings: {},
    savedMeals: [],
    testLog: [],
  };

  const restored = prepareRestoredBackupData(legacy, adapters);

  expect(restored.isLegacy).toBe(true);
  expect(restored).not.toHaveProperty("dailyLog");
  expect(restored).not.toHaveProperty("timers");
});

test("ongeldige backup wordt volledig geweigerd voordat hersteldata ontstaat", () => {
  const invalid = createFullBackupSnapshot(createDurableState());
  invalid.dailyLog[0].insulinEvents = "geen lijst";

  expect(validateFullBackupObject(invalid)).toMatchObject({ ok: false });
  expect(() => prepareRestoredBackupData(invalid, adapters)).toThrow(
    /insulinEvents/,
  );
});
