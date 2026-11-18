import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/articles", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/articles/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));

import { ArticleCategoryDialog, selfAndBelow } from "@/components/wiki/editor/article-category-dialog.client";
import { router } from "@/test/manage-mocks";

// Traditioner › Adrian-cupen › Vinnare, and Rekvisita beside them
const categories = [
  { id: "c1", name: "Traditioner", parents: [] },
  { id: "c2", name: "Adrian-cupen", parents: [{ id: "c1" }] },
  { id: "c3", name: "Vinnare", parents: [{ id: "c2" }] },
  { id: "c4", name: "Rekvisita", parents: [] },
];

describe("The article category dialog", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("finds a category and everything below it", () => {
    expect(selfAndBelow("c1", categories)).toEqual(new Set(["c1", "c2", "c3"]));
    expect(selfAndBelow("c4", categories)).toEqual(new Set(["c4"]));
  });

  it("creates a subcategory under the given parent and opens it", async () => {
    actions.saveArticleCategoryAction = vi.fn(() => Promise.resolve({ ok: true, data: { slug: "anekdoter" } }));
    render(<ArticleCategoryDialog categories={categories} parentId="c1" label="newSubcategory" />);

    await userEvent.click(screen.getByRole("button", { name: "newSubcategory" }));
    expect(screen.getByRole("checkbox", { name: "Traditioner" })).toBeChecked();
    await userEvent.type(screen.getByLabelText("name"), "  Anekdoter ");
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/articles/categories/anekdoter"));
    expect(actions.saveArticleCategoryAction).toHaveBeenCalledWith(null, { name: "Anekdoter", description: null, parentIds: ["c1"] });
  });

  it("edits a category without offering itself or its subcategories as parents", async () => {
    actions.saveArticleCategoryAction = vi.fn(() => Promise.resolve({ ok: true, data: { slug: "adrian-cupen" } }));
    render(<ArticleCategoryDialog category={{ id: "c2", name: "Adrian-cupen", description: "Cupen", parents: [{ id: "c1" }] }}
                                  categories={categories} label="editCategory" />);

    await userEvent.click(screen.getByRole("button", { name: "editCategory" }));
    expect(screen.queryByRole("checkbox", { name: "Adrian-cupen" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Vinnare" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("checkbox", { name: "Rekvisita" }));
    await userEvent.type(screen.getByLabelText("filterCategories"), "rek");
    // The chosen parent stays in view while filtering
    expect(screen.getByRole("checkbox", { name: "Traditioner" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => expect(actions.saveArticleCategoryAction).toHaveBeenCalledWith("c2", {
      name: "Adrian-cupen", description: "Cupen", parentIds: ["c1", "c4"],
    }));
    expect(router.push).not.toHaveBeenCalled();
  });
});
