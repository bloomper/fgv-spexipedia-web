import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { router, toast } from "@/test/manage-mocks";

const actions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/articles", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/articles/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));

import { ArticleTree, Breadcrumbs, TableOfContents, TreeAround } from "@/components/wiki/article-tree";
import { ChildArticles, MoveArticleButton, subtree } from "@/components/wiki/editor/article-tree-actions.client";
import { ArticleActions } from "@/components/wiki/editor/article-actions.client";
import { ArticleForm } from "@/components/wiki/editor/article-form.client";
import { DialogsProvider } from "@/components/dialogs.client";

const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);
const node = (id: string, title: string, extra = {}) => ({ id, slug: id, title, visibility: "PUBLIC", published: true, ...extra });

beforeEach(() => {
  Object.keys(actions).forEach(key => delete actions[key]);
  vi.clearAllMocks();
});

describe("The article tree", () => {
  it("shows the path from the top as breadcrumbs", () => {
    render(<Breadcrumbs ancestors={[node("trad", "Traditioner"), node("adrian", "Adrian-cupen")]} title="Vinnare" />);

    const crumbs = within(screen.getByRole("navigation", { name: "breadcrumbs" }));

    expect(crumbs.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["/articles", "/articles/trad", "/articles/adrian"]);
    expect(crumbs.getByText("Vinnare")).toHaveAttribute("aria-current", "page");
  });

  it("indents the table of contents by level, and shows none without headings", () => {
    const { container, unmount } = render(<TableOfContents toc={[]} />);

    expect(container).toBeEmptyDOMElement();
    unmount();
    render(<TableOfContents toc={[{ level: 2, anchor: "a", text: "Början" }, { level: 3, anchor: "b", text: "Mitten" }, { level: 2, anchor: "c", text: "Slutet" }]} />);
    expect(screen.getByRole("link", { name: "Mitten" })).toHaveAttribute("href", "#b");
    expect(screen.getByRole("link", { name: "Mitten" }).parentElement!.getAttribute("style")).toContain("0.75rem");
  });

  it("shows the parent, the siblings and the article's children around it", () => {
    render(<TreeAround current="b" parent={node("p", "Föräldern")} siblings={[node("a", "Första"), node("b", "Andra")]} items={[node("c", "Barnet")]} />);

    expect(screen.getByRole("link", { name: "Föräldern" })).toHaveAttribute("href", "/articles/p");
    expect(screen.getByText("Andra")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Barnet" })).toBeInTheDocument();
  });

  it("shows nothing around an article alone at the top", () => {
    const { container } = render(<TreeAround current="a" parent={null} siblings={[node("a", "Ensam")]} items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("nests the tree, and says how many lie below the depth that was read", () => {
    render(<ArticleTree nodes={[node("a", "Traditioner", { children: [node("b", "Adrian-cupen", { visibility: "MEMBERS", published: false, children: [{ id: "c" }, { id: "d" }] })] })]} />);

    expect(screen.getByRole("link", { name: "Adrian-cupen" })).toHaveAttribute("href", "/articles/b");
    expect(screen.getByLabelText("members")).toBeInTheDocument();
    expect(screen.getByText("(unpublished)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "moreBelow:{\"count\":2}" })).toHaveAttribute("href", "/articles/b");
  });
});

describe("Moving and ordering articles", () => {
  const articles = [
    { id: "a", title: "Traditioner", parent: null },
    { id: "b", title: "Adrian-cupen", parent: { id: "a" } },
    { id: "c", title: "Vinnare", parent: { id: "b" } },
    { id: "d", title: "Föreningar", parent: null },
  ];

  it("knows an article's subtree", () => {
    expect([...subtree("a", articles)].sort()).toEqual(["a", "b", "c"]);
    expect([...subtree("d", articles)]).toEqual(["d"]);
  });

  it("moves an article under another, never into its own subtree, or to the top", async () => {
    show(<MoveArticleButton id="b" parentId="a" articles={articles} />);

    await userEvent.click(screen.getByRole("button", { name: "move" }));
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getAllByRole("button").map(button => button.textContent)).toEqual(expect.arrayContaining(["Föreningar", "moveToTop"]));
    expect(within(dialog).queryByRole("button", { name: "Vinnare" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Traditioner" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Föreningar" }));
    await waitFor(() => expect(actions.moveArticleAction).toHaveBeenCalledWith("b", "d"));
    expect(toast.success).toHaveBeenCalledWith("moved");

    await userEvent.click(screen.getByRole("button", { name: "move" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "moveToTop" }));
    await waitFor(() => expect(actions.moveArticleAction).toHaveBeenCalledWith("b", null));
  });

  it("reorders an article's children", async () => {
    show(<ChildArticles parentId="a" reorder items={[node("x", "Ett"), node("y", "Två", { visibility: "MEMBERS", published: false }), node("z", "Tre")]} />);

    expect(screen.getByText("members")).toBeInTheDocument();
    expect(screen.getByText("unpublished")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "moveUp:{\"title\":\"Tre\"}" }));
    await waitFor(() => expect(actions.reorderChildrenAction).toHaveBeenCalledWith("a", ["x", "z", "y"]));
  });

  it("offers no reordering to those who may not", () => {
    show(<ChildArticles parentId="a" reorder={false} items={[node("x", "Ett"), node("y", "Två")]} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("trashes an article with its children, after saying so", async () => {
    show(<ArticleActions id="a" published childCount={2} />);

    await userEvent.click(screen.getByRole("button", { name: "trash" }));
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/trashChildren/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "trash" }));
    await waitFor(() => expect(actions.trashArticleAction).toHaveBeenCalledWith("a", true));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/articles"));
  });

  it("creates a new article under its parent", async () => {
    actions.saveArticleAction = vi.fn(() => Promise.resolve({ ok: true, data: { slug: "vinnare" } }));
    show(<ArticleForm id={null} revisionId={null} categories={[]} parentId="b"
                      initial={{ title: "Vinnare", body: "Text", visibility: "PUBLIC", categoryIds: [] }} />);

    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveArticleAction).toHaveBeenCalledWith(null, expect.objectContaining({ title: "Vinnare", parentId: "b" }), null));
    expect(router.push).toHaveBeenCalledWith("/articles/vinnare");
  });
});
