import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { useSupplementCatalog } from "./useSupplementCatalog";

const cloudCatalog = {
  version: 1,
  categories: [],
  items: [{ id: "one" }, { id: "two" }],
};

function Harness() {
  const [settings, setSettings] = useState({
    supplementCatalog: cloudCatalog,
    supplementCatalogSyncVersion: 1,
  });
  const { catalog, setCatalog } = useSupplementCatalog({
    settings,
    settingsSyncStatus: "synced",
    setSettings,
  });
  return (
    <>
      <span data-testid="catalog-count">{catalog.items.length}</span>
      <span data-testid="cloud-count">{settings.supplementCatalog.items.length}</span>
      <button type="button" onClick={() => setCatalog((current) => ({ ...current, items: current.items.filter(({ id }) => id !== "two") }))}>Verwijder</button>
      <button type="button" onClick={() => setCatalog((current) => ({ ...current, items: [...current.items, { id: "three" }] }))}>Voeg toe</button>
    </>
  );
}

test("supplementmutaties werken dezelfde lokale en cloudgekoppelde catalogus bij", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(<Harness />));
  const initialCount = Number(container.querySelector('[data-testid="catalog-count"]').textContent);

  await act(async () => container.querySelector("button").click());
  expect(container.querySelector('[data-testid="catalog-count"]').textContent).toBe(String(initialCount - 1));
  expect(container.querySelector('[data-testid="cloud-count"]').textContent).toBe(String(initialCount - 1));

  await act(async () => container.querySelectorAll("button")[1].click());
  expect(container.querySelector('[data-testid="catalog-count"]').textContent).toBe(String(initialCount));
  expect(container.querySelector('[data-testid="cloud-count"]').textContent).toBe(String(initialCount));

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
