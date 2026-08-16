import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { DailyEventDetailModal } from "./DailyEventDetailModal";

test("catalogusoefening toont uitvoergegevens, bron en id-navigatie met bestaande acties", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.appendChild(host); const root = createRoot(host);
  const onOpenExercise = jest.fn(); const onEdit = jest.fn(); const onDelete = jest.fn(); const onClose = jest.fn();
  await act(async () => root.render(<DailyEventDetailModal open type="movement"
    event={{ id: "event-1", eventTime: "2026-08-16T10:00", exerciseId: "exercise-1", personalDosage: "20 sec × 1", side: "Links" }}
    exercise={{ id: "exercise-1", name: "Externe rotatie", instructions: ["Ga liggen.", "Roteer rustig."], painRule: "Stop bij pijn", sourceUrl: "https://youtu.be/abc", sourceTimestamp: "1:23" }}
    onOpenExercise={onOpenExercise} onEdit={onEdit} onDelete={onDelete} onClose={onClose} />));
  expect(document.body.textContent).toContain("Externe rotatie");
  expect(document.body.textContent).toContain("20 sec × 1");
  expect(document.body.textContent).toContain("Links");
  expect(document.body.textContent).toContain("Ga liggen.");
  expect(document.body.textContent).toContain("Stop bij pijn");
  const source = Array.from(document.body.querySelectorAll("a")).find((node) => node.textContent === "Open bronvideo");
  expect(source.href).toBe("https://youtu.be/abc?t=83s");
  expect(source.rel).toBe("noopener noreferrer");
  const full = Array.from(document.body.querySelectorAll("button")).find((node) => node.textContent === "Ga naar volledige omschrijving");
  await act(async () => full.click());
  expect(onOpenExercise).toHaveBeenCalledWith("exercise-1");
  expect(document.body.textContent).not.toContain("Wijzigen");
  expect(["Verwijderen", "Sluiten"].every((label) => document.body.textContent.includes(label))).toBe(true);
  const button = (label) => Array.from(document.body.querySelectorAll("button")).find((node) => node.textContent === label);
  await act(async () => button("Verwijderen").click());
  await act(async () => button("Sluiten").click());
  expect(onEdit).not.toHaveBeenCalled();
  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(1);
  await act(async () => root.unmount()); host.remove(); globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});

test("generieke beweging zonder catalogusreferentie blijft ongewijzigd en toont geen bronactie", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement("div"); document.body.appendChild(host); const root = createRoot(host);
  await act(async () => root.render(<DailyEventDetailModal open type="movement" event={{ eventTime: "2026-08-16T10:00", activityType: "Wandelen", durationMinutes: 30 }} onClose={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />));
  expect(document.body.textContent).toContain("Wandelen");
  expect(document.body.textContent).not.toContain("Open bronvideo");
  expect(document.body.textContent).not.toContain("Ga naar volledige omschrijving");
  await act(async () => root.unmount()); host.remove(); globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
