import React, { act } from "react";
import { createRoot } from "react-dom/client";
import {
  DAILY_NEW_ENTRY_OPTIONS,
  DailyNewEntryModal,
} from "./DailyNewEntryModal";

test("+ Nieuw toont één keuzevenster met acht centrale registraties", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const onSelect = jest.fn();

  await act(async () => {
    root.render(
      <DailyNewEntryModal open onClose={jest.fn()} onSelect={onSelect} />,
    );
  });

  expect(DAILY_NEW_ENTRY_OPTIONS.map((option) => option.label)).toEqual([
    "Voeding",
    "Insuline",
    "Glucose",
    "Supplement",
    "Medicatie",
    "Krachttraining",
    "Beweging",
    "Notitie",
  ]);
  expect(document.querySelectorAll("[data-new-entry]")).toHaveLength(8);

  await act(async () => {
    document.querySelector('[data-new-entry="training"]').click();
  });
  expect(onSelect).toHaveBeenCalledWith("training");

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
