import React, { act } from "react";
import { createRoot } from "react-dom/client";
import {
  DailyDateNavigation,
  formatAdjacentDateLabel,
  shiftCalendarDate,
} from "./DailyDateNavigation";

describe("DailyDateNavigation", () => {
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
    document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
      dialog.parentElement?.remove();
    });
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  test.each([
    ["2026-07-29", -1, "2026-07-28"],
    ["2026-07-29", 1, "2026-07-30"],
    ["2026-08-01", -1, "2026-07-31"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2026-01-01", -1, "2025-12-31"],
  ])("%s met stap %s wordt %s", (value, offset, expected) => {
    expect(shiftCalendarDate(value, offset)).toBe(expected);
  });

  test("gebruikt menselijke labels rond vandaag", () => {
    const today = "2026-07-29";

    expect(formatAdjacentDateLabel("2026-07-27", today)).toBe("Eergisteren");
    expect(formatAdjacentDateLabel("2026-07-28", today)).toBe("Gisteren");
    expect(formatAdjacentDateLabel("2026-07-29", today)).toBe("Vandaag");
    expect(formatAdjacentDateLabel("2026-07-30", today)).toBe("Morgen");
    expect(formatAdjacentDateLabel("2026-07-31", today)).toBe("Overmorgen");
    expect(formatAdjacentDateLabel("2026-07-25", today)).toBe("25 jul");
  });

  test("navigeert van vandaag naar gisteren en morgen", async () => {
    const setSelectedDate = jest.fn();

    await act(async () =>
      root.render(
        <DailyDateNavigation
          selectedDate="2026-07-29"
          setSelectedDate={setSelectedDate}
          today="2026-07-29"
        />,
      ),
    );

    expect(container.textContent).toContain("29 jul 2026");
    expect(container.textContent).not.toContain("Gisteren");
    expect(container.textContent).not.toContain("Morgen");
    expect(container.textContent).not.toContain("Vandaag");

    await act(async () =>
      container.querySelector('[aria-label^="Vorige dag"]').click(),
    );
    expect(setSelectedDate).toHaveBeenLastCalledWith("2026-07-28");

    await act(async () =>
      container.querySelector('[aria-label^="Volgende dag"]').click(),
    );
    expect(setSelectedDate).toHaveBeenLastCalledWith("2026-07-30");
  });

  test("doorloopt gisteren en morgen steeds terug naar vandaag", async () => {
    function NavigationHarness() {
      const [selectedDate, setSelectedDate] = React.useState("2026-07-29");

      return (
        <DailyDateNavigation
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          today="2026-07-29"
        />
      );
    }

    await act(async () => root.render(<NavigationHarness />));

    await act(async () =>
      container.querySelector('[aria-label^="Vorige dag"]').click(),
    );
    expect(container.textContent).toContain("28 jul 2026");

    await act(async () =>
      container.querySelector('[aria-label^="Volgende dag"]').click(),
    );
    expect(container.textContent).toContain("29 jul 2026");

    await act(async () =>
      container.querySelector('[aria-label^="Volgende dag"]').click(),
    );
    expect(container.textContent).toContain("30 jul 2026");

    await act(async () =>
      container.querySelector('[aria-label^="Vorige dag"]').click(),
    );
    expect(container.textContent).toContain("29 jul 2026");
  });

  test("toont uitsluitend datums bij geselecteerd morgen", async () => {
    const setSelectedDate = jest.fn();

    await act(async () =>
      root.render(
        <DailyDateNavigation
          selectedDate="2026-07-30"
          setSelectedDate={setSelectedDate}
          today="2026-07-29"
        />,
      ),
    );

    const navigation = container.querySelector(
      '[data-testid="daily-date-navigation"]',
    );
    expect(navigation.textContent).toContain("30 jul 2026");
    expect(navigation.textContent).not.toContain("Vandaag");
    expect(navigation.textContent).not.toContain("Overmorgen");

    const todayButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Vandaag",
    );
    expect(todayButton.style.height).toBe("28px");
    expect(todayButton.style.borderRadius).toBe("3px");
    expect(todayButton.style.background).toBe("rgb(238, 248, 241)");

    await act(async () =>
      todayButton.click(),
    );
    expect(setSelectedDate).toHaveBeenLastCalledWith("2026-07-29");
  });

  test("toont uitsluitend datums bij geselecteerd gisteren", async () => {
    await act(async () =>
      root.render(
        <DailyDateNavigation
          selectedDate="2026-07-28"
          setSelectedDate={jest.fn()}
          today="2026-07-29"
        />,
      ),
    );

    const navigation = container.querySelector(
      '[data-testid="daily-date-navigation"]',
    );
    expect(navigation.textContent).toContain("28 jul 2026");
    expect(navigation.textContent).not.toContain("Eergisteren");
    expect(navigation.textContent).not.toContain("Vandaag");
  });

  test("blijft op mobiel een compacte toolbarselector en opent de datumkiezer", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });

    await act(async () =>
      root.render(
        <DailyDateNavigation
          selectedDate="2026-07-29"
          setSelectedDate={jest.fn()}
          today="2026-07-29"
        />,
      ),
    );

    const navigation = container.querySelector(
      '[data-testid="daily-date-navigation"]',
    );
    expect(navigation.style.display).toBe("flex");
    expect(navigation.style.overflow).toBe("hidden");
    expect(navigation.style.height).toBe("28px");

    const pickerButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("29 jul 2026"),
    );
    expect(pickerButton.textContent).toContain("29 jul 2026");
    expect(pickerButton.textContent).not.toContain("...");
    expect(pickerButton.style.minHeight).toBe("26px");
    expect(pickerButton.style.background).toBe("transparent");
    expect(pickerButton.parentElement.style.background).toBe("rgb(238, 248, 241)");
    expect(
      container.querySelector('[aria-label^="Vorige dag"]').style.background,
    ).toBe("transparent");
    expect(
      container.querySelector('[aria-label^="Vorige dag"]').style.width,
    ).toBe("34px");
    expect(
      container.querySelector('[aria-label^="Volgende dag"]').style.width,
    ).toBe("34px");
    navigation.getBoundingClientRect = () => ({
      left: 12,
      right: 378,
      top: 20,
      bottom: 64,
      width: 366,
      height: 44,
    });
    pickerButton.getBoundingClientRect = () => ({
      left: 136,
      right: 254,
      top: 23,
      bottom: 61,
      width: 118,
      height: 38,
    });

    await act(async () => pickerButton.click());
    const dialog = document.body.querySelector('[role="dialog"]');
    expect(dialog.textContent).toContain("Datum verfijnen");
    expect(dialog.textContent).not.toContain("Vandaag");
    expect(dialog.textContent).not.toContain("Gisteren");
    expect(dialog.textContent).not.toContain("Morgen");
    expect(dialog.style.left).toBe("6px");
    expect(dialog.style.top).toBe("64px");
    expect(dialog.style.width).toBe("378px");
    expect(dialog.querySelector('[aria-label="Dag verlagen"]').style.minHeight).toBe(
      "44px",
    );
    expect(dialog.querySelector('[aria-label="Dag verhogen"]').style.minHeight).toBe(
      "44px",
    );
  });
});
