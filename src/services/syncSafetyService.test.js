import {
  canSaveAppData,
  decideInitialArrayAuthority,
  interpretRevisionSaveResult,
  shouldAttemptMigration,
} from "./syncSafetyService";

const localDay = [{ date: "2026-07-27", meals: [{ id: "meal-1" }] }];
const cloudDay = [{ date: "2026-07-28", meals: [{ id: "meal-2" }] }];

test.each([
  ["lege cloud", { status: "empty", dailyLog: [] }],
  ["ontbrekende cloud", { status: "missing" }],
  ["cloud-loadfout", { status: "error", error: new Error("offline") }],
])("lokale non-empty data blijft behouden bij %s", (_label, cloudResult) => {
  expect(
    decideInitialArrayAuthority({
      localValue: localDay,
      cloudResult,
    }),
  ).toMatchObject({ action: "keep-local" });
});

test("non-empty cloud wordt geladen wanneer lokale data leeg is", () => {
  expect(
    decideInitialArrayAuthority({
      localValue: [],
      cloudResult: { status: "success", dailyLog: cloudDay },
    }),
  ).toMatchObject({ action: "use-cloud", status: "synced" });
});

test("late cloudresponse kan een lokale wijziging tijdens load niet vervangen", () => {
  expect(
    decideInitialArrayAuthority({
      localValue: [],
      cloudResult: { status: "success", dailyLog: cloudDay },
      localChangedDuringLoad: true,
    }),
  ).toMatchObject({
    action: "keep-local",
    status: "conflict",
    reason: "local-changed-during-load",
  });
});

test("twee verschillende non-empty dailyLogs worden als conflict behandeld", () => {
  expect(
    decideInitialArrayAuthority({
      localValue: localDay,
      cloudResult: { status: "success", dailyLog: cloudDay },
    }),
  ).toMatchObject({ action: "compare-non-empty", status: "conflict" });
});

test("loadfout kan geen migratie-upload starten", () => {
  expect(shouldAttemptMigration("error", true)).toBe(false);
  expect(shouldAttemptMigration("invalid", true)).toBe(false);
  expect(shouldAttemptMigration("missing", true)).toBe(true);
});

test("expliciete lokale wijziging mag ook een lege array opslaan", () => {
  expect(
    canSaveAppData({
      cloudLoaded: true,
      hasHydratedCloudData: false,
      hasLocalUserChange: true,
    }),
  ).toBe(true);
});

test("revisionconflict behoudt lokaal en blokkeert verdere writes", () => {
  expect(
    interpretRevisionSaveResult({ ok: false, conflict: true, revision: 8 }),
  ).toEqual({
    status: "conflict",
    keepLocal: true,
    blockWrites: true,
  });
});

describe("revision-aware dailyLog hydration", () => {
  const trainingAt = (time) => [
    {
      date: "2026-07-27",
      trainingPlanEvents: [
        {
          id: "training-1",
          type: "trainingPlan",
          eventTime: `2026-07-27T${time}`,
          title: "Borst + triceps",
        },
      ],
    },
  ];

  test("mobiel accepteert een aantoonbaar nieuwere cloudrevision", () => {
    const mobileLocal = trainingAt("10:00");
    const desktopCloud = trainingAt("11:00");
    const decision = decideInitialArrayAuthority({
      localValue: mobileLocal,
      localKnownRevision: 10,
      localDirty: false,
      cloudResult: {
        status: "success",
        dailyLog: desktopCloud,
        revision: 11,
      },
    });

    expect(decision).toEqual({
      action: "use-cloud",
      status: "synced",
      reason: "newer-cloud-revision-clean-local",
    });
    expect(desktopCloud[0].trainingPlanEvents[0].eventTime).toBe(
      "2026-07-27T11:00",
    );
  });

  test("lokale dirty mutation wordt niet door een nieuwere cloud overschreven", () => {
    expect(
      decideInitialArrayAuthority({
        localValue: trainingAt("10:30"),
        localKnownRevision: 10,
        localDirty: true,
        cloudResult: {
          status: "success",
          dailyLog: trainingAt("11:00"),
          revision: 11,
        },
      }),
    ).toMatchObject({
      action: "compare-non-empty",
      status: "conflict",
    });
  });

  test("ontbrekende lokale revisionmetadata blijft conservatief", () => {
    expect(
      decideInitialArrayAuthority({
        localValue: trainingAt("10:00"),
        cloudResult: {
          status: "success",
          dailyLog: trainingAt("11:00"),
          revision: 11,
        },
      }),
    ).toMatchObject({
      action: "compare-non-empty",
      status: "conflict",
    });
  });

  test("dezelfde revision met verschillende inhoud is conflictverdacht", () => {
    expect(
      decideInitialArrayAuthority({
        localValue: trainingAt("10:00"),
        localKnownRevision: 11,
        localDirty: false,
        cloudResult: {
          status: "success",
          dailyLog: trainingAt("11:00"),
          revision: 11,
        },
      }),
    ).toMatchObject({
      action: "compare-non-empty",
      status: "conflict",
    });
  });

  test("cloudfout behoudt lokale training", () => {
    expect(
      decideInitialArrayAuthority({
        localValue: trainingAt("10:00"),
        localKnownRevision: 10,
        localDirty: false,
        cloudResult: { status: "error", error: new Error("offline") },
      }),
    ).toMatchObject({
      action: "keep-local",
      status: "error",
    });
  });
});
