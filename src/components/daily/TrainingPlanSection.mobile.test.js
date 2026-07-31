import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { TrainingPlanSection } from "./TrainingPlanSection";

const training = {
  id: "training-1",
  eventTime: "2026-07-28T10:00",
  title: "Borst + biceps",
  trainingType: "Krachttraining",
  durationMinutes: "60",
};

const supplementPlan = {
  id: "supplement-plan-1",
  eventTime: "2026-07-28T09:30",
  trainingPlanId: "training-1",
  name: "Creatine Monohydraat",
  amount: "5",
  unit: "gram",
};

function renderProps(overrides = {}) {
  return {
    selectedDate: "2026-07-28",
    trainingPlans: [training],
    supplementPlans: [supplementPlan],
    isMobile: true,
    dailyLog: [
      {
        date: "2026-07-28",
        movementEvents: [],
        supplementEvents: [],
      },
    ],
    onAdd: jest.fn(),
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onAddSupplementPlan: jest.fn(),
    onUpdateSupplementPlan: jest.fn(),
    onDeleteSupplementPlan: jest.fn(),
    onExecuteTraining: jest.fn(),
    onTakeSupplement: jest.fn(),
    ...overrides,
  };
}

describe("TrainingPlanSection mobiele uitvoering", () => {
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

  test("niet-uitgevoerde mobiele planning toont beide touchacties en modal", async () => {
    const props = renderProps();
    await act(async () => root.render(<TrainingPlanSection {...props} />));

    const trainingAction = container.querySelector(
      '[data-execution-action="training"]',
    );
    const supplementAction = container.querySelector(
      '[data-execution-action="supplement"]',
    );

    expect(trainingAction).not.toBeNull();
    expect(trainingAction.textContent).toContain("Als uitgevoerd registreren");
    expect(supplementAction).not.toBeNull();
    expect(supplementAction.textContent).toContain("Ingenomen");

    await act(async () => trainingAction.click());
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.body.textContent).toContain("Werkelijke datum en tijd");

    const saveButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent.includes("Werkelijk registreren"),
    );
    await act(async () => saveButton.click());

    expect(props.onExecuteTraining).toHaveBeenCalledWith(
      training,
      expect.objectContaining({
        eventTime: "2026-07-28T10:00",
        durationMinutes: "60",
      }),
    );
  });

  test("gekoppelde werkelijke events tonen status en verbergen create-acties", async () => {
    const props = renderProps({
      dailyLog: [
        {
          date: "2026-07-28",
          movementEvents: [{ id: "movement-1", trainingPlanId: "training-1" }],
          supplementEvents: [
            {
              id: "supplement-1",
              sportSupplementPlanId: "supplement-plan-1",
            },
          ],
        },
      ],
    });

    await act(async () => root.render(<TrainingPlanSection {...props} />));

    expect(container.textContent).toContain("Uitgevoerd ✓");
    expect(container.textContent).toContain("Ingenomen ✓");
    expect(
      container.querySelector('[data-execution-action="training"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-execution-action="supplement"]'),
    ).toBeNull();
  });
});
