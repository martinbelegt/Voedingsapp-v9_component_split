import React, { act } from "react";
import { createRoot } from "react-dom/client";
import MealBuilder from "./MealBuilder";
import { defaultSettings } from "../../data/defaults";

const products = [
  { id: "oats", name: "Havermout", categoryId: "breakfast", portionGram: 40, kh100: 60, protein100: 13, fat100: 7, kcal100: 370, favorite: true },
  { id: "milk", name: "Melk", categoryId: "dairy", portionGram: 200, kh100: 5, protein100: 3.5, fat100: 1.5, kcal100: 46 },
];
const categories = [{ id: "breakfast", name: "Ontbijt" }, { id: "dairy", name: "Zuivel" }];

function changeInput(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("Meal Builder", () => {
  let container;
  let root;
  beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container); });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); globalThis.IS_REACT_ACT_ENVIRONMENT = false; });

  test("zoekt, voegt toe, verhoogt hoeveelheid, rekent live en slaat op", async () => {
    const onSave = jest.fn();
    await act(async () => root.render(<MealBuilder products={products} categories={categories} settings={defaultSettings} onSave={onSave} onCancel={jest.fn()} />));
    const name = container.querySelector('input[placeholder="Bijvoorbeeld ontbijt"]');
    await act(async () => changeInput(name, "Powerontbijt"));
    const search = container.querySelector('input[placeholder="Zoek product..."]');
    await act(async () => changeInput(search, "Haver"));
    expect(container.querySelectorAll(".selection-builder__catalog-row")).toHaveLength(1);
    const addOats = container.querySelector('[aria-label="Voeg Havermout toe"]');
    await act(async () => addOats.click());
    expect(container.querySelector('[aria-label="Havermout is toegevoegd"]').disabled).toBe(true);
    const increase = container.querySelector('[aria-label="Verhoog Havermout"]');
    expect(container.querySelector('[aria-label="Hoeveelheid Havermout"]').value).toBe("40");
    expect(container.textContent).toContain("148 kcal");
    await act(async () => increase.click());
    expect(container.querySelector('[aria-label="Hoeveelheid Havermout"]').value).toBe("80");
    expect(container.textContent).toContain("296 kcal");
    const decrease = container.querySelector('[aria-label="Verlaag Havermout"]');
    await act(async () => decrease.click());
    expect(container.querySelector('[aria-label="Hoeveelheid Havermout"]').value).toBe("40");
    expect(decrease.disabled).toBe(true);
    expect(container.querySelector('[aria-label="Hoeveelheid Havermout"]')).not.toBeNull();
    await act(async () => increase.click());
    const save = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Opslaan");
    await act(async () => save.click());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: "Powerontbijt", rows: [expect.objectContaining({ productId: "oats", mode: "gram", amount: "80" })] }));
  });

  test("opent een bestaande maaltijd, wijzigt hoeveelheid en verwijdert een onderdeel", async () => {
    const onSave = jest.fn();
    const meal = { id: "meal-1", name: "Ontbijt", description: "Vast", category: "Ochtend", rows: [{ id: "row-1", productId: "oats", mode: "gram", amount: "40" }] };
    await act(async () => root.render(<MealBuilder meal={meal} products={products} categories={categories} settings={defaultSettings} onSave={onSave} onCancel={jest.fn()} />));
    const amount = container.querySelector('[aria-label="Hoeveelheid Havermout"]');
    await act(async () => changeInput(amount, "60"));
    expect(container.textContent).toContain("222 kcal");
    await act(async () => container.querySelector('[aria-label="Verwijder Havermout"]').click());
    expect(container.textContent).toContain("Nog geen onderdelen");
    expect(Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Opslaan").disabled).toBe(true);
  });
});
