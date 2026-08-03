import React, { act } from "react";
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
  detailFields: [{ label: "Portie", value: (item) => item.portion }],
  editFields: [{ key: "name", label: "Naam" }],
  toDraft: (item) => ({ name: item.name }),
};

test("uniforme catalogus is een éénregelige selectielijst met drie vaste acties en toetsenborddetails", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const onTimeline = jest.fn();
  const onRoutine = jest.fn();

  await act(async () => root.render(
    <CatalogFramework
      config={config}
      items={[
        { id: "food-1", name: "Havermout", categoryId: "grain", portion: "40 g" },
        { id: "food-2", name: "Yoghurt", categoryId: "dairy", portion: "150 g" },
      ]}
      categories={[{ id: "grain", name: "Granen" }, { id: "dairy", name: "Zuivel" }]}
      onPutOnTimeline={onTimeline}
      onAddToRoutine={onRoutine}
      onSave={jest.fn()}
    />,
  ));

  const rows = container.querySelectorAll('[role="option"]');
  expect(rows).toHaveLength(2);
  expect(rows[0].querySelectorAll("button")).toHaveLength(3);
  expect(rows[0].textContent).toContain("Havermout");
  expect(rows[0].textContent).toContain("Granen");

  await act(async () => rows[0].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  expect(container.textContent).toContain("Portie");
  expect(container.textContent).toContain("40 g");

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
