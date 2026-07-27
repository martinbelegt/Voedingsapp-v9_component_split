import {
  CURRENT_BACKUP_VERSION,
  createFullBackupSnapshot,
  prepareRestoredBackupData,
  validateFullBackupObject,
} from "./backupService";
import { getDailyCreonSummary } from "./creonSemanticsService";
import { moveDailyLogEvent } from "./dailyLogEventMoveService";
import { getAdministeredInsulinTotal } from "./insulinService";
import {
  canSaveAppData,
  decideInitialArrayAuthority,
  interpretRevisionSaveResult,
  shouldAttemptMigration,
} from "./syncSafetyService";

const restoreAdapters = {
  normalizeProduct: (product) => product,
  normalizeMealRows: (rows) => rows,
  ensureLastEmptyRow: (rows) => rows,
  migrateSettings: (settings) => settings,
};

function createRealisticState() {
  const date = "2026-07-27";

  return {
    categories: [{ id: "cat-1", name: "Maaltijden" }],
    products: [{ id: "product-1", name: "Havermout", favorite: true }],
    rows: [{ id: "editor-row-1", productId: "product-1", amount: "50" }],
    settings: { gramsKhPerUnit: 10, creonMode: "standard" },
    savedMeals: [{ id: "saved-1", name: "Ontbijt" }],
    testLog: [{ id: "test-1", outcome: "stabiel" }],
    dailyLog: [
      {
        date,
        meals: [
          {
            id: "meal-1",
            name: "Ontbijt",
            eatenAt: `${date}T08:00`,
            rows: [{ id: "meal-row-1", productId: "product-1", amount: "50" }],
            totals: {
              kh: 40,
              insulin: 4,
              creon25: 2,
              creon10: 1,
            },
            actualInsulin: "4",
            insulinType: "Novorapid",
            insulinTime: "07:55",
            actualCreon25: "1",
            actualCreon10: "0",
            creonTime: "08:00",
            alarmEnabled: true,
            alarmAt: `${date}T07:50`,
            repeat: "daily",
            unknownMealField: { remains: true },
          },
        ],
        insulinEvents: [
          {
            id: "insulin-1",
            type: "insulin",
            eventTime: `${date}T07:55`,
            units: "4",
            insulinType: "Novorapid",
            unknownEventField: "preserved",
          },
        ],
        glucoseEvents: [
          {
            id: "glucose-1",
            type: "glucose",
            eventTime: `${date}T09:00`,
            glucoseValue: "6.2",
          },
        ],
        glucoseBoostEvents: [
          {
            id: "boost-1",
            type: "glucoseBoost",
            eventTime: `${date}T10:00`,
            kh: "10",
          },
        ],
        movementEvents: [
          {
            id: "movement-1",
            type: "movement",
            eventTime: `${date}T11:00`,
            activityType: "Wandelen",
          },
        ],
        supplementEvents: [
          {
            id: "supplement-1",
            type: "supplement",
            eventTime: `${date}T08:05`,
            name: "Creon 25.000",
            dosage: "9 capsules",
          },
        ],
        bowelEvents: [
          {
            id: "bowel-1",
            type: "bowel",
            eventTime: `${date}T12:00`,
            bristolScore: "4",
          },
        ],
        noteEvents: [
          {
            id: "note-1",
            type: "note",
            eventTime: `${date}T13:00`,
            note: "Controle",
            alarmEnabled: true,
            alarmAt: `${date}T13:00`,
          },
        ],
        trainingPlanEvents: [
          {
            id: "training-1",
            type: "trainingPlan",
            eventTime: `${date}T17:00`,
            title: "Krachttraining",
          },
        ],
        sportSupplementPlanEvents: [],
        unknownDayField: "preserved",
      },
    ],
    timers: [
      {
        id: "timer-1",
        type: "digestion",
        startedAt: "2026-07-27T08:00:00.000Z",
        endsAt: "2026-07-27T11:00:00.000Z",
        note: "Ontbijt",
      },
    ],
  };
}

test("backup v3 round-trip bewaart volledige dagelijkse toestand en semantiek", () => {
  const original = createRealisticState();
  const backup = createFullBackupSnapshot(original);
  const restored = prepareRestoredBackupData(
    JSON.parse(JSON.stringify(backup)),
    restoreAdapters,
  );

  expect(backup.version).toBe(CURRENT_BACKUP_VERSION);
  expect(restored.dailyLog).toEqual(original.dailyLog);
  expect(restored.timers).toEqual(original.timers);

  const restoredDay = restored.dailyLog[0];
  for (const collection of [
    "meals",
    "insulinEvents",
    "glucoseEvents",
    "glucoseBoostEvents",
    "movementEvents",
    "supplementEvents",
    "bowelEvents",
    "noteEvents",
    "trainingPlanEvents",
    "sportSupplementPlanEvents",
  ]) {
    expect(restoredDay[collection]).toEqual(original.dailyLog[0][collection]);
  }

  for (const collection of [
    "insulinEvents",
    "glucoseEvents",
    "glucoseBoostEvents",
    "movementEvents",
    "supplementEvents",
    "bowelEvents",
    "noteEvents",
    "trainingPlanEvents",
  ]) {
    for (const event of restoredDay[collection]) {
      expect(event.eventTime.slice(0, 10)).toBe(restoredDay.date);
    }
  }

  expect(restoredDay.unknownDayField).toBe("preserved");
  expect(restoredDay.meals[0]).toMatchObject({
    id: "meal-1",
    eatenAt: "2026-07-27T08:00",
    actualInsulin: "4",
    actualCreon25: "1",
    actualCreon10: "0",
    creonTime: "08:00",
    alarmEnabled: true,
    repeat: "daily",
    unknownMealField: { remains: true },
  });
  expect(restoredDay.insulinEvents[0]).toMatchObject({
    id: "insulin-1",
    eventTime: "2026-07-27T07:55",
    unknownEventField: "preserved",
  });

  // Advies en werkelijk blijven onafhankelijk; legacy insuline dubbelt niet.
  expect(restoredDay.meals[0].totals.insulin).toBe(4);
  expect(restoredDay.meals[0].actualInsulin).toBe("4");
  expect(getAdministeredInsulinTotal(restoredDay)).toBe(4);
  expect(getDailyCreonSummary(restoredDay)).toEqual({
    adviceCreon25: 2,
    adviceCreon10: 1,
    actualCreon25: 1,
    actualCreon10: 0,
    hasActualCreon: true,
  });

  // Het generieke supplement "Creon" wordt niet als actualCreon meegeteld.
  expect(restoredDay.supplementEvents[0].dosage).toBe("9 capsules");
  expect(getDailyCreonSummary(restoredDay).actualCreon25).toBe(1);
});

test("eventmoves zijn atomair, behouden IDs en verhuizen het insulinetotaal", () => {
  const original = createRealisticState().dailyLog;
  const targetDate = "2026-07-28";
  let movedLog = original;

  for (const [collection, eventId, time] of [
    ["insulinEvents", "insulin-1", "07:55"],
    ["glucoseEvents", "glucose-1", "09:00"],
    ["movementEvents", "movement-1", "11:00"],
    ["supplementEvents", "supplement-1", "08:05"],
  ]) {
    const result = moveDailyLogEvent({
      dailyLog: movedLog,
      collection,
      eventId,
      updates: { eventTime: `${targetDate}T${time}` },
    });
    expect(result.moved).toBe(true);
    movedLog = result.dailyLog;
  }

  const source = movedLog.find((day) => day.date === "2026-07-27");
  const target = movedLog.find((day) => day.date === targetDate);

  expect(source.meals).toHaveLength(1);
  expect(source.noteEvents).toHaveLength(1);
  expect(source.insulinEvents).toEqual([]);
  expect(source.glucoseEvents).toEqual([]);
  expect(source.movementEvents).toEqual([]);
  expect(source.supplementEvents).toEqual([]);
  expect(getAdministeredInsulinTotal(source)).toBe(0);
  expect(getAdministeredInsulinTotal(target)).toBe(4);
  expect(movedLog.map((day) => day.date)).toEqual([
    "2026-07-28",
    "2026-07-27",
  ]);

  for (const [collection, eventId] of [
    ["insulinEvents", "insulin-1"],
    ["glucoseEvents", "glucose-1"],
    ["movementEvents", "movement-1"],
    ["supplementEvents", "supplement-1"],
  ]) {
    expect(target[collection].filter((event) => event.id === eventId)).toHaveLength(
      1,
    );
    expect(target[collection][0].eventTime.slice(0, 10)).toBe(target.date);
  }

  const timeOnly = moveDailyLogEvent({
    dailyLog: movedLog,
    collection: "insulinEvents",
    eventId: "insulin-1",
    updates: { eventTime: `${targetDate}T08:30` },
  });
  expect(timeOnly.dailyLog.find((day) => day.date === targetDate).insulinEvents)
    .toHaveLength(1);
});

test("syncveiligheidsbeslissingen beschermen lokale data en conflicten", () => {
  const local = [{ date: "2026-07-27", meals: [{ id: "local" }] }];
  const cloud = [{ date: "2026-07-28", meals: [{ id: "cloud" }] }];

  for (const cloudResult of [
    { status: "empty", dailyLog: [] },
    { status: "missing" },
    { status: "error", error: new Error("offline") },
  ]) {
    expect(
      decideInitialArrayAuthority({ localValue: local, cloudResult }),
    ).toMatchObject({ action: "keep-local" });
  }

  expect(
    decideInitialArrayAuthority({
      localValue: [],
      cloudResult: { status: "success", dailyLog: cloud },
    }),
  ).toMatchObject({ action: "use-cloud", status: "synced" });

  expect(
    decideInitialArrayAuthority({
      localValue: local,
      cloudResult: { status: "success", dailyLog: cloud },
    }),
  ).toMatchObject({ action: "compare-non-empty", status: "conflict" });

  expect(
    decideInitialArrayAuthority({
      localValue: local,
      cloudResult: { status: "success", dailyLog: cloud },
      localChangedDuringLoad: true,
    }),
  ).toMatchObject({ action: "keep-local", status: "conflict" });

  expect(
    interpretRevisionSaveResult({ ok: false, conflict: true, revision: 9 }),
  ).toMatchObject({ keepLocal: true, blockWrites: true, status: "conflict" });
});

test("app_data maakt onderscheid tussen migratie en fout en kan leeg opslaan", () => {
  expect(shouldAttemptMigration("missing", true)).toBe(true);
  expect(shouldAttemptMigration("error", true)).toBe(false);
  expect(shouldAttemptMigration("invalid", true)).toBe(false);
  expect(
    decideInitialArrayAuthority({
      localValue: [{ id: "local-product" }],
      cloudResult: { status: "empty", value: [] },
    }),
  ).toMatchObject({ action: "keep-local" });
  expect(
    canSaveAppData({
      cloudLoaded: true,
      hasHydratedCloudData: false,
      hasLocalUserChange: true,
    }),
  ).toBe(true);
});

test("legacybackup past alleen aanwezige data toe en toekomstige versie faalt", () => {
  const legacy = {
    app: "diabetes-creon-webapp",
    version: 2,
    categories: [{ id: "legacy-category" }],
    products: [{ id: "legacy-product" }],
    rows: [],
    settings: { legacy: true },
    savedMeals: [],
    testLog: [],
  };
  const currentDailyLog = createRealisticState().dailyLog;
  const currentTimers = createRealisticState().timers;
  const restored = prepareRestoredBackupData(legacy, restoreAdapters);

  expect(restored.categories).toEqual(legacy.categories);
  expect(restored.products).toEqual(legacy.products);
  expect(restored).not.toHaveProperty("dailyLog");
  expect(restored).not.toHaveProperty("timers");
  expect(currentDailyLog).toEqual(createRealisticState().dailyLog);
  expect(currentTimers).toEqual(createRealisticState().timers);

  expect(
    validateFullBackupObject({
      ...legacy,
      version: CURRENT_BACKUP_VERSION + 1,
    }),
  ).toMatchObject({ ok: false });
});

test("corrupte backup faalt vóór restore en laat bestaande toestand intact", () => {
  const existing = createRealisticState();
  const before = JSON.parse(JSON.stringify(existing));
  const corrupt = JSON.parse(
    JSON.stringify(createFullBackupSnapshot(existing)),
  );
  corrupt.dailyLog[0].movementEvents = "corrupt";

  expect(() =>
    prepareRestoredBackupData(corrupt, restoreAdapters),
  ).toThrow(/movementEvents/);
  expect(existing).toEqual(before);
});
