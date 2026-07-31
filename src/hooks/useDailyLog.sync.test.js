import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useDailyLog } from "./useDailyLog";
import {
  loadDailyLogFromCloud,
  loadDailyLogSyncMetadata,
  saveDailyLog,
  saveDailyLogConflictBackup,
  saveDailyLogSyncMetadata,
  saveDailyLogToCloud,
} from "../services/localStorageService";

jest.mock("../services/localStorageService", () => ({
  loadDailyLog: jest.fn(),
  loadDailyLogFromCloud: jest.fn(),
  loadDailyLogSyncMetadata: jest.fn(),
  saveDailyLog: jest.fn(),
  saveDailyLogConflictBackup: jest.fn(),
  saveDailyLogSyncMetadata: jest.fn(),
  saveDailyLogToCloud: jest.fn(),
}));

const date = "2026-07-27";

function dayWithTraining(time) {
  return {
    date,
    meals: [],
    insulinEvents: [],
    glucoseEvents: [],
    glucoseBoostEvents: [],
    movementEvents: [],
    supplementEvents: [],
    bowelEvents: [],
    noteEvents: [],
    trainingPlanEvents: [
      {
        id: "training-1",
        type: "trainingPlan",
        eventTime: `${date}T${time}`,
        title: "Benen",
        trainingType: "Krachttraining",
        durationMinutes: "60",
        note: "",
      },
    ],
    sportSupplementPlanEvents: [],
  };
}

describe("useDailyLog cross-device training sync", () => {
  let container;
  let root;
  let hook;

  function Harness() {
    hook = useDailyLog(date);
    return null;
  }

  function deferred() {
    let resolve;
    const promise = new Promise((next) => {
      resolve = next;
    });
    return { promise, resolve };
  }

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    jest.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    loadDailyLogSyncMetadata.mockReturnValue({
      version: 1,
      revision: 10,
      dirty: false,
    });
    loadDailyLogFromCloud.mockResolvedValue({
      status: "success",
      dailyLog: [dayWithTraining("10:00")],
      revision: 10,
      updatedAt: "2026-07-27T10:00:00.000Z",
    });
    saveDailyLogToCloud.mockResolvedValue({
      ok: true,
      conflict: false,
      revision: 11,
    });
    const localLog = [dayWithTraining("10:00")];
    jest
      .requireMock("../services/localStorageService")
      .loadDailyLog.mockReturnValue(localLog);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.clearAllMocks();
    jest.useRealTimers();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  test("trainingedit wordt dirty, schrijft 11:00 en wordt revision 11 synced", async () => {
    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });

    await act(async () => {
      hook.updateTrainingPlanEvent("training-1", {
        eventTime: `${date}T11:00`,
      });
    });

    expect(saveDailyLogSyncMetadata).toHaveBeenCalledWith(10, true);

    await act(async () => {
      jest.advanceTimersByTime(1500);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(saveDailyLogToCloud).toHaveBeenCalledTimes(1);
    const [payload, expectedRevision] = saveDailyLogToCloud.mock.calls[0];
    expect(expectedRevision).toBe(10);
    expect(payload[0].trainingPlanEvents[0]).toMatchObject({
      id: "training-1",
      eventTime: `${date}T11:00`,
    });
    expect(saveDailyLog).toHaveBeenLastCalledWith(payload);
    expect(saveDailyLogSyncMetadata).toHaveBeenLastCalledWith(11, false);
    expect(hook.syncDebug).toMatchObject({
      status: "synced",
      conflict: false,
      cloud: { revision: 11 },
      local: { revision: 11 },
    });
  });

  test.each([
    [false, false],
    [true, true],
  ])(
    "runtime start toont revision 74 en dirty %s uit geldige metadata",
    async (dirty, expectedDirty) => {
      const cloudLoad = deferred();
      loadDailyLogSyncMetadata.mockReturnValue({
        version: 1,
        revision: 74,
        dirty,
      });
      loadDailyLogFromCloud.mockReturnValue(cloudLoad.promise);

      await act(async () => {
        root.render(<Harness />);
      });

      expect(hook.syncDebug.local).toMatchObject({
        revision: 74,
        baselineKnown: true,
        dirty: expectedDirty,
      });
    },
  );

  test("initieel conflict toont revisions, dirty, decision reason en contentverschil", async () => {
    loadDailyLogSyncMetadata.mockReturnValue({
      version: 1,
      revision: 74,
      dirty: true,
    });
    jest
      .requireMock("../services/localStorageService")
      .loadDailyLog.mockReturnValue([dayWithTraining("11:00")]);
    loadDailyLogFromCloud.mockResolvedValue({
      status: "success",
      dailyLog: [dayWithTraining("10:00")],
      revision: 75,
      updatedAt: "2026-07-28T10:00:00.000Z",
    });

    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });

    expect(hook.syncDebug).toMatchObject({
      status: "conflict",
      conflict: true,
      cloud: { revision: 75 },
      local: { revision: 74, baselineKnown: true, dirty: true },
      decision: {
        action: "compare-non-empty",
        reason: "both-non-empty",
        contentEqual: false,
      },
    });
  });

  test("handmatig cloud accepteren bewaart revision 75 voor een nieuwe runtime", async () => {
    loadDailyLogSyncMetadata.mockReturnValue({
      version: 1,
      revision: 74,
      dirty: true,
    });
    jest
      .requireMock("../services/localStorageService")
      .loadDailyLog.mockReturnValue([dayWithTraining("11:00")]);
    loadDailyLogFromCloud.mockResolvedValue({
      status: "success",
      dailyLog: [dayWithTraining("10:00")],
      revision: 75,
      updatedAt: "2026-07-28T10:00:00.000Z",
    });

    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });
    await act(async () => {
      await hook.acceptLatestCloudDailyLog();
    });

    expect(saveDailyLogConflictBackup).toHaveBeenCalledWith(
      expect.any(Array),
      { localRevision: 74, cloudRevision: 75 },
    );
    expect(saveDailyLogSyncMetadata).toHaveBeenLastCalledWith(75, false);
    expect(hook.syncDebug.local).toMatchObject({
      revision: 75,
      baselineKnown: true,
      dirty: false,
    });

    await act(async () => root.unmount());
    root = createRoot(container);
    loadDailyLogSyncMetadata.mockReturnValue({
      version: 1,
      revision: 75,
      dirty: false,
    });
    const nextCloudLoad = deferred();
    loadDailyLogFromCloud.mockReturnValue(nextCloudLoad.promise);

    await act(async () => {
      root.render(<Harness />);
    });
    expect(hook.syncDebug.local).toMatchObject({
      revision: 75,
      baselineKnown: true,
      dirty: false,
    });
  });

  test("ontbrekende metadata toont expliciet een onbekende lokale baseline", async () => {
    loadDailyLogSyncMetadata.mockReturnValue(null);
    const cloudLoad = deferred();
    loadDailyLogFromCloud.mockReturnValue(cloudLoad.promise);

    await act(async () => {
      root.render(<Harness />);
    });

    expect(hook.syncDebug.local).toMatchObject({
      revision: null,
      baselineKnown: false,
      dirty: null,
    });
  });
});
