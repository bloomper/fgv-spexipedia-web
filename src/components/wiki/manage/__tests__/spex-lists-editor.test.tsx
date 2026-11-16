import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { router, toast } from "@/test/manage-mocks";

const actions = vi.hoisted(() => ({} as Record<string, ReturnType<typeof vi.fn>>));

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/manage", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/manage/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));

import { CharactersEditor, NumbersEditor, RevivalChangesEditor, ScenesEditor } from "@/components/wiki/manage/spex-lists-editor.client";
import { DialogsProvider } from "@/components/dialogs.client";
import type { SpexEditData } from "@/lib/wiki/edit.server";

const own = { id: "s1" };
const parent = { id: "p1" };
const character = (id: string, name: string, spex = own) => ({
  id, name, spex, retired: false, description: null, figure: null, images: [], photos: { itemIds: [] },
});
const scene = (id: string, title: string, act = 1, spex = own) => ({ id, title, act, place: "Torget", intervalAfter: act === 1, spex });
const number = (id: string, title: string, act = 1, spex = own) => ({
  id, title, act, spex, retired: false, originalTitle: "Dancing Queen", originalArtist: "ABBA",
  lyrics: [{ name: null, person: { id: "p-1", name: "Anna", nickname: null } }], composers: [{ name: "Benny", person: null }],
  arrangers: [], choreographers: [], characters: [{ id: "c1" }],
});

const spex = (extra: Partial<SpexEditData> = {}) => ({
  id: "s1", title: "Lasse-Maja", year: "1984", parent: null, revivalChanges: [],
  characters: [character("c1", "Lasse-Maja"), character("c2", "Kungen"), character("c3", "Fadern", parent)],
  scenes: [scene("sc1", "Scen 1"), scene("sc2", "Scen 2", 2)],
  numbers: [number("n1", "Haralds entré"), number("n2", "Final", 2)],
  ...extra,
}) as unknown as SpexEditData;

const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);

describe("The spex list editors", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("add a character with a figure, and edit one", async () => {
    show(<CharactersEditor spex={spex()} figures={[{ id: "f1", name: "Bellman" }]} editor />);

    await userEvent.click(screen.getByRole("button", { name: "addCharacter" }));
    await userEvent.type(screen.getByLabelText("name"), "Drottningen");
    await userEvent.selectOptions(screen.getByLabelText("figure"), "f1");
    await userEvent.type(screen.getByLabelText("description"), "Klok");
    await userEvent.click(within(screen.getByLabelText("name").closest("form")!).getByRole("button", { name: "save" }));

    await waitFor(() => expect(actions.saveCharacterAction).toHaveBeenCalledWith("s1", null, { name: "Drottningen", figureId: "f1", description: "Klok" }));
    expect(toast.success).toHaveBeenCalledWith("saved");
    expect(router.refresh).toHaveBeenCalled();

    await userEvent.click(screen.getAllByRole("button", { name: "edit" })[0]);
    expect(screen.getByLabelText("name")).toHaveValue("Lasse-Maja");
    await userEvent.click(within(screen.getByLabelText("name").closest("form")!).getByRole("button", { name: "cancel" }));
    expect(screen.queryByLabelText("name")).not.toBeInTheDocument();
  });

  it("move, paste and delete the spex's own characters, not the parent's", async () => {
    show(<CharactersEditor spex={spex()} figures={[]} editor />);

    expect(screen.getByText("fromParent")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "moveDown" })).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("button", { name: "moveDown" })[0]);
    await waitFor(() => expect(actions.reorderCharactersAction).toHaveBeenCalledWith("s1", ["c2", "c1"]));

    await userEvent.click(screen.getByRole("button", { name: "paste" }));
    await userEvent.type(screen.getByRole("textbox", { name: "paste" }), "Bonden – en bonde");
    await userEvent.click(screen.getByRole("button", { name: "addLines" }));
    await waitFor(() => expect(actions.pasteCharactersAction).toHaveBeenCalledWith("s1", "Bonden – en bonde"));

    await userEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(actions.deleteCharacterAction).toHaveBeenCalledWith("c1"));
  });

  it("show the server's message when it refuses", async () => {
    actions.deleteCharacterAction = vi.fn(() => Promise.resolve({ ok: false, code: "BAD_REQUEST", message: "Karaktären används." }));
    show(<CharactersEditor spex={spex()} figures={[]} editor />);

    await userEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Karaktären används."));
    expect(router.refresh).not.toHaveBeenCalled();
  });

  it("let authors who are not editors change only images", () => {
    show(<CharactersEditor spex={spex()} figures={[]} editor={false} />);

    expect(screen.queryByRole("button", { name: "addCharacter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "edit" })).not.toBeInTheDocument();
    expect(screen.getAllByText("imagesAndPhotos")).toHaveLength(3);
  });

  it("add, move and edit scenes with an interval", async () => {
    show(<ScenesEditor spex={spex()} />);

    expect(screen.getByText("interval")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "addScene" }));
    await userEvent.type(screen.getByLabelText("title"), "Scen 3");
    await userEvent.type(screen.getByLabelText("place"), "Slottet");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveSceneAction).toHaveBeenCalledWith("s1", null, { act: 2, title: "Scen 3", place: "Slottet", intervalAfter: true }));

    await userEvent.click(screen.getAllByRole("button", { name: "moveUp" })[1]);
    await waitFor(() => expect(actions.reorderScenesAction).toHaveBeenCalledWith("s1", [{ id: "sc2", act: 2 }, { id: "sc1", act: 1 }]));

    await userEvent.click(screen.getByRole("button", { name: "paste" }));
    await userEvent.type(screen.getByRole("textbox", { name: "paste" }), "Akt 3");
    await userEvent.click(screen.getByRole("button", { name: "addLines" }));
    await waitFor(() => expect(actions.pasteScenesAction).toHaveBeenCalledWith("s1", "Akt 3"));
  });

  it("save a number with its credits and singers", async () => {
    show(<NumbersEditor spex={spex()} />);

    expect(screen.getAllByText("(Dancing Queen – ABBA)")).toHaveLength(2);
    await userEvent.click(screen.getAllByRole("button", { name: "edit" })[0]);
    await userEvent.clear(screen.getByLabelText("title"));
    await userEvent.type(screen.getByLabelText("title"), "Entrén");
    await userEvent.click(screen.getByRole("checkbox", { name: "Kungen" }));
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => expect(actions.saveNumberAction).toHaveBeenCalledWith("s1", "n1", expect.objectContaining({
      act: 1, title: "Entrén", originalTitle: "Dancing Queen", originalArtist: "ABBA", characterIds: ["c1", "c2"],
      lyrics: [{ spexareId: "p-1" }], composers: [{ name: "Benny" }], arrangers: [], choreographers: [],
    })));

    await userEvent.click(screen.getAllByRole("button", { name: "delete" })[1]);
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(actions.deleteNumberAction).toHaveBeenCalledWith("n2"));
  });

  it("add numbers and reorder them", async () => {
    show(<NumbersEditor spex={spex()} />);

    await userEvent.click(screen.getByRole("button", { name: "addNumber" }));
    await userEvent.type(screen.getByLabelText("title"), "Ny visa");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveNumberAction).toHaveBeenCalledWith("s1", null, expect.objectContaining({ act: 2, title: "Ny visa", originalTitle: null })));

    await userEvent.click(screen.getAllByRole("button", { name: "moveDown" })[0]);
    await waitFor(() => expect(actions.reorderNumbersAction).toHaveBeenCalledWith("s1", [{ id: "n2", act: 2 }, { id: "n1", act: 1 }]));

    await userEvent.click(screen.getByRole("button", { name: "paste" }));
    await userEvent.type(screen.getByRole("textbox", { name: "paste" }), "Visan");
    await userEvent.click(screen.getByRole("button", { name: "addLines" }));
    await waitFor(() => expect(actions.pasteNumbersAction).toHaveBeenCalledWith("s1", "Visan"));
  });

  it("cut a parent's records in a revival, and show nothing for an original", async () => {
    const revival = spex({
      parent: {
        id: "p1", title: "Lasse-Maja", year: "1984",
        characters: [{ id: "c9", name: "Fadern" }], scenes: [scene("sc9", "Torget")], numbers: [],
      } as never,
      revivalChanges: [{ kind: "SCENE", recordId: "sc9", cut: true }] as never,
    });
    const { container, unmount } = show(<RevivalChangesEditor spex={spex()} />);

    expect(container).toBeEmptyDOMElement();
    unmount();
    show(<RevivalChangesEditor spex={revival} />);

    const characters = screen.getByRole("group", { name: "revivalKinds.CHARACTER" });

    expect(within(characters).getByRole("button", { name: "saveCuts" })).toBeDisabled();
    await userEvent.click(within(characters).getByRole("checkbox"));
    await userEvent.click(within(characters).getByRole("button", { name: "saveCuts" }));
    await waitFor(() => expect(actions.setRevivalChangesAction).toHaveBeenCalledWith("s1", "CHARACTER",
      [{ recordId: "c9", cut: true, act: null, position: null }]));
    expect(screen.queryByRole("group", { name: "revivalKinds.NUMBER" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("group", { name: "revivalKinds.SCENE" })).getByRole("checkbox")).toBeChecked();
  });
});

