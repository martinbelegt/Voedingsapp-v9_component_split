import {
  DAILY_EVENT_COLLECTIONS,
  moveDailyLogEvent,
} from "./dailyLogEventMoveService";

const supportedCollections = DAILY_EVENT_COLLECTIONS.filter(
  (collection) => collection !== "sportSupplementPlanEvents",
);

function eventFor(collection, id = `${collection}-1`, date = "2026-07-27") {
  return {
    id,
    type: collection,
    eventTime: `${date}T09:00`,
    note: "behouden",
  };
}

function dayWith(collection, event, date = "2026-07-27", extra = {}) {
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
    ...extra,
    [collection]: [event],
  };
}

test("alleen tijd wijzigen houdt event en ID in dezelfde dag", () => {
  const event = eventFor("insulinEvents");
  const result = moveDailyLogEvent({
    dailyLog: [dayWith("insulinEvents", event)],
    collection: "insulinEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-27T11:30", units: "4" },
  });

  expect(result.moved).toBe(true);
  expect(result.dailyLog).toHaveLength(1);
  expect(result.dailyLog[0].insulinEvents[0]).toMatchObject({
    id: event.id,
    eventTime: "2026-07-27T11:30",
    units: "4",
    note: "behouden",
  });
});

test.each(supportedCollections)(
  "%s verhuist atomair naar een andere dag",
  (collection) => {
    const event = eventFor(collection);
    const result = moveDailyLogEvent({
      dailyLog: [dayWith(collection, event)],
      collection,
      eventId: event.id,
      updates: { eventTime: "2026-07-28T09:30" },
    });

    expect(result.moved).toBe(true);
    expect(result.dailyLog).toHaveLength(1);
    expect(result.dailyLog[0].date).toBe("2026-07-28");
    expect(result.dailyLog[0][collection]).toEqual([
      {
        ...event,
        eventTime: "2026-07-28T09:30",
      },
    ]);
  },
);

test("niet-bestaande doeldag wordt aangemaakt en dagen worden aflopend gesorteerd", () => {
  const event = eventFor("glucoseEvents");
  const result = moveDailyLogEvent({
    dailyLog: [
      dayWith("glucoseEvents", event),
      dayWith(
        "noteEvents",
        eventFor("noteEvents", "note-old", "2026-07-26"),
        "2026-07-26",
      ),
    ],
    collection: "glucoseEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-29T08:00" },
  });

  expect(result.dailyLog.map((day) => day.date)).toEqual([
    "2026-07-29",
    "2026-07-26",
  ]);
});

test("bestaande doeldag krijgt het event exact eenmaal", () => {
  const event = eventFor("movementEvents");
  const targetNote = eventFor("noteEvents", "target-note", "2026-07-28");
  const result = moveDailyLogEvent({
    dailyLog: [
      dayWith("movementEvents", event),
      dayWith("noteEvents", targetNote, "2026-07-28"),
    ],
    collection: "movementEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-28T10:00" },
  });

  const target = result.dailyLog.find((day) => day.date === "2026-07-28");
  expect(target.movementEvents.filter((item) => item.id === event.id)).toHaveLength(
    1,
  );
  expect(target.noteEvents).toEqual([targetNote]);
});

test("lege brondag verdwijnt, maar brondag met andere content blijft bestaan", () => {
  const event = eventFor("bowelEvents");
  const meal = { id: "meal-1", eatenAt: "2026-07-27T08:00" };
  const result = moveDailyLogEvent({
    dailyLog: [
      dayWith("bowelEvents", event, "2026-07-27", { meals: [meal] }),
    ],
    collection: "bowelEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-28T10:00" },
  });

  const source = result.dailyLog.find((day) => day.date === "2026-07-27");
  expect(source).toBeDefined();
  expect(source.meals).toEqual([meal]);
  expect(source.bowelEvents).toEqual([]);
});

test("dubbel ID in bron en doel weigert de gehele mutatie", () => {
  const sourceEvent = eventFor("noteEvents", "duplicate");
  const targetEvent = eventFor("noteEvents", "duplicate", "2026-07-28");
  const original = [
    dayWith("noteEvents", sourceEvent),
    dayWith("noteEvents", targetEvent, "2026-07-28"),
  ];

  const result = moveDailyLogEvent({
    dailyLog: original,
    collection: "noteEvents",
    eventId: "duplicate",
    updates: { eventTime: "2026-07-28T12:00" },
  });

  expect(result).toMatchObject({
    dailyLog: original,
    moved: false,
    reason: "duplicate-id-conflict",
  });
});

test("herhaald opslaan op dezelfde datum en tijd maakt geen duplicaat", () => {
  const event = eventFor("trainingPlanEvents");
  const first = moveDailyLogEvent({
    dailyLog: [dayWith("trainingPlanEvents", event)],
    collection: "trainingPlanEvents",
    eventId: event.id,
    updates: { eventTime: event.eventTime },
  });
  const second = moveDailyLogEvent({
    dailyLog: first.dailyLog,
    collection: "trainingPlanEvents",
    eventId: event.id,
    updates: { eventTime: event.eventTime },
  });

  expect(second.dailyLog[0].trainingPlanEvents).toHaveLength(1);
  expect(second.dailyLog[0].trainingPlanEvents[0].id).toBe(event.id);
});

test("sportSupplementPlanEvents wordt door de move-kern ondersteund", () => {
  const event = eventFor("sportSupplementPlanEvents");
  const result = moveDailyLogEvent({
    dailyLog: [dayWith("sportSupplementPlanEvents", event)],
    collection: "sportSupplementPlanEvents",
    eventId: event.id,
    updates: { eventTime: "2026-07-28T07:00" },
  });

  expect(result.moved).toBe(true);
  expect(result.dailyLog[0].sportSupplementPlanEvents[0].id).toBe(event.id);
});
