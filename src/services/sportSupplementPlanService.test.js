import { moveDailyLogEvent } from "./dailyLogEventMoveService";
import {
  addSportSupplementPlanEvent,
  createSportSupplementPlanEvent,
  removeSportSupplementPlanEvent,
} from "./sportSupplementPlanService";
import { removeTrainingPlanEvent } from "./trainingPlanService";

function emptyDay(date) {
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
    trainingPlanEvents: [],
    sportSupplementPlanEvents: [],
  };
}

function createPlan(eventTime = "2026-07-28T09:30") {
  return createSportSupplementPlanEvent(
    {
      eventTime,
      trainingPlanId: "training-1",
      intakeItemId: "intake-creatine",
      name: "Creatine Monohydraat",
      amount: "5",
      unit: "gram",
      note: "Met voldoende water",
    },
    {
      createId: () => "sport-supplement-plan-1",
      now: () => new Date("2026-07-27T08:00:00"),
    },
  );
}

test("supplementplanning maakt de juiste toekomstige dailyLog-dag", () => {
  const { date, event } = createPlan();
  const dailyLog = addSportSupplementPlanEvent([], date, event);

  expect(date).toBe("2026-07-28");
  expect(dailyLog[0].sportSupplementPlanEvents).toEqual([event]);
  expect(event.trainingPlanId).toBe("training-1");
  expect(dailyLog[0].supplementEvents).toEqual([]);
});

test("tijd wijzigen houdt dag, ID en trainingPlanId gelijk", () => {
  const { event } = createPlan();
  const result = moveDailyLogEvent({
    dailyLog: [
      {
        ...emptyDay("2026-07-28"),
        sportSupplementPlanEvents: [event],
      },
    ],
    collection: "sportSupplementPlanEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-28T09:45" },
  });

  expect(result.dailyLog[0].sportSupplementPlanEvents[0]).toMatchObject({
    id: event.id,
    eventTime: "2026-07-28T09:45",
    trainingPlanId: "training-1",
  });
});

test("datum wijzigen verhuist atomair met hetzelfde ID", () => {
  const { event } = createPlan();
  const result = moveDailyLogEvent({
    dailyLog: [
      {
        ...emptyDay("2026-07-28"),
        sportSupplementPlanEvents: [event],
      },
    ],
    collection: "sportSupplementPlanEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-29T09:30" },
  });

  expect(result.dailyLog).toHaveLength(1);
  expect(result.dailyLog[0].date).toBe("2026-07-29");
  expect(result.dailyLog[0].sportSupplementPlanEvents[0].id).toBe(event.id);
});

test("verwijderen raakt alleen het gekozen plan en nooit supplementEvents", () => {
  const { event } = createPlan();
  const second = { ...event, id: "sport-supplement-plan-2" };
  const actual = { id: "supplement-actual-1", type: "supplement" };
  const result = removeSportSupplementPlanEvent(
    [
      {
        ...emptyDay("2026-07-28"),
        supplementEvents: [actual],
        sportSupplementPlanEvents: [event, second],
      },
    ],
    event.id,
  );

  expect(result[0].sportSupplementPlanEvents).toEqual([second]);
  expect(result[0].supplementEvents).toEqual([actual]);
});

test("training verwijderen vernietigt gekoppelde supplementplanning niet", () => {
  const { event } = createPlan();
  const day = {
    ...emptyDay("2026-07-28"),
    trainingPlanEvents: [{ id: "training-1" }],
    sportSupplementPlanEvents: [event],
  };
  const withoutTraining = removeTrainingPlanEvent([day], "training-1")[0];

  expect(withoutTraining.sportSupplementPlanEvents).toEqual([event]);
});
