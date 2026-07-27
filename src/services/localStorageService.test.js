import {
  loadDailyLogSyncMetadata,
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
