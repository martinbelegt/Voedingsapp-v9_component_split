import {
  isSportSupplementPlanTaken,
  isTrainingPlanExecuted,
  registerSportSupplementPlanIntake,
  registerTrainingPlanExecution,
} from "./plannedExecutionService";

const date = "2026-07-28";

function day() {
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
        eventTime: `${date}T10:00`,
        title: "Borst + biceps",
        trainingType: "Krachttraining",
        durationMinutes: "60",
      },
    ],
    sportSupplementPlanEvents: [
      {
        id: "plan-supplement-1",
        eventTime: `${date}T09:30`,
        trainingPlanId: "training-1",
        intakeItemId: "intake-creatine",
        name: "Creatine",
        amount: "5",
        unit: "gram",
      },
    ],
  };
}

const options = {
  createId: (prefix) => `${prefix}-created`,
  now: () => new Date("2026-07-28T08:00:00"),
};

test("training uitvoeren maakt één gekoppeld movementEvent en behoudt planning", () => {
  const original = [day()];
  const training = original[0].trainingPlanEvents[0];
  const first = registerTrainingPlanExecution(
    original,
    training,
    { eventTime: "2026-07-29T00:15", durationMinutes: "65" },
    options,
  );
  const second = registerTrainingPlanExecution(
    first.dailyLog,
    training,
    { eventTime: "2026-07-29T00:20", durationMinutes: "70" },
    options,
  );

  expect(first.created).toBe(true);
  expect(first.event).toMatchObject({
    trainingPlanId: "training-1",
    eventTime: "2026-07-29T00:15",
    durationMinutes: "65",
  });
  expect(first.dailyLog[0].date).toBe("2026-07-29");
  expect(
    first.dailyLog.flatMap((entry) => entry.trainingPlanEvents),
  ).toContainEqual(training);
  expect(second.created).toBe(false);
  expect(second.reason).toBe("already-executed");
  expect(
    second.dailyLog.flatMap((entry) => entry.movementEvents),
  ).toHaveLength(1);
});

test("supplement innemen maakt één gekoppeld supplementEvent en behoudt planning", () => {
  const original = [day()];
  const plan = original[0].sportSupplementPlanEvents[0];
  const first = registerSportSupplementPlanIntake(
    original,
    plan,
    {
      eventTime: "2026-07-28T09:40",
      amount: "6",
      unit: "gram",
    },
    options,
  );
  const second = registerSportSupplementPlanIntake(
    first.dailyLog,
    plan,
    { eventTime: "2026-07-28T09:45", amount: "7", unit: "gram" },
    options,
  );

  expect(first.event).toMatchObject({
    sportSupplementPlanId: "plan-supplement-1",
    intakeItemId: "intake-creatine",
    eventTime: "2026-07-28T09:40",
    amount: "6",
    unit: "gram",
    dosage: "6 gram",
  });
  expect(first.dailyLog[0].sportSupplementPlanEvents).toEqual([plan]);
  expect(second.created).toBe(false);
  expect(first.dailyLog[0].movementEvents).toEqual([]);
  expect(second.dailyLog[0].supplementEvents).toHaveLength(1);
});

test("status wordt uitsluitend uit gekoppelde werkelijke events afgeleid", () => {
  const original = [day()];
  expect(isTrainingPlanExecuted(original, "training-1")).toBe(false);
  expect(isSportSupplementPlanTaken(original, "plan-supplement-1")).toBe(false);

  const withActual = [
    {
      ...day(),
      movementEvents: [{ id: "movement-1", trainingPlanId: "training-1" }],
      supplementEvents: [
        {
          id: "supplement-1",
          sportSupplementPlanId: "plan-supplement-1",
        },
      ],
    },
  ];
  expect(isTrainingPlanExecuted(withActual, "training-1")).toBe(true);
  expect(isSportSupplementPlanTaken(withActual, "plan-supplement-1")).toBe(
    true,
  );

  withActual[0].movementEvents = [];
  withActual[0].supplementEvents = [];
  expect(isTrainingPlanExecuted(withActual, "training-1")).toBe(false);
  expect(isSportSupplementPlanTaken(withActual, "plan-supplement-1")).toBe(
    false,
  );
});
