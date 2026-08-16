import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { DailyTab } from "./DailyTab";

function changeInput(input, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  valueSetter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function Harness({ onWeight, onMovement, onSupplement, onExercise }) {
  const [selectedDay, setSelectedDay] = useState({
    date: "2026-07-31",
    meals: [],
    insulinEvents: [],
    glucoseEvents: [],
    glucoseBoostEvents: [],
    movementEvents: [],
    weightEvents: [],
    supplementEvents: [],
    bowelEvents: [],
    noteEvents: [],
    trainingPlanEvents: [],
    sportSupplementPlanEvents: [],
  });
  const noop = jest.fn();

  return (
    <DailyTab
      settings={{}}
      selectedDate="2026-07-31"
      setSelectedDate={noop}
      sortedDates={[]}
      dayTotals={{}}
      selectedDay={selectedDay}
      showTimelineAnalysis={false}
      showTimelineControls={false}
      setShowTimelineControls={noop}
      clearDailyLog={noop}
      fillDailyRepeats={noop}
      products={[]}
      deleteMealFromDay={noop}
      updateMealTime={noop}
      updateMealMedicalLog={noop}
      cardStyle={{}}
      buttonStyle={{}}
      addInsulinEventToDay={noop}
      updateInsulinEvent={noop}
      deleteInsulinEvent={noop}
      addGlucoseEventToDay={noop}
      updateGlucoseEvent={noop}
      deleteGlucoseEvent={noop}
      addGlucoseBoostEventToDay={noop}
      updateGlucoseBoostEvent={noop}
      deleteGlucoseBoostEvent={noop}
      addMovementEventToDay={(input) => {
        onMovement(input);
        setSelectedDay((day) => ({
          ...day,
          movementEvents: [
            ...day.movementEvents,
            { id: "movement-1", type: "movement", ...input },
          ],
        }));
      }}
      updateMovementEvent={noop}
      deleteMovementEvent={noop}
      addWeightEventToDay={(input) => {
        onWeight(input);
        setSelectedDay((day) => ({
          ...day,
          weightEvents: [
            ...day.weightEvents,
            {
              id: "weight-1",
              type: "weight",
              datetime: input.eventTime,
              ...input,
            },
          ],
        }));
      }}
      updateWeightEvent={noop}
      deleteWeightEvent={noop}
      addSupplementEventToDay={noop}
      updateSupplementEvent={noop}
      deleteSupplementEvent={noop}
      addBowelEventToDay={noop}
      updateBowelEvent={noop}
      deleteBowelEvent={noop}
      addNoteEventToDay={noop}
      updateNoteEvent={noop}
      deleteNoteEvent={noop}
      addTrainingPlanEventToDay={noop}
      updateTrainingPlanEvent={noop}
      deleteTrainingPlanEvent={noop}
      updateSportSupplementPlanEvent={noop}
      deleteSportSupplementPlanEvent={noop}
      executeTrainingPlan={noop}
      takeSportSupplementPlan={noop}
      dailyLog={[]}
      onAddMeal={noop}
      onAddSupplement={onSupplement}
      onAddExercise={onExercise}
    />
  );
}

describe("compacte dagelijkse events", () => {
  let container;
  let root;
  let onWeight;
  let onMovement;
  let onSupplement;
  let onExercise;

  beforeEach(async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    window.requestAnimationFrame = (callback) => callback();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    onWeight = jest.fn();
    onMovement = jest.fn();
    onSupplement = jest.fn();
    onExercise = jest.fn();
    await act(async () =>
      root.render(
        <Harness
          onWeight={onWeight}
          onMovement={onMovement}
          onSupplement={onSupplement}
          onExercise={onExercise}
        />,
      ),
    );
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  test("gewicht opent inline, sluit na opslaan en verschijnt direct", async () => {
    const weightButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Gewicht"),
    );
    await act(async () => weightButton.click());
    expect(container.querySelector('[data-compact-event="weight"]')).not.toBeNull();

    await act(async () =>
      changeInput(
        container.querySelector('[data-compact-event="weight"] input[inputmode="decimal"]'),
        "78,4",
      ),
    );
    const submit = Array.from(
      container.querySelectorAll('[data-compact-event="weight"] button'),
    ).find((button) => button.textContent === "Zet op tijdlijn");
    await act(async () => submit.click());

    expect(onWeight).toHaveBeenCalledWith(
      expect.objectContaining({ valueKg: 78.4 }),
    );
    expect(container.querySelector('[data-compact-event="weight"]')).toBeNull();
    expect(container.textContent).toContain("Gewicht · 78,4 kg");
  });

  test("beweging opent inline en sluit na Zet op tijdlijn", async () => {
    const movementButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Beweging"),
    );
    await act(async () => movementButton.click());
    const panel = container.querySelector('[data-compact-event="movement"]');
    expect(panel).not.toBeNull();
    await act(async () =>
      changeInput(
        panel.querySelector('input[placeholder="bijv. wandelen of fietsen"]'),
        "Wandelen",
      ),
    );
    const submit = Array.from(panel.querySelectorAll("button")).find(
      (button) => button.textContent === "Zet op tijdlijn",
    );
    await act(async () => submit.click());

    expect(onMovement).toHaveBeenCalledWith(
      expect.objectContaining({ activityType: "Wandelen" }),
    );
    expect(container.querySelector('[data-compact-event="movement"]')).toBeNull();
    expect(container.textContent).toContain("Wandelen");
  });

  test("supplement opent de catalogusroute en nooit een compact paneel", async () => {
    const supplementButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Supplement"),
    );
    await act(async () => supplementButton.click());

    expect(onSupplement).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-compact-event="supplement"]')).toBeNull();
  });

  test("oefening opent de catalogusroute terwijl beweging een vrij invoerpaneel houdt", async () => {
    const exerciseButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Oefening"),
    );
    await act(async () => exerciseButton.click());
    expect(onExercise).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-compact-event="exercise"]')).toBeNull();

    const movementButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Beweging"),
    );
    await act(async () => movementButton.click());
    expect(container.querySelector('[data-compact-event="movement"]')).not.toBeNull();
  });

  test("annuleren met gewichtswijziging bewaart niets", async () => {
    const weightButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Gewicht"),
    );
    await act(async () => weightButton.click());
    const panel = container.querySelector('[data-compact-event="weight"]');
    await act(async () =>
      changeInput(panel.querySelector('input[inputmode="decimal"]'), "80,2"),
    );
    const cancel = Array.from(panel.querySelectorAll("button")).find(
      (button) => button.textContent === "Annuleren",
    );
    await act(async () => cancel.click());
    expect(container.textContent).toContain(
      "Je hebt niet-opgeslagen wijzigingen.",
    );
    const discard = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Wijzigingen weggooien",
    );
    await act(async () => discard.click());

    expect(onWeight).not.toHaveBeenCalled();
    expect(container.querySelector('[data-compact-event="weight"]')).toBeNull();
  });
});
