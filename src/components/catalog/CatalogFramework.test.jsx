import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import CatalogFramework from "./CatalogFramework";

const config = {
  title: "Voeding",
  icon: "🥗",
  itemIcon: "🍽️",
  getName: (item) => item.name,
  getSearchText: (item) => item.name,
  getCategoryIds: (item) => [item.categoryId],
  getCategoryLabel: (item, categories) => categories.find(({ id }) => id === item.categoryId)?.name,
  isFavorite: (item) => Boolean(item.favorite),
  detailFields: [{ label: "Portie", value: (item) => item.portion }],
  editFields: [{ key: "name", label: "Naam" }],
  toDraft: (item) => ({ name: item.name }),
};

test("catalogus houdt drie snelle acties, bevestigt verwijderen en opent steeds één inline editor", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const onTimeline = jest.fn();
  const onRoutine = jest.fn();
  const onFavorite = jest.fn();
  const onDelete = jest.fn();
  const onMealTimeline = jest.fn();
  const onAddNew = jest.fn();

  await act(async () => root.render(
    <CatalogFramework
      config={config}
      items={[
        { id: "food-1", name: "Havermout", categoryId: "grain", portion: "40 g" },
        { id: "food-2", name: "Yoghurt", categoryId: "dairy", portion: "150 g" },
      ]}
      categories={[{ id: "grain", name: "Granen" }, { id: "dairy", name: "Zuivel" }]}
      savedMeals={[{ id: "meal-1", name: "Mijn ontbijt", rows: [{ productId: "food-1" }] }]}
      onPutOnTimeline={onTimeline}
      onPutMealOnTimeline={onMealTimeline}
      onAddToRoutine={onRoutine}
      onToggleFavorite={onFavorite}
      onAddNew={onAddNew}
      onSave={jest.fn()}
      onDelete={onDelete}
    />,
  ));

  let rows = container.querySelectorAll('[role="option"]');
  expect(rows).toHaveLength(2);
  expect(rows[0].querySelectorAll("button")).toHaveLength(3);
  expect(rows[0].textContent).toContain("Havermout");
  expect(rows[0].textContent).toContain("Granen");
  expect(container.querySelector('[aria-label="Catalogusfilters"]')).toBeNull();

  const categoriesButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent.includes("Categorieën"));
  await act(async () => categoriesButton.click());
  expect(categoriesButton.textContent).toBe("Categorieën");
  expect(container.querySelector('[aria-label="Catalogusfilters"]')).toBeNull();
  expect(container.querySelectorAll(".catalog-framework__category-row")).toHaveLength(3);

  const allCategoryRow = Array.from(container.querySelectorAll(".catalog-framework__category-row")).find((row) => row.textContent.includes("Alles"));
  await act(async () => allCategoryRow.click());
  expect(categoriesButton.textContent).toBe("Categorieën");
  expect(container.querySelectorAll(".catalog-framework__category-row")).toHaveLength(0);

  const addButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent.includes("Voeding toevoegen"));
  await act(async () => addButton.click());
  expect(onAddNew).toHaveBeenCalledTimes(1);

  const mealsButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent.includes("Maaltijden"));
  await act(async () => mealsButton.click());
  expect(mealsButton.getAttribute("aria-pressed")).toBe("true");
  expect(container.textContent).toContain("Mijn ontbijt");
  const mealTimelineButton = container.querySelector('[aria-label="Zet Mijn ontbijt op tijdlijn"]');
  await act(async () => mealTimelineButton.click());
  expect(onMealTimeline).toHaveBeenCalledWith(expect.objectContaining({ id: "meal-1" }));

  const productsButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Producten");
  await act(async () => productsButton.click());
  expect(productsButton.getAttribute("aria-pressed")).toBe("true");
  rows = container.querySelectorAll('[role="option"]');

  await act(async () => rows[0].querySelector('button[title="Voeg toe aan favorieten"]').click());
  expect(onFavorite).toHaveBeenCalledWith(expect.objectContaining({ id: "food-1" }));
  expect(container.querySelectorAll(".catalog-framework__inline-editor")).toHaveLength(0);

  await act(async () => rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(container.querySelectorAll(".catalog-framework__inline-editor")).toHaveLength(1);
  expect(container.textContent).toContain("Portie");
  expect(container.textContent).toContain("40 g");
  expect(container.textContent).toContain("Verwijderen");
  const deleteButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Verwijderen");
  await act(async () => deleteButton.click());
  expect(onDelete).not.toHaveBeenCalled();
  expect(container.textContent).toContain("Zeker weten?");
  const confirmDelete = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Zeker weten?");
  await act(async () => confirmDelete.click());
  expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: "food-1" }));

  await act(async () => rows[1].dispatchEvent(new MouseEvent("click", { bubbles: true })));
  expect(container.querySelectorAll(".catalog-framework__inline-editor")).toHaveLength(1);
  expect(container.textContent).toContain("150 g");
  expect(container.textContent).not.toContain("40 g");

  await act(async () => rows[1].dispatchEvent(new MouseEvent("click", { bubbles: true })));
  expect(container.querySelectorAll(".catalog-framework__inline-editor")).toHaveLength(0);

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});

test("een nieuw catalogusitem wordt binnen dezelfde catalogus bewerkt en kan worden geannuleerd", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const onSave = jest.fn();
  const createConfig = {
    ...config,
    title: "Supplementen",
    createItem: () => ({ id: "new-supplement", name: "Nieuw supplement", categoryId: "", portion: "" }),
  };

  await act(async () => root.render(
    <CatalogFramework
      config={createConfig}
      items={[]}
      onPutOnTimeline={jest.fn()}
      onAddToRoutine={jest.fn()}
      onToggleFavorite={jest.fn()}
      onSave={onSave}
    />,
  ));

  const addButton = Array.from(container.querySelectorAll("button")).find((item) => item.textContent.includes("Supplement toevoegen"));
  await act(async () => addButton.click());
  expect(container.querySelectorAll(".catalog-framework__inline-editor")).toHaveLength(1);
  expect(container.querySelector('[role="option"]').textContent).toContain("Nieuw supplement");

  const cancelButton = Array.from(container.querySelectorAll("button")).find((item) => item.textContent === "Annuleren");
  await act(async () => cancelButton.click());
  expect(container.querySelectorAll(".catalog-framework__inline-editor")).toHaveLength(0);
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(0);
  expect(onSave).not.toHaveBeenCalled();

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});

test("maaltijden openen inline met toetsenbord en de toevoegknop start dezelfde builder", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  function Harness() {
    const [mealDraft, setMealDraft] = useState(null);
    return <CatalogFramework config={config} items={[]} savedMeals={[{ id: "meal-1", name: "Ontbijt", rows: [] }]} onPutOnTimeline={jest.fn()} onPutMealOnTimeline={jest.fn()} onAddToRoutine={jest.fn()} onToggleFavorite={jest.fn()} onSave={jest.fn()} activeMealDraft={mealDraft} onBeginMeal={(meal) => setMealDraft(meal ? { ...meal } : { id: "new", name: "", rows: [] })} renderMealBuilder={({ onCancel }) => <div data-testid="meal-builder"><span>{mealDraft?.name || "Nieuwe maaltijd"}</span><button type="button" onClick={onCancel}>Sluiten</button></div>} onSaveMeal={jest.fn()} />;
  }

  await act(async () => root.render(<Harness />));
  const mealsButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Maaltijden");
  await act(async () => mealsButton.click());
  const mealRow = container.querySelector('[role="option"]');
  await act(async () => mealRow.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(container.querySelector('[data-testid="meal-builder"]').textContent).toContain("Ontbijt");
  await act(async () => container.querySelector('[data-testid="meal-builder"] button').click());
  const returnToMeal = Array.from(container.querySelectorAll("button")).find((button) => button.textContent.includes("Terug naar maaltijd"));
  expect(returnToMeal).toBeTruthy();
  await act(async () => returnToMeal.click());
  expect(container.querySelector('[data-testid="meal-builder"]').textContent).toContain("Ontbijt");

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
