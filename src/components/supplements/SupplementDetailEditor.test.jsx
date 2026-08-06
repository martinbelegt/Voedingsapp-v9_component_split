import React, { act } from "react";
import { createRoot } from "react-dom/client";
import SupplementDetailEditor from "./SupplementDetailEditor";
import { createSupplement } from "../../data/supplements";

describe("SupplementDetailEditor", () => {
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

  test("renders a dedicated Aanbevolen hoeveelheden section", async () => {
    const draft = createSupplement();
    await act(async () => {
      root.render(
        <SupplementDetailEditor
          draft={draft}
          errors={{}}
          isNew={true}
          onChange={jest.fn()}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          onDelete={jest.fn()}
          onOpenTimelinePanel={jest.fn()}
          onTimelineSubmit={jest.fn()}
          timelineDefaults={{ eventTime: "2026-08-05T12:00:00.000Z", values: {} }}
          isDirty={false}
          categories={[]}
        />,
      );
    });

    expect(container.textContent).toContain("Aanbevolen hoeveelheden");
    expect(container.textContent).toContain("Referentie-inname (RI)");
    expect(container.textContent).toContain("Maximaal veilige dagelijkse inname (UL)");
    expect(container.textContent).toContain("Aanbevolen gebruik fabrikant");
  });

  test("marks Naam and Vorm fields with required error styling and shows help text", async () => {
    const draft = createSupplement();
    await act(async () => {
      root.render(
        <SupplementDetailEditor
          draft={draft}
          errors={{ name: "Naam is verplicht.", form: "Vorm is verplicht." }}
          isNew={true}
          onChange={jest.fn()}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          onDelete={jest.fn()}
          onOpenTimelinePanel={jest.fn()}
          onTimelineSubmit={jest.fn()}
          timelineDefaults={{ eventTime: "2026-08-05T12:00:00.000Z", values: {} }}
          isDirty={false}
          categories={[]}
        />,
      );
    });

    const requiredFields = container.querySelectorAll(".supplement-field--required-error");
    expect(requiredFields).toHaveLength(2);
    expect(container.textContent).toContain("Vul Naam en Vorm in voordat je het supplement opslaat.");
    expect(container.textContent).not.toContain("❗");
  });

  test("renders BestelLink and product page button when order URL is provided", async () => {
    const draft = createSupplement({
      product: { orderUrl: "https://example.com/product" },
    });

    await act(async () => {
      root.render(
        <SupplementDetailEditor
          draft={draft}
          errors={{}}
          isNew={true}
          onChange={jest.fn()}
          onSave={jest.fn()}
          onCancel={jest.fn()}
          onDelete={jest.fn()}
          onOpenTimelinePanel={jest.fn()}
          onTimelineSubmit={jest.fn()}
          timelineDefaults={{ eventTime: "2026-08-05T12:00:00.000Z", values: {} }}
          isDirty={false}
          categories={[]}
        />,
      );
    });

    const linkButton = container.querySelector(".supplement-link-button");
    expect(linkButton).not.toBeNull();
    expect(linkButton.textContent).toBe("Open productpagina");
    expect(linkButton.getAttribute("href")).toBe("https://example.com/product");
  });
});
