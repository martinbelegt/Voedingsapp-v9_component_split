import React, { act } from "react";
import { createRoot } from "react-dom/client";
import {
  DeveloperSyncMonitor,
  getSyncMonitorStatus,
} from "./DeveloperSyncMonitor";

function debugState(overrides = {}) {
  return {
    source: "Local",
    status: "conflict",
    conflict: true,
    cloud: { revision: 75, days: 1, events: 1 },
    local: {
      revision: 74,
      baselineKnown: true,
      dirty: true,
      days: 1,
      events: 1,
    },
    decision: {
      action: "compare-non-empty",
      reason: "both-non-empty",
      contentEqual: false,
    },
    ...overrides,
  };
}

test("monitor toont veilige conflictcontext zonder dagelijkse inhoud", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<DeveloperSyncMonitor syncDebug={debugState()} />);
  });

  expect(container.textContent).toContain("Revision: 74");
  expect(container.textContent).toContain("Dirty: Ja");
  expect(container.textContent).toContain("Cloud revision: 75");
  expect(container.textContent).toContain("Beslissing: compare-non-empty");
  expect(container.textContent).toContain("Reden: both-non-empty");
  expect(container.textContent).toContain("Inhoud: Verschillend");
  expect(container.textContent).toContain(
    "Lokale niet-gesynchroniseerde wijzigingen",
  );

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});

test("ontbrekende baseline krijgt een expliciete status", () => {
  const state = debugState({
    local: {
      revision: null,
      baselineKnown: false,
      dirty: null,
      days: 1,
      events: 1,
    },
  });

  expect(getSyncMonitorStatus(state).label).toContain(
    "Onbekende lokale baseline",
  );
});

test("clean lokale baseline met nieuwere cloud krijgt geen generieke mismatch", () => {
  const state = debugState({
    local: {
      revision: 74,
      baselineKnown: true,
      dirty: false,
      days: 1,
      events: 1,
    },
  });

  expect(getSyncMonitorStatus(state).label).toContain(
    "Cloud nieuwer dan lokale baseline",
  );
});
