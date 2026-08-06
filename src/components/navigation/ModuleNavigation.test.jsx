import React, { act } from "react";
import { createRoot } from "react-dom/client";
import {
  libraryModules,
  mainNavigation,
  recordModules,
  registrationModules,
  timelineRegistrationModules,
} from "../../data/navigationConfig";
import {
  ModuleNavigation,
  RoadmapPlaceholder,
} from "./ModuleNavigation";

describe("navigation foundation", () => {
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

  test("uses the intended configurable main navigation", () => {
    expect(mainNavigation.map((item) => item.label)).toEqual([
      "Tijdlijn",
      "Mijn catalogi",
      "Mijn routines",
      "Mijn dossier",
      "Onze community",
      "Kenniscentrum",
      "Mijn profiel",
    ]);
    expect(registrationModules).toHaveLength(1);
    expect(libraryModules).toHaveLength(4);
    expect(timelineRegistrationModules.map((item) => item.label)).toEqual([
      "Voeding",
      "Supplement",
      "Medicatie",
      "Insuline",
      "Glucose",
      "Gewicht",
      "Beweging",
      "Stoelgang",
      "Notitie",
    ]);
    expect(recordModules.map((item) => item.label)).toEqual([
      "Medicatie",
      "Glucose",
      "Insuline",
      "Gewicht",
      "Bloeddruk",
      "Laboratorium",
      "Symptomen",
    ]);
    expect(registrationModules.find((item) => item.id === "meal").label).toBe(
      "Voeding",
    );
    expect(registrationModules.map((item) => item.label)).toEqual([
      "Voeding",
    ]);
    expect(
      libraryModules.some((module) =>
        ["blood-pressure", "weight", "laboratory", "other"].includes(module.id),
      ),
    ).toBe(false);
    expect(
      libraryModules.some((module) => module.label === "Insuline"),
    ).toBe(false);
  });

  test("all configured modules are clickable", async () => {
    const onSelect = jest.fn();
    await act(async () =>
      root.render(
        <ModuleNavigation
          title="Samenstellen"
          description="Kies een module"
          modules={registrationModules}
          activeModuleId="meal"
          onSelect={onSelect}
        />,
      ),
    );

    expect(container.querySelectorAll("button")).toHaveLength(1);
    const foodButton = container.querySelector("button");
    await act(async () => foodButton.click());
    expect(onSelect).toHaveBeenCalledWith("meal");
  });

  test("one reusable placeholder renders roadmap and module details", async () => {
    const symptom = recordModules.find(
      (module) => module.id === "symptoms",
    );
    await act(async () =>
      root.render(<RoadmapPlaceholder module={symptom} />),
    );

    expect(container.textContent).toContain("Binnenkort beschikbaar.");
    expect(container.textContent).toContain(
      "Deze module maakt deel uit van de Companion-roadmap.",
    );
  });
});
