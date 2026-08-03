import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { DailyTimelineItem } from "./DailyTimelineItem";

describe("DailyTimelineItem ingeklapt", () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  test("houdt lange eventinformatie op precies één visuele regel", async () => {
    await act(async () => {
      root.render(
        <DailyTimelineItem
          compact
          timeLabel="07:30"
          icon="💊"
          title="Puur L-Glutamine met een uitzonderlijk lange omschrijving"
          subtitle="Deze notitie mag ingeklapt niet op een tweede regel staan"
        />,
      );
    });

    expect(container.textContent).not.toContain("Deze notitie");
    const titleRow = Array.from(container.querySelectorAll("div")).find(
      (element) => element.style.textOverflow === "ellipsis",
    );
    expect(titleRow).toBeTruthy();
    expect(titleRow.style.whiteSpace).toBe("nowrap");
    expect(titleRow.style.overflow).toBe("hidden");
  });
});
