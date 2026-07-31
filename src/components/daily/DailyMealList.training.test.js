import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { DailyMealList } from "./DailyMealList";

const training = {
  id: "training-1",
  type: "trainingPlan",
  eventTime: "2026-07-28T15:30",
  title: "Borsttraining",
  durationMinutes: "60",
  exercises: [
    {
      id: "exercise-1",
      name: "Incline Dumbbell Press",
      order: 0,
      sets: 3,
      repsMin: 6,
      repsMax: 10,
    },
  ],
};

test("geplande training voorkomt lege melding en blijft in compacte tijdlijn zichtbaar", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const deleteTrainingPlanEvent = jest.fn();
  const executeTrainingPlan = jest.fn();

  await act(async () => {
    root.render(
      <DailyMealList
        selectedDate="2026-07-28"
        selectedDay={{ date: "2026-07-28" }}
        trainingPlansForDay={[training]}
        dailyLog={[]}
        products={[]}
        buttonStyle={{}}
        setAddEventType={jest.fn()}
        setShowTimelineControls={jest.fn()}
        onAddMeal={jest.fn()}
        clearDailyLog={jest.fn()}
        fillDailyRepeats={jest.fn()}
        updateTrainingPlanEvent={jest.fn()}
        deleteTrainingPlanEvent={deleteTrainingPlanEvent}
        executeTrainingPlan={executeTrainingPlan}
      />,
    );
  });

  expect(container.textContent).toContain("Borsttraining");
  expect(container.textContent).toContain(
    "Incline Dumbbell Press · 3 × 6–10",
  );
  expect(container.textContent).not.toContain(
    "Geen tijdlijnmomenten opgeslagen",
  );
  expect(container.textContent).not.toContain("+ Maaltijd");
  expect(container.textContent).toContain("📅 Gepland");

  await act(async () =>
    container.querySelector('[data-timeline-item="training"] > div').click(),
  );
  expect(document.body.textContent).toContain("Als uitgevoerd registreren");
  expect(document.body.textContent).toContain("Wijzigen");
  expect(document.body.textContent).toContain("Verwijderen");

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
