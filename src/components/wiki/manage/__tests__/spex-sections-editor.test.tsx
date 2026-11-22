import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));
const articleActions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/manage", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/manage/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));
vi.mock("@/app/(app)/articles/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(articleActions));

import { formatTime, parseTime, SpexSectionsEditor } from "@/components/wiki/manage/spex-sections-editor.client";
import { DialogsProvider } from "@/components/dialogs.client";
import type { SectionKind, SpexEditData } from "@/lib/wiki/edit.server";

const VIDEO = "0199a000-0000-7000-8000-000000000001";
const section = (id: string, name: string, content: string, extra: Record<string, unknown> = {}) => ({
  id, content, title: name, ownTitle: null, hidden: false, refId: null, itemIds: [], startSeconds: null,
  kind: { id, name, content }, images: [], video: null, photos: null, record: null, document: null, ...extra,
});
const spex = (order = "DEFAULT") => ({
  id: "s1",
  sectionOrder: order,
  sections: [section("k1", "Ensemblen", "GROUP"), section("k2", "Roller", "CHARACTERS"), section("k3", "Musik", "MUSIC")],
}) as unknown as SpexEditData;
const sectionKinds = [
  { id: "v1", name: "Film", retired: false, valueType: null, content: "SPEXFLIX_VIDEO", imageKinds: [] },
  { id: "v2", name: "Gammal film", retired: true, valueType: null, content: "SPEXFLIX_VIDEO", imageKinds: [] },
] as unknown as SectionKind[];

const show = (data = spex()) => render(<DialogsProvider>
  <SpexSectionsEditor spex={data} sectionKinds={sectionKinds} materials={[{ content: "SPEXFLIX_VIDEO", id: VIDEO, title: "Föreställningen" }]} />
</DialogsProvider>);

describe("The sections editor", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    Object.keys(articleActions).forEach(key => delete articleActions[key]);
    vi.clearAllMocks();
  });

  it("reads and writes times", () => {
    expect(parseTime("1:02:03")).toBe(3723);
    expect(parseTime("2:05")).toBe(125);
    expect(parseTime("45")).toBe(45);
    expect(parseTime("")).toBeNull();
    expect(parseTime("a:b")).toBeNull();
    expect(formatTime(3723)).toBe("1:02:03");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(null)).toBe("");
  });

  it("moves and hides sections and saves the whole list, with a video of the spex added last", async () => {
    show();

    const items = () => screen.getAllByRole("listitem");

    await userEvent.click(within(items()[2]).getByRole("button", { name: "moveUp" }));
    await userEvent.click(within(items()[0]).getByRole("button", { name: "sectionHide" }));
    await userEvent.click(screen.getByRole("button", { name: "sectionAdd" }));
    // Retired kinds are not offered
    expect(within(screen.getByLabelText("sectionKind")).getAllByRole("option").map(option => option.textContent)).toEqual(["Film"]);
    await userEvent.selectOptions(screen.getByLabelText("sectionMaterialLabel"), VIDEO);
    await userEvent.click(screen.getByRole("button", { name: "sectionAddIt" }));
    await userEvent.type(screen.getAllByLabelText("sectionTitle")[3], "Hela föreställningen");
    await userEvent.type(screen.getByLabelText("sectionStart"), "1:30");
    await userEvent.tab();
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => expect(actions.setSectionsAction).toHaveBeenCalledWith("s1", [
      { id: "k1", kindId: "k1", hidden: true, title: null, refId: null, itemIds: null, startSeconds: null },
      { id: "k3", kindId: "k3", hidden: false, title: null, refId: null, itemIds: null, startSeconds: null },
      { id: "k2", kindId: "k2", hidden: false, title: null, refId: null, itemIds: null, startSeconds: null },
      { id: null, kindId: "v1", hidden: false, title: "Hela föreställningen", refId: VIDEO, itemIds: null, startSeconds: 90 },
    ]));
  });

  it("takes an address pasted from the application, with where the video starts, and refuses one of another kind", async () => {
    articleActions.appRefAction = vi.fn()
      .mockResolvedValueOnce({ ok: true, data: "spexify:album/0199a000-0000-7000-8000-000000000009" })
      .mockResolvedValueOnce({ ok: true, data: `spexflix:video/${VIDEO}` });
    show();

    await userEvent.click(screen.getByRole("button", { name: "sectionAdd" }));
    await userEvent.type(screen.getByLabelText("sectionAddress"), "https://spexify.test/albums/x");
    await userEvent.click(screen.getByRole("button", { name: "sectionAddIt" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("sectionAddressWrong");

    await userEvent.clear(screen.getByLabelText("sectionAddress"));
    await userEvent.type(screen.getByLabelText("sectionAddress"), `https://spexflix.test/videos/${VIDEO}?t=75`);
    await userEvent.click(screen.getByRole("button", { name: "sectionAddIt" }));
    expect(await screen.findByLabelText("sectionStart")).toHaveValue("1:15");
  });

  it("goes back to the default order after confirming", async () => {
    show(spex("OWN"));

    await userEvent.click(screen.getByRole("button", { name: "sectionDefault" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "sectionDefault" }));
    await waitFor(() => expect(actions.setSectionsAction).toHaveBeenCalledWith("s1", []));
  });
});
