import React, { act } from "react";
import { createRoot } from "react-dom/client";
import SupplementsTab from "./SupplementsTab";
import { createSupplement } from "../data/supplements";
import {
  loadSupplementCatalog,
  saveSupplementCatalog,
} from "../services/supplementStorageService";

function changeInput(input, value) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function button(container, label) {
  return Array.from(container.querySelectorAll("button")).find(
    (item) => item.textContent.trim() === label,
  );
}

describe("Supplementen direct op de tijdlijn", () => {
  let container;
  let root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    const catalog = loadSupplementCatalog();
    saveSupplementCatalog({
      ...catalog,
      items: [createSupplement({
        id: "supp-hmb",
        product: {
          name: "HMB",
          form: "capsule",
          brand: "Pure",
          productName: "HMB 1000",
        },
        personal: { dosage: "3", dosageUnit: "capsules", usageMoment: "08:00" },
      })],
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    jest.restoreAllMocks();
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  });

  async function renderTab(onAddToTimeline = jest.fn()) {
    await act(async () => {
      root.render(
        <SupplementsTab
          selectedDate="2026-07-31"
          onAddToTimeline={onAddToTimeline}
        />,
      );
    });
    return onAddToTimeline;
  }

  test("hoofdacties staan boven de velden en worden onderaan niet herhaald", async () => {
    await renderTab();
    const actions = container.querySelector(".supplement-editor__actions");
    const firstSection = container.querySelector(".supplement-editor__section");

    expect(actions.compareDocumentPosition(firstSection) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
    expect(container.querySelector(".supplement-editor__footer")).toBeNull();
    expect(button(actions, "Verwijderen")).toBeTruthy();
    expect(button(actions, "Annuleren")).toBeTruthy();
    expect(button(actions, "Zet op tijdlijn")).toBeTruthy();
  });

  test("annuleren herstelt de laatst bewaarde waarden", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    await renderTab();
    const name = container.querySelector(".supplement-editor__section input");
    await act(async () => changeInput(name, "Gewijzigde HMB"));
    expect(button(container, "Wijzigingen bewaren en op tijdlijn zetten")).toBeTruthy();

    await act(async () => button(container, "Annuleren").click());
    expect(window.confirm).toHaveBeenCalledWith("Niet-opgeslagen wijzigingen verwerpen?");
    expect(container.querySelector(".supplement-editor__section input").value).toBe("HMB");
  });

  test("compact paneel gebruikt defaults en levert een snapshot aan", async () => {
    const onAddToTimeline = await renderTab();
    await act(async () => button(container, "Zet op tijdlijn").click());

    const panel = container.querySelector('[data-compact-event="supplement"]');
    expect(panel).toBeTruthy();
    expect(panel.querySelector('input[type="number"]').value).toBe("3");
    expect(panel.textContent).toContain("Doseringseenheid");

    await act(async () => button(panel, "Zet op tijdlijn").click());
    expect(onAddToTimeline).toHaveBeenCalledWith(expect.objectContaining({
      date: "2026-07-31",
      supplementId: "supp-hmb",
      supplementName: "HMB",
      name: "HMB",
      dosage: "3",
      unit: "capsules",
      brand: "Pure",
      productName: "HMB 1000",
    }));
  });

  test("verwijderen noemt het supplement en behoud van tijdlijnevents", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    await renderTab();
    await act(async () => button(container, "Verwijderen").click());

    expect(window.confirm.mock.calls[0][0]).toContain("HMB verwijderen?");
    expect(window.confirm.mock.calls[0][0]).toContain("Tijdlijn blijven bewaard");
  });
});
