import { moveDailyLogEvent } from "./dailyLogEventMoveService";
import {
  addTrainingPlanEvent,
  createTrainingPlanEvent,
  removeTrainingPlanEvent,
} from "./trainingPlanService";

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

function makePlan(eventTime = "2026-07-27T10:00") {
  return createTrainingPlanEvent(
    {
      eventTime,
      title: "Borst en triceps",
      trainingType: "Krachttraining",
      durationMinutes: "60",
      note: "Rustig opbouwen",
    },
    {
      createId: () => "training-plan-event-1",
      now: () => new Date("2026-07-27T08:00:00"),
    },
  );
}

test("vandaag plannen levert een trainingPlanEvent voor vandaag op", () => {
  const result = makePlan();
  const dailyLog = addTrainingPlanEvent([], result.date, result.event);

  expect(result.date).toBe("2026-07-27");
  expect(dailyLog[0].date).toBe("2026-07-27");
  expect(dailyLog[0].trainingPlanEvents).toEqual([result.event]);
  expect(result.event).toMatchObject({
    id: "training-plan-event-1",
    type: "trainingPlan",
    title: "Borst en triceps",
    trainingType: "Krachttraining",
    durationMinutes: "60",
    note: "Rustig opbouwen",
  });
});

test("een toekomstige datum bepaalt de juiste doeldag", () => {
  const result = makePlan("2026-08-03T18:30");
  const dailyLog = addTrainingPlanEvent(
    [emptyDay("2026-07-27")],
    result.date,
    result.event,
  );

  expect(dailyLog.map((day) => day.date)).toEqual([
    "2026-08-03",
    "2026-07-27",
  ]);
  expect(dailyLog[0].trainingPlanEvents).toEqual([result.event]);
});

test("alleen de tijd wijzigen houdt dezelfde dag en hetzelfde ID", () => {
  const { event } = makePlan();
  const day = { ...emptyDay("2026-07-27"), trainingPlanEvents: [event] };
  const result = moveDailyLogEvent({
    dailyLog: [day],
    collection: "trainingPlanEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-27T19:15" },
  });

  expect(result.dailyLog[0].date).toBe("2026-07-27");
  expect(result.dailyLog[0].trainingPlanEvents[0]).toMatchObject({
    id: event.id,
    eventTime: "2026-07-27T19:15",
  });
});

test("de datum wijzigen verplaatst de planning atomair met hetzelfde ID", () => {
  const { event } = makePlan();
  const day = { ...emptyDay("2026-07-27"), trainingPlanEvents: [event] };
  const result = moveDailyLogEvent({
    dailyLog: [day],
    collection: "trainingPlanEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-29T19:15" },
  });

  expect(result.dailyLog).toHaveLength(1);
  expect(result.dailyLog[0].date).toBe("2026-07-29");
  expect(result.dailyLog[0].trainingPlanEvents[0].id).toBe(event.id);
});

test("training plannen blijft gescheiden van werkelijk geregistreerde beweging", () => {
  const { event } = makePlan();
  const movement = { id: "movement-1", eventTime: "2026-07-27T12:00" };
  const day = {
    ...emptyDay("2026-07-27"),
    movementEvents: [movement],
    trainingPlanEvents: [event],
  };

  const secondPlan = { ...event, id: "training-plan-event-2" };
  const afterDelete = removeTrainingPlanEvent(
    [{ ...day, trainingPlanEvents: [event, secondPlan] }],
    event.id,
  )[0];

  expect(afterDelete.trainingPlanEvents).toEqual([secondPlan]);
  expect(afterDelete.movementEvents).toEqual([movement]);
});
