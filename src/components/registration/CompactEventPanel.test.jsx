import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { CompactEventPanel } from "./CompactEventPanel";

function changeInput(input, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  valueSetter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("CompactEventPanel", () => {
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
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  async function renderPanel(moduleId, props = {}) {
    const onSubmit = props.onSubmit || jest.fn();
    const onCancel = props.onCancel || jest.fn();
    await act(async () => {
      root.render(
        <CompactEventPanel
          moduleId={moduleId}
          selectedDate="2026-07-31"
          onSubmit={onSubmit}
          onCancel={onCancel}
          {...props}
        />,
      );
    });
    return { onSubmit, onCancel };
  }

  test.each([
    "glucose",
    "insulin",
    "medicine",
    "supplement",
    "weight",
    "movement",
    "bowel",
    "note",
  ])(
    "%s gebruikt dezelfde twee actietermen",
    async (moduleId) => {
      await renderPanel(moduleId);
      const actions = Array.from(
        container.querySelectorAll(".compact-event__actions button"),
      ).map((button) => button.textContent);

      expect(actions).toEqual(["Annuleren", "Zet op tijdlijn"]);
      expect(container.textContent).not.toMatch(
        /Opslaan|Opslaan en sluiten|Opslaan & volgende/,
      );
    },
  );

  test("glucose valideert en levert de bestaande velden aan", async () => {
    const onSubmit = jest.fn();
    await renderPanel("glucose", { onSubmit });
    const submit = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Zet op tijdlijn",
    );

    await act(async () => submit.click());
    expect(container.textContent).toContain("Vul een glucosewaarde in.");
    expect(onSubmit).not.toHaveBeenCalled();

    const valueInput = container.querySelector('input[type="number"]');
    await act(async () => {
      changeInput(valueInput, "7.8");
    });
    await act(async () => submit.click());

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: "glucose",
        value: "7.8",
        eventTime: expect.stringContaining("2026-07-31T"),
      }),
    );
  });

  test("gewicht valideert en normaliseert Nederlandse komma-invoer", async () => {
    const onSubmit = jest.fn();
    await renderPanel("weight", { onSubmit });
    const submit = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Zet op tijdlijn",
    );

    await act(async () => submit.click());
    expect(container.textContent).toContain("Vul een geldig gewicht in.");

    const weightInput = container.querySelector('input[inputmode="decimal"]');
    await act(async () => changeInput(weightInput, "78,4"));
    await act(async () => submit.click());

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: "weight",
        weight: "78,4",
        valueKg: 78.4,
      }),
    );
  });

  test("beweging gebruikt bestaande velden en hetzelfde submitcontract", async () => {
    const onSubmit = jest.fn();
    await renderPanel("movement", { onSubmit });
    const activity = container.querySelector(
      'input[placeholder="bijv. wandelen of fietsen"]',
    );
    await act(async () => changeInput(activity, "Wandelen"));
    const submit = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Zet op tijdlijn",
    );
    await act(async () => submit.click());

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: "movement",
        activityType: "Wandelen",
      }),
    );
  });

  test("supplement neemt standaardwaarden over en wijzigt alleen de registratie", async () => {
    const defaults = { name: "HMB", dosage: "3", unit: "capsules", note: "" };
    const onSubmit = jest.fn();
    await renderPanel("supplement", { initialValues: defaults, onSubmit });

    const dosage = container.querySelector('input[type="number"]');
    expect(dosage.value).toBe("3");
    await act(async () => changeInput(dosage, "4"));
    const submit = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Zet op tijdlijn",
    );
    await act(async () => submit.click());

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      moduleId: "supplement",
      name: "HMB",
      dosage: "4",
      unit: "capsules",
    }));
    expect(defaults.dosage).toBe("3");
  });
});
