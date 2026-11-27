import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "@/test/manage-mocks";

const actions = vi.hoisted(() => ({}) as Record<string, ReturnType<typeof vi.fn>>);

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return {
    useRouter: () => mocks.router,
    usePathname: () => "/admin/kinds",
    useSearchParams: () => new URLSearchParams(),
  };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/admin/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));
vi.mock("@/app/(app)/manage/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));

import { KindsEditor, type KindRow } from "@/components/wiki/manage/kinds-editor.client";
import { UnresolvedCredits } from "@/components/wiki/manage/unresolved-credits.client";
import { DialogsProvider } from "@bloomper/fgv-web-ui/shell/dialogs";

const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);
const kind = (id: string, nameSv: string, nameEn: string, extra: Partial<KindRow> = {}): KindRow => ({
  id,
  nameSv,
  nameEn,
  aliases: [],
  position: 1,
  retired: false,
  valueType: null,
  ...extra,
});
const kinds = [
  kind("k1", "Sång", "Song", { aliases: ["låt", "visa"] }),
  kind("k2", "Final", "Finale"),
  kind("k3", "Gammal", "Old", { retired: true }),
];

describe("The kinds editor", () => {
  beforeEach(() => {
    Object.keys(actions).forEach((key) => delete actions[key]);
    vi.clearAllMocks();
  });

  it("creates a kind of its type, use and image section, with aliases one per line", async () => {
    show(
      <KindsEditor
        type="IMAGE"
        use="SECTION"
        sectionId="s1"
        kinds={[]}
      />
    );

    expect(screen.getByText("none")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "add" }));
    expect(screen.queryByLabelText("valueType")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("nameSv"), "Ljus");
    await userEvent.type(screen.getByLabelText("nameEn"), "Lighting");
    await userEvent.type(screen.getByLabelText("aliases"), "ljus{enter}belysning");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(actions.saveKindAction).toHaveBeenCalledWith(null, {
        type: "IMAGE",
        use: "SECTION",
        sectionId: "s1",
        content: null,
        valueType: null,
        nameSv: "Ljus",
        nameEn: "Lighting",
        aliases: ["ljus", "belysning"],
      })
    );
  });

  it("creates an image section with subtitles, and merges no section of a content with one kind", async () => {
    show(
      <KindsEditor
        type="SECTION"
        use={null}
        kinds={[
          kind("v1", "Spexvästen", "The vest", { content: "VEST" }),
          kind("i1", "Scenografi", "Scenography", { content: "IMAGES" }),
        ]}
      />
    );

    expect(screen.getAllByRole("button", { name: "merge" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "sections.add" }));
    expect(screen.getByLabelText("content")).toHaveValue("IMAGES");
    await userEvent.type(screen.getByLabelText("nameSv"), "Kostymer");
    await userEvent.type(screen.getByLabelText("nameEn"), "Costumes");
    await userEvent.type(screen.getByLabelText("subtitleSv"), "Kläderna");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(actions.saveKindAction).toHaveBeenCalledWith(
        null,
        expect.objectContaining({
          type: "SECTION",
          content: "IMAGES",
          nameSv: "Kostymer",
          subtitleSv: "Kläderna",
          subtitleEn: "",
        })
      )
    );
  });

  it("renames a fact kind and makes it a date", async () => {
    show(
      <KindsEditor
        type="FACT"
        use={null}
        kinds={[kind("f1", "Spelplats", "Venue", { valueType: "TEXT" })]}
      />
    );

    expect(screen.getByText("valueTypes.TEXT")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "edit" }));
    expect(screen.getByLabelText("nameSv")).toHaveValue("Spelplats");
    await userEvent.clear(screen.getByLabelText("nameEn"));
    await userEvent.type(screen.getByLabelText("nameEn"), "Theatre");
    await userEvent.selectOptions(screen.getByLabelText("valueType"), "DATE");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() =>
      expect(actions.saveKindAction).toHaveBeenCalledWith(
        "f1",
        expect.objectContaining({
          nameSv: "Spelplats",
          nameEn: "Theatre",
          valueType: "DATE",
          aliases: [""],
        })
      )
    );
    await waitFor(() => expect(screen.queryByLabelText("nameSv")).not.toBeInTheDocument());
  });

  it("reorders every kind, retired ones included, and retires and brings back", async () => {
    show(
      <KindsEditor
        type="NUMBER"
        use={null}
        kinds={kinds}
      />
    );

    expect(screen.getByText("Sång / Song")).toBeInTheDocument();
    expect(screen.getByText('aliasesShort:{"aliases":"låt, visa"}')).toBeInTheDocument();
    expect(screen.getByText("retired")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "moveDown" })[0]);
    await waitFor(() =>
      expect(actions.reorderKindsAction).toHaveBeenCalledWith("NUMBER", null, ["k2", "k1", "k3"], null)
    );
    await userEvent.click(screen.getAllByRole("button", { name: "moveUp" })[2]);
    await waitFor(() =>
      expect(actions.reorderKindsAction).toHaveBeenCalledWith("NUMBER", null, ["k1", "k3", "k2"], null)
    );

    await userEvent.click(screen.getAllByRole("button", { name: "retire" })[0]);
    await waitFor(() => expect(actions.retireKindAction).toHaveBeenCalledWith("k1", true));
    await userEvent.click(screen.getByRole("button", { name: "reinstate" }));
    await waitFor(() => expect(actions.retireKindAction).toHaveBeenCalledWith("k3", false));
    expect(toast.success).toHaveBeenCalledWith("reinstated");
  });

  it("merges a kind into another after confirming, and shows the server's refusal", async () => {
    actions.mergeKindAction = vi.fn(() => Promise.resolve({ ok: false, code: "BAD_REQUEST", message: "Fel sort." }));
    show(
      <KindsEditor
        type="NUMBER"
        use={null}
        kinds={kinds}
      />
    );

    await userEvent.click(screen.getAllByRole("button", { name: "merge" })[2]);
    const chooser = await screen.findByRole("dialog");

    expect(within(chooser).queryByRole("button", { name: "Gammal / Old" })).not.toBeInTheDocument();
    await userEvent.click(within(chooser).getByRole("button", { name: "Sång / Song" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "merge" }));
    await waitFor(() => expect(actions.mergeKindAction).toHaveBeenCalledWith("k3", "k1"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Fel sort."));
  });

  it("deletes a kind after confirming, and shows the server's refusal when it is in use", async () => {
    actions.deleteKindAction = vi.fn(() =>
      Promise.resolve({ ok: false, code: "BAD_REQUEST", message: "Sorten används." })
    );
    show(
      <KindsEditor
        type="NUMBER"
        use={null}
        kinds={kinds}
      />
    );

    await userEvent.click(screen.getAllByRole("button", { name: "delete" })[1]);
    const dialog = await screen.findByRole("alertdialog");

    expect(within(dialog).getByText("deleteText")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(actions.deleteKindAction).toHaveBeenCalledWith("k2"));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Sorten används."));
  });

  it("keeps the last kind in use, and deletes no section of a content with one kind", () => {
    show(
      <KindsEditor
        type="NUMBER"
        use={null}
        kinds={[kind("k1", "Sång", "Song"), kind("k3", "Gammal", "Old", { retired: true })]}
      />
    );
    expect(
      screen.getAllByRole("button", { name: "delete" }).map((button) => (button as HTMLButtonElement).disabled)
    ).toEqual([true, false]);
  });

  it("deletes image sections with their image kinds, and links each to its image kinds", () => {
    show(
      <KindsEditor
        type="SECTION"
        use={null}
        kinds={[
          kind("v1", "Spexvästen", "The vest", { content: "VEST" }),
          kind("i1", "Scenografi", "Scenography", { content: "IMAGES" }),
        ]}
      />
    );

    expect(screen.getAllByRole("button", { name: "delete" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "imageKinds" })).toHaveAttribute(
      "href",
      "/admin/kinds?type=IMAGE#section-i1"
    );
  });
});

describe("The unresolved credits", () => {
  beforeEach(() => {
    Object.keys(actions).forEach((key) => delete actions[key]);
    vi.clearAllMocks();
  });

  const credit = (numberId: string, spexId: string, name: string, position = 0) => ({
    position,
    name,
    kind: { id: "ck1", name: "Text" },
    number: {
      id: numberId,
      title: `Nummer ${numberId}`,
      act: 1,
      spex: { id: spexId, slug: spexId, title: `Spex ${spexId}`, year: "1984" },
    },
  });

  it("are listed by spex, with links to the numbers, and resolved as someone outside FGV", async () => {
    actions.searchSpexareAction = vi.fn(() => Promise.resolve({ ok: true, data: [] }));
    show(
      <UnresolvedCredits
        data={{
          total: 5,
          credits: [credit("n1", "s1", "Kalle K", 2), credit("n2", "s1", "Lisa L"), credit("n3", "s2", "Olle O")],
        }}
      />
    );

    expect(screen.getByText('showing:{"shown":3,"total":5}')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Spex s1 (1984)" })).toHaveAttribute(
      "href",
      "/manage/spex/s1#edit-numbers"
    );
    expect(screen.getByRole("link", { name: "Nummer n3" })).toHaveAttribute("href", "/manage/spex/s2#number-n3");
    await userEvent.click(screen.getAllByRole("button", { name: "resolve" })[0]);
    await userEvent.click(screen.getByRole("button", { name: 'outsideFgv:{"name":"Kalle K"}' }));
    await waitFor(() => expect(actions.resolveCreditAction).toHaveBeenCalledWith("n1", "ck1", 2, { name: "Kalle K" }));
  });

  it("say when every credit is resolved", () => {
    show(<UnresolvedCredits data={{ total: 0, credits: [] }} />);

    expect(screen.getByText("empty")).toBeInTheDocument();
  });
});
