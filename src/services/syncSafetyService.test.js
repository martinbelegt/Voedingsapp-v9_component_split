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
