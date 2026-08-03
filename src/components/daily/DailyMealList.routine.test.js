import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { DailyMealList } from "./DailyMealList";

test("routine-uitvoering verschijnt als één kaart met onderliggende events bij uitklappen", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const routineExecution = {
    id: "execution-1",
    routineId: "routine-1",
    name: "Ochtend",
    icon: "☀️",
    color: "#557a5b",
    itemCount: 2,
  };

  await act(async () => {
    root.render(
      <DailyMealList
        selectedDate="2026-08-03"
        selectedDay={{ date: "2026-08-03" }}
        mealsForDay={[{
          id: "meal-1",
          name: "Ochtend",
          eatenAt: "2026-08-03T08:00:00.000Z",
          rows: [{ productId: "food-1" }],
          totals: {},
          routineExecution,
        }]}
        supplementEventsForDay={[{
          id: "supplement-1",
          eventTime: "2026-08-03T08:00:00.000Z",
          supplementName: "Magnesium",
          routineExecution,
        }]}
        products={[{ id: "food-1", name: "Havermout" }]}
        buttonStyle={{}}
        setAddEventType={jest.fn()}
        setShowTimelineControls={jest.fn()}
        clearDailyLog={jest.fn()}
        fillDailyRepeats={jest.fn()}
        onAddMeal={jest.fn()}
      />,
    );
  });

  expect(container.querySelectorAll('[data-timeline-item="routine"]')).toHaveLength(1);
  expect(container.textContent).toContain("Ochtend · 2 onderdelen");
  expect(container.textContent).not.toContain("Havermout");
  expect(container.textContent).not.toContain("Magnesium");

  await act(async () => {
    container.querySelector('[data-timeline-item="routine"] > div').click();
  });

  expect(container.textContent).toContain("Havermout");
  expect(container.textContent).toContain("Magnesium");

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
