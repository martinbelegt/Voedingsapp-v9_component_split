import React, { act } from "react";
import { createRoot } from "react-dom/client";
import {
  DailyMealList,
  groupSupplementTimelineItems,
} from "./DailyMealList";

const at = (minute) => `2026-08-03T08:${minute}:00.000Z`;

function supplement(id, minute, name, dosage = "") {
  return {
    id,
    type: "supplement",
    eventTime: at(minute),
    supplementId: `catalog-${id}`,
    supplementName: name,
    name,
    dosage,
    unit: dosage ? "capsule" : "",
  };
}

function timelineItem(event) {
  return {
    id: event.id,
    itemType: "supplement",
    time: event.eventTime,
    event,
  };
}

describe("supplementmomenten in de tijdlijn", () => {
  test("twee supplementen om 08:00 worden een presentatiegroep", () => {
    const first = supplement("supp-1", "00", "R-ALA");
    const second = supplement("supp-2", "00", "Vitamine D3/K2");

    const result = groupSupplementTimelineItems([
      timelineItem(first),
      timelineItem(second),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].itemType).toBe("supplementGroup");
    expect(result[0].group.children.map((item) => item.event)).toEqual([
      first,
      second,
    ]);
  });

  test("drie supplementen om 08:00 blijven drie afzonderlijke registraties", () => {
    const events = [
      supplement("supp-1", "00", "R-ALA"),
      supplement("supp-2", "00", "Vitamine D3/K2"),
      supplement("supp-3", "00", "Omega-3"),
    ];

    const [group] = groupSupplementTimelineItems(events.map(timelineItem));

    expect(group.group.children).toHaveLength(3);
    expect(group.group.children.map((item) => item.event.id)).toEqual([
      "supp-1",
      "supp-2",
      "supp-3",
    ]);
  });

  test("08:00 en 08:05 blijven twee afzonderlijke momenten", () => {
    const result = groupSupplementTimelineItems([
      timelineItem(supplement("supp-1", "00", "R-ALA")),
      timelineItem(supplement("supp-2", "05", "Omega-3")),
    ]);

    expect(result).toHaveLength(2);
    expect(result.every((item) => item.itemType === "supplement")).toBe(true);
  });

  test("een niet-supplementevent op hetzelfde tijdstip blijft buiten de groep", () => {
    const glucose = {
      id: "glucose-1",
      itemType: "glucose",
      time: at("00"),
      event: { id: "glucose-1", eventTime: at("00"), glucoseValue: "6.1" },
    };
    const result = groupSupplementTimelineItems([
      timelineItem(supplement("supp-1", "00", "R-ALA")),
      glucose,
      timelineItem(supplement("supp-2", "00", "Omega-3")),
    ]);

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.itemType === "supplementGroup").group.children)
      .toHaveLength(2);
    expect(result).toContain(glucose);
  });
});

describe("bediening van een gegroepeerd supplementmoment", () => {
  let container;
  let root;
  let updateSupplementEvent;
  let deleteSupplementEvent;
  let confirmSpy;
  const events = [
    supplement("supp-1", "00", "R-Alfa-Liponzuur", "1"),
    supplement("supp-2", "00", "Creatine Monohydrate Creapure®", "2"),
    supplement("supp-3", "00", "Omega-3", "3"),
  ];

  beforeEach(async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    updateSupplementEvent = jest.fn();
    deleteSupplementEvent = jest.fn();
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    await act(async () => {
      root.render(
        <DailyMealList
          selectedDate="2026-08-03"
          selectedDay={{ date: "2026-08-03" }}
          supplementEventsForDay={events}
          products={[]}
          buttonStyle={{}}
          updateSupplementEvent={updateSupplementEvent}
          deleteSupplementEvent={deleteSupplementEvent}
          setAddEventType={jest.fn()}
          setShowTimelineControls={jest.fn()}
          clearDailyLog={jest.fn()}
          fillDailyRepeats={jest.fn()}
          onAddMeal={jest.fn()}
        />,
      );
    });
  });

  afterEach(async () => {
    confirmSpy.mockRestore();
    await act(async () => root.unmount());
    container.remove();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  test("toont een regel met drie namen en na uitklappen drie doseringen", async () => {
    const group = container.querySelector('[data-timeline-item="supplement-group"]');
    expect(container.querySelectorAll('[data-timeline-item="supplement-group"]')).toHaveLength(1);
    expect(group.textContent).toContain("💊");
    expect(group.textContent).toContain(
      "Supplementen — R-Alfa-Liponzuur 1 capsule · Creatine Monohydrate Creapure® 2 capsule · Omega-3 3 capsule",
    );

    await act(async () => group.firstElementChild.click());

    expect(group.querySelectorAll("[data-supplement-registration-id]")).toHaveLength(3);
    expect(group.textContent).toContain("R-Alfa-Liponzuur1 capsule");
    expect(group.textContent).toContain("2 capsule");
    expect(group.textContent).toContain("3 capsule");
    const longName = group.querySelector('[data-supplement-registration-id="supp-2"] strong');
    expect(longName.textContent).toBe("Creatine Monohydrate Creapure®");
    expect(longName.parentElement.style.overflowWrap).toBe("anywhere");
  });

  test("wijzigen en verwijderen blijven gericht op precies een registratie", async () => {
    const group = container.querySelector('[data-timeline-item="supplement-group"]');
    await act(async () => group.firstElementChild.click());

    await act(async () => {
      group.querySelector('[data-supplement-delete="supp-2"]').click();
    });
    expect(deleteSupplementEvent).toHaveBeenCalledTimes(1);
    expect(deleteSupplementEvent).toHaveBeenCalledWith("supp-2");

    await act(async () => {
      group.querySelector('[data-supplement-edit="supp-1"]').click();
    });
    const saveButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Opslaan",
    );
    await act(async () => saveButton.click());

    expect(updateSupplementEvent).toHaveBeenCalledTimes(1);
    expect(updateSupplementEvent.mock.calls[0][0]).toBe("supp-1");
    expect(events.map((event) => event.id)).toEqual(["supp-1", "supp-2", "supp-3"]);
  });
});
