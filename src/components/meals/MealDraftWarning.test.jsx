import React, { act } from "react";
import { createRoot } from "react-dom/client";
import MealDraftWarning from "./MealDraftWarning";

test("waarschuwt met Companion-acties voor een niet-opgeslagen maaltijd", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const onContinue = jest.fn();
  const onDiscard = jest.fn();

  await act(async () => root.render(<MealDraftWarning onContinue={onContinue} onDiscard={onDiscard} />));
  expect(container.querySelector('[role="dialog"]')).not.toBeNull();
  expect(container.textContent).toContain("Je maaltijd is nog niet opgeslagen.");
  await act(async () => Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Doorgaan met maaltijd").click());
  expect(onContinue).toHaveBeenCalledTimes(1);
  await act(async () => Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Concept verwijderen").click());
  expect(onDiscard).toHaveBeenCalledTimes(1);

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
