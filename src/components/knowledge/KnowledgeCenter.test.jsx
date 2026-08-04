import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { KnowledgeCenter } from "./KnowledgeCenter";
import { knowledgeCategories } from "./knowledgeSources";

describe("Kenniscentrum", () => {
  let container;
  let root;
  beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true; container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container); });
  afterEach(async () => { await act(async () => root.unmount()); container.remove(); globalThis.IS_REACT_ACT_ENVIRONMENT = false; });

  test("toont alle categorieën en uniforme bronkaarten met veilige externe links", async () => {
    await act(async () => root.render(<KnowledgeCenter />));
    const sourceCount = knowledgeCategories.reduce((total, category) => total + category.sources.length, 0);
    expect(container.querySelector("h1").textContent).toBe("Kenniscentrum");
    expect(container.querySelectorAll(".knowledge-category")).toHaveLength(6);
    expect(container.querySelectorAll(".knowledge-card")).toHaveLength(sourceCount);
    expect(container.querySelectorAll('.knowledge-card__link[target="_blank"][rel="noreferrer"]')).toHaveLength(sourceCount);
  });

  test("filtert alleen op bronnaam en favorietster is bedienbaar", async () => {
    await act(async () => root.render(<KnowledgeCenter />));
    const input = container.querySelector('input[type="search"]');
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    await act(async () => { valueSetter.call(input, "Examine"); input.dispatchEvent(new Event("input", { bubbles: true })); });
    expect(container.querySelectorAll(".knowledge-card")).toHaveLength(1);
    expect(container.querySelector(".knowledge-card h3").textContent).toBe("Examine.com");
    const favorite = container.querySelector(".knowledge-favorite");
    await act(async () => favorite.click());
    expect(favorite.getAttribute("aria-pressed")).toBe("true");
  });
});
