import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { CommunityPage, communityModules } from "./CommunityPage";

test("community foundation toont de visie en afzonderlijke toekomstige modules", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => root.render(<CommunityPage />));

  expect(container.querySelector("h1").textContent).toBe("Onze community");
  expect(container.textContent).toContain("Privacy staat altijd voorop");
  expect(container.textContent).toContain("ongeveer €1 per maand");
  expect(container.textContent).toContain("geen medisch advies");
  expect(container.querySelectorAll(".community-page__card")).toHaveLength(6);
  expect(communityModules.map(({ label }) => label)).toEqual([
    "Community Home",
    "Prijsvergelijker",
    "Tips",
    "Boodschappen",
    "Groepen",
    "Community Plus",
  ]);

  await act(async () => root.unmount());
  container.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
});
