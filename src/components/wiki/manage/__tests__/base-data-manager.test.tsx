import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/manage", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/manage/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));

import { BaseDataManager } from "@/components/wiki/manage/base-data-manager.client";
import { DialogsProvider } from "@/components/dialogs.client";
import type { BaseData } from "@/lib/wiki/edit.server";

const data = {
  spexCategories: [
    { id: "k1", name: "Chalmersspexet", firstYear: "1948", description: null, retired: false, logo: null },
    { id: "k2", name: "Gamla spexet", firstYear: "1930", description: "Före kriget", retired: true, logo: null },
  ],
  spexAll: [
    { id: "s1", slug: "1984-lasse-maja", year: "1984", title: "Lasse-Maja", revival: false, retired: false, published: true, parent: null, category: { id: "k1", name: "Chalmersspexet" } },
    { id: "s2", slug: "2010-lasse-maja", year: "2010", title: "Lasse-Maja", revival: true, retired: false, published: false, parent: { id: "s1" }, category: null },
  ],
  taskCategories: [{ id: "t1", name: "Ensemble", actorPresent: true, instruments: false, retired: false },
    { id: "t2", name: "Orkester", actorPresent: false, instruments: true, retired: false }],
  tasks: [{ id: "u1", name: "Regissör", board: true, retired: false, category: { id: "t1", name: "Ensemble" } },
    { id: "u2", name: "Sufflör", board: false, retired: false, category: { id: "t1", name: "Ensemble" } },
    { id: "u3", name: "Fiol", board: false, retired: false, category: { id: "t2", name: "Orkester" } }],
} as unknown as BaseData;

const show = (admin = true, highlight: string | null = null) =>
  render(<DialogsProvider><BaseDataManager data={data} admin={admin} highlight={highlight} /></DialogsProvider>);
const section = (name: string) => screen.getByRole("region", { name: new RegExp(`^sections.${name} \\(`) });

describe("BaseDataManager", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("lists only originals, each with its revivals' years, and links them to their editors", async () => {
    show();

    const rows = within(section("spex")).getAllByRole("listitem");

    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("1984 Lasse-Maja");
    expect(rows[0]).toHaveTextContent("revivals");
    expect(rows[0]).not.toHaveTextContent("unpublished");
    expect(within(rows[0]).getByRole("link", { name: "edit" })).toHaveAttribute("href", "/manage/spex/s1");
    expect(within(rows[0]).getByRole("link", { name: "2010" })).toHaveAttribute("href", "/manage/spex/s2");
  });

  it("highlights a revival's original", async () => {
    show(true, "s2");

    expect(within(section("spex")).getByRole("listitem")).toHaveClass("bg-primary/10");
  });

  it("creates a spex in a category", async () => {
    show();

    await userEvent.click(within(section("spex")).getByRole("button", { name: "add" }));
    expect(within(section("spex")).getByLabelText("year")).toBeDisabled();
    await userEvent.selectOptions(within(section("spex")).getByLabelText("category"), "k1");
    await userEvent.selectOptions(within(section("spex")).getByLabelText("year"), "2026");
    await userEvent.type(within(section("spex")).getByLabelText("spexTitle"), " Abraham Lincoln ");
    await userEvent.click(within(section("spex")).getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveSpexAction).toHaveBeenCalledWith(null, { year: "2026", title: "Abraham Lincoln", categoryId: "k1" }));
  });

  it("hides retired records until asked, and edits a category", async () => {
    show();

    expect(within(section("spex-categories")).queryByText("Gamla spexet")).not.toBeInTheDocument();
    await userEvent.click(within(section("spex-categories")).getByRole("checkbox"));
    expect(within(section("spex-categories")).getByText("Gamla spexet")).toBeInTheDocument();

    await userEvent.click(within(section("spex-categories")).getAllByRole("button", { name: "edit" })[0]);
    await userEvent.clear(within(section("spex-categories")).getByLabelText("name"));
    await userEvent.type(within(section("spex-categories")).getByLabelText("name"), "Chalmersspexet Bob");
    await userEvent.type(within(section("spex-categories")).getByLabelText("description"), "Spexet");
    await userEvent.click(within(section("spex-categories")).getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveSpexCategoryAction).toHaveBeenCalledWith("k1",
      { name: "Chalmersspexet Bob", firstYear: "1948", description: "Spexet" }, undefined));
  });

  it("retires a record and merges one into another after confirming", async () => {
    show();

    const tasks = section("tasks");

    await userEvent.click(within(tasks).getAllByRole("button", { name: "retire" })[0]);
    await waitFor(() => expect(actions.retireAction).toHaveBeenCalledWith("TASK", "u1", true));

    await userEvent.click(within(tasks).getAllByRole("button", { name: "merge" })[1]);
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Regissör" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "merge" }));
    await waitFor(() => expect(actions.mergeAction).toHaveBeenCalledWith("TASK", "u2", "u1"));
  });

  it("saves task categories with their markers, and tasks", async () => {
    show();

    await userEvent.click(within(section("task-categories")).getByRole("button", { name: "add" }));
    await userEvent.type(within(section("task-categories")).getByLabelText("name"), "Kommitté");
    await userEvent.click(within(section("task-categories")).getByRole("checkbox", { name: "actorPresent" }));
    await userEvent.click(within(section("task-categories")).getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveTaskCategoryAction).toHaveBeenCalledWith(null,
      { name: "Kommitté", actorPresent: true, instruments: false }));

    await userEvent.click(within(section("tasks")).getByRole("button", { name: "add" }));
    await userEvent.type(within(section("tasks")).getByLabelText("name"), "Kostymör");
    await userEvent.selectOptions(within(section("tasks")).getByLabelText("category"), "t2");
    await userEvent.click(within(section("tasks")).getByRole("checkbox", { name: "board" }));
    await userEvent.click(within(section("tasks")).getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveTaskAction).toHaveBeenCalledWith(null, { name: "Kostymör", categoryId: "t2", board: true }));
  });

  it("marks the board's tasks and narrows tasks and spex to a category", async () => {
    show();

    const tasks = section("tasks");

    expect(within(tasks).getAllByRole("listitem")[0]).toHaveTextContent("board");
    expect(within(tasks).getAllByRole("listitem")).toHaveLength(3);
    await userEvent.selectOptions(within(tasks).getByRole("combobox", { name: "filterCategory" }), "t2");
    expect(within(section("tasks")).getAllByRole("listitem").map(row => row.textContent)).toEqual([expect.stringContaining("Fiol")]);

    const spex = within(section("spex")).getByRole("combobox", { name: "filterCategory" });

    expect(within(spex).queryByRole("option", { name: "Gamla spexet" })).not.toBeInTheDocument();
    await userEvent.selectOptions(spex, "k1");
    expect(within(section("spex")).getAllByRole("listitem")).toHaveLength(1);
  });

  it("offers retiring and merging to admins only, and opens a highlighted record", () => {
    show(false, "u2");

    expect(screen.queryByRole("button", { name: "retire" })).not.toBeInTheDocument();
    expect(within(section("tasks")).getByLabelText("name")).toHaveValue("Sufflör");
  });
});
