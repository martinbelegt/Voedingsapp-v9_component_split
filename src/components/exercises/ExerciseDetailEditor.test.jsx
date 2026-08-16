import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { createExercise } from "../../data/exercises";
import ExerciseDetailEditor from "./ExerciseDetailEditor";

test("velden staan in de afgesproken volgorde en tekstwaarden blijven lossless bewerkbaar", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const draft = createExercise({
    name: "Externe rotatie", sourceDosage: "30–60 seconden", personalDosage: "20 seconden × 1",
    instructions: ["Stap één", "Stap twee"], painRule: "Rustig", progression: "Zwaarder", regression: "Lichter", notes: "Notitie",
  });
  const onChange = jest.fn();

  await act(async () => root.render(<ExerciseDetailEditor
    draft={draft}
    categories={[{ id: "other", name: "Overig" }]}
    onChange={onChange}
    onSave={jest.fn()}
    onCancel={jest.fn()}
    onDelete={jest.fn()}
  />));

  expect(Array.from(container.querySelectorAll(".exercise-detail-editor__field > span")).map((node) => node.textContent)).toEqual([
    "Naam", "Categorie", "Lichaamsregio", "Zijde", "Doel", "Materiaal", "Bronnaam", "Bron-URL", "Videotimestamp",
    "Bronadvies", "Persoonlijke dosering", "Uitvoering (één stap per regel)", "Pijnregel", "Progressie", "Regressie", "Notities",
  ]);
  expect(container.querySelectorAll(".exercise-detail-editor__form > label")).toHaveLength(16);
  expect(container.querySelectorAll("textarea")).toHaveLength(7);
  expect(Array.from(container.querySelectorAll("textarea")).map((node) => node.value)).toEqual([
    "30–60 seconden", "20 seconden × 1", "Stap één\nStap twee", "Rustig", "Zwaarder", "Lichter", "Notitie",
  ]);

  const execution = Array.from(container.querySelectorAll("textarea"))[2];
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set.call(execution, "Eerste stap\nTweede stap");
    execution.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ instructions: ["Eerste stap", "Tweede stap"] }));

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
