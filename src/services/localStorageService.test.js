import {
  loadDailyLogSyncMetadata,
  saveDailyLogConflictBackup,
  saveDailyLogSyncMetadata,
  STORAGE_KEYS,
} from "./localStorageService";

beforeEach(() => {
  localStorage.clear();
});

test("gesynchroniseerde dailyLog-revision blijft lokaal bewaard", () => {
  expect(saveDailyLogSyncMetadata(11, false)).toBe(true);
  expect(loadDailyLogSyncMetadata()).toEqual({
    version: 1,
    revision: 11,
    dirty: false,
  });
});

test("dirty metadata bewaart de laatst bekende revision zonder die te verhogen", () => {
  saveDailyLogSyncMetadata(11, true);

  expect(loadDailyLogSyncMetadata()).toEqual({
    version: 1,
    revision: 11,
    dirty: true,
  });
});

test("ongeldige of oude revisionmetadata wordt niet vertrouwd", () => {
  localStorage.setItem(
    STORAGE_KEYS.dailyLogSync,
    JSON.stringify({ revision: 12, dirty: false }),
  );
  expect(loadDailyLogSyncMetadata()).toBeNull();

  localStorage.setItem(STORAGE_KEYS.dailyLogSync, "{ongeldig");
  expect(loadDailyLogSyncMetadata()).toBeNull();
});

test("expliciete conflictoplossing bewaart eerst de lokale dailyLog", () => {
  const dailyLog = [{ date: "2026-07-27", trainingPlanEvents: [] }];
  saveDailyLogConflictBackup(dailyLog, {
    localRevision: null,
    cloudRevision: 56,
  });

  expect(
    JSON.parse(localStorage.getItem(STORAGE_KEYS.dailyLogConflictBackup)),
  ).toMatchObject({
    version: 1,
    dailyLog,
    localRevision: null,
    cloudRevision: 56,
  });
});
