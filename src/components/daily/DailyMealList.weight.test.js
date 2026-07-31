import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { DailyMealList } from "./DailyMealList";

test("gewicht verschijnt met Nederlandse kommaweergave op de tijdlijn", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <DailyMealList
        selectedDate="2026-07-31"
        selectedDay={{ date: "2026-07-31" }}
        weightEventsForDay={[
          {
            id: "weight-1",
            type: "weight",
            valueKg: 78.4,
            eventTime: "2026-07-31T07:42",
            datetime: "2026-07-31T07:42",
            note: "Ochtendmeting",
          },
        ]}
        products={[]}
        buttonStyle={{}}
        setAddEventType={jest.fn()}
        setShowTimelineControls={jest.fn()}
        onAddMeal={jest.fn()}
        clearDailyLog={jest.fn()}
        fillDailyRepeats={jest.fn()}
        updateWeightEvent={jest.fn()}
        deleteWeightEvent={jest.fn()}
      />,
    );
  });

  expect(container.textContent).toContain("Gewicht · 78,4 kg");
  expect(container.textContent).toContain("07:42");
  expect(container.textContent).toContain("Ochtendmeting");
  expect(container.textContent).not.toContain(
    "Geen tijdlijnmomenten opgeslagen",
  );

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
