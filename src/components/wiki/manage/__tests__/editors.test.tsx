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
vi.mock("@/app/(app)/admin/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));
vi.mock("@/app/(app)/articles/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));

import { NewRecordingForm, RecordingEditor } from "@/components/wiki/manage/recording-editor.client";
import { SpexBaseDataEditor, SpexTextsEditor } from "@/components/wiki/manage/spex-head-editor.client";
import { ConsumersEditor, RedirectsEditor } from "@/components/wiki/manage/admin-lists.client";
import { DialogsProvider } from "@/components/dialogs.client";
import { router } from "@/test/manage-mocks";
import type { RecordingEditData, SpexEditData } from "@/lib/wiki/edit.server";

const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);
const spexOptions = [{ id: "s1", label: "1984 Lasse-Maja" }];

const recording = (published = false) => ({
  id: "r1", catalogueNumber: "CEP 019", title: "Lasse-Maja", medium: "EP", published,
  spex: { id: "s1", numbers: [{ id: "n1", act: 1, position: 1, title: "Haralds entré" }] },
  released: "1984-12", recorded: null, description: null, spexifyAlbumId: null,
  conductor: { name: "Harald Hornblåsare", person: null }, front: null, back: null,
  tracks: [{ side: "A", number: { id: "n1" }, title: "Haralds entré" }, { side: "A", number: null, title: "Applåder" }],
}) as unknown as RecordingEditData;

describe("The recording editors", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("create a recording and open it", async () => {
    actions.saveRecordingAction = vi.fn(() => Promise.resolve({ ok: true, data: { id: "r9" } }));
    show(<NewRecordingForm spex={spexOptions} />);

    await userEvent.type(screen.getByLabelText("catalogueNumber"), "CLP 100");
    await userEvent.type(screen.getByLabelText("recordingTitle"), "Det bästa");
    await userEvent.selectOptions(screen.getByLabelText("medium"), "CD");
    await userEvent.click(screen.getByRole("button", { name: "create" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/recordings/r9"));
    expect(actions.saveRecordingAction).toHaveBeenCalledWith(null, { catalogueNumber: "CLP 100", title: "Det bästa", medium: "CD", spexId: null });
  });

  it("save a recording's fields with its conductor", async () => {
    show(<RecordingEditor recording={recording()} spex={spexOptions} />);

    expect(screen.getByText("unpublishedText")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("description"), "En EP");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveRecordingAction).toHaveBeenCalledWith("r1", expect.objectContaining({
      catalogueNumber: "CEP 019", medium: "EP", spexId: "s1", released: "1984-12", recorded: null,
      description: "En EP", conductor: { name: "Harald Hornblåsare" }, frontImageId: null,
    })));

    await userEvent.click(screen.getByRole("button", { name: "publish" }));
    await waitFor(() => expect(actions.setRecordingPublishedAction).toHaveBeenCalledWith("r1", true));
  });

  it("edit, remove, add and paste tracks", async () => {
    show(<RecordingEditor recording={recording(true)} spex={spexOptions} />);

    expect(screen.getAllByRole("combobox", { name: "number" })[0]).toHaveValue("n1");
    await userEvent.type(screen.getAllByRole("textbox", { name: "trackTitle" })[0], "!");
    await userEvent.click(screen.getByRole("button", { name: "addTrack" }));
    await userEvent.clear(screen.getAllByRole("textbox", { name: "side" })[2]);
    await userEvent.type(screen.getAllByRole("textbox", { name: "side" })[2], "B");
    await userEvent.type(screen.getAllByRole("textbox", { name: "trackTitle" })[1], "Extranummer");
    await userEvent.click(screen.getAllByRole("button", { name: "removeTrack" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "saveTracks" }));
    await waitFor(() => expect(actions.setTracksAction).toHaveBeenCalledWith("r1", [
      { side: "A", numberId: null, title: "Applåder!" }, { side: "B", numberId: null, title: "Extranummer" },
    ]));

    await userEvent.type(screen.getByRole("textbox", { name: "pasteTracks" }), "Sida A");
    await userEvent.click(screen.getByRole("button", { name: "pasteTracks" }));
    await waitFor(() => expect(actions.pasteTracksAction).toHaveBeenCalledWith("r1", "Sida A"));
  });

  it("delete a recording after confirming and go back to the list", async () => {
    show(<RecordingEditor recording={recording(true)} spex={spexOptions} />);

    await userEvent.click(screen.getByRole("button", { name: "unpublish" }));
    await userEvent.click(screen.getByRole("button", { name: "delete" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/recordings"));
    expect(actions.setRecordingPublishedAction).toHaveBeenCalledWith("r1", false);
  });
});

const spex = (revival = false) => ({
  id: "s1", slug: "1984-lasse-maja", year: "1984", title: "Lasse-Maja", revival, poster: null,
  category: { id: "k1", name: "Chalmersspexet" },
  page: {
    generation: "Bob", premiere: "1984-02-14", introduction: "Ett spex", description: "Lång", synopsis: null,
    vestDescription: null, vestWornBy: null, published: false,
    revisionIds: { introduction: "r1", description: "r2", synopsis: null },
  },
}) as unknown as SpexEditData;

describe("The spex head editors", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("save an original's year, title and category, and create a revival", async () => {
    actions.saveSpexAction = vi.fn(() => Promise.resolve({ ok: true, data: { slug: "1985-lasse-maja" } }));
    actions.createRevivalAction = vi.fn(() => Promise.resolve({ ok: true, data: { id: "s2" } }));
    show(<SpexBaseDataEditor spex={spex()} categories={[{ id: "k1", name: "Chalmersspexet", retired: false }, { id: "k2", name: "Gammal", retired: true }]} editor />);

    expect(screen.queryByRole("option", { name: "Gammal" })).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("year"));
    await userEvent.type(screen.getByLabelText("year"), "1985");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveSpexAction).toHaveBeenCalledWith("s1", { year: "1985", title: "Lasse-Maja", categoryId: "k1" }));
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());

    expect(screen.getByRole("button", { name: "createRevival" })).toBeDisabled();
    await userEvent.type(screen.getByLabelText("newRevival"), "2026");
    await userEvent.click(screen.getByRole("button", { name: "createRevival" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/spex/s2"));
  });

  it("let a revival change only its year, and authors nothing", () => {
    const { unmount } = show(<SpexBaseDataEditor spex={spex(true)} categories={[]} editor />);

    expect(screen.queryByLabelText("title")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("newRevival")).not.toBeInTheDocument();
    unmount();
    show(<SpexBaseDataEditor spex={spex()} categories={[]} editor={false} />);
    expect(screen.getByLabelText("year")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "save" })).not.toBeInTheDocument();
  });

  it("save the texts with the revisions they were based on, and publish the page", async () => {
    show(<SpexTextsEditor spex={spex()} />);

    await userEvent.clear(screen.getByLabelText("generation"));
    await userEvent.type(screen.getByLabelText("introduction"), " om en tjuv");
    await userEvent.click(screen.getByRole("button", { name: "saveTexts" }));
    await waitFor(() => expect(actions.savePageAction).toHaveBeenCalledWith("s1", {
      generation: null, premiere: "1984-02-14", introduction: "Ett spex om en tjuv", description: "Lång", synopsis: null,
      vestDescription: null, vestWornBy: null, baseRevisionIds: { introduction: "r1", description: "r2", synopsis: null },
    }));

    await userEvent.click(screen.getByRole("button", { name: "publish" }));
    await waitFor(() => expect(actions.setPagePublishedAction).toHaveBeenCalledWith("s1", true));
  });
});

describe("The admin lists", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  const redirects = [{ id: "d1", oldTitle: "Alexander - CEP 019", target: "/recordings/cep-019" }, { id: "d2", oldTitle: "Huvudsida", target: "/" }];

  it("filter, add, edit and delete redirects", async () => {
    show(<RedirectsEditor redirects={redirects} />);

    await userEvent.type(screen.getByRole("searchbox", { name: "filter" }), "cep");
    expect(screen.queryByText("Huvudsida")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByRole("searchbox", { name: "filter" }));

    await userEvent.click(screen.getByRole("button", { name: "add" }));
    await userEvent.type(screen.getByLabelText("oldTitle"), "Bellman");
    await userEvent.type(screen.getByLabelText("target"), "figures/bellman");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveRedirectAction).toHaveBeenCalledWith({ id: null, oldTitle: "Bellman", target: "/figures/bellman" }));

    await userEvent.click(screen.getAllByRole("button", { name: "edit" })[1]);
    expect(screen.getByLabelText("oldTitle")).toHaveValue("Huvudsida");
    await userEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(actions.deleteRedirectAction).toHaveBeenCalledWith("d1"));
  });

  it("show how far each consumer has read the feed, and save one", async () => {
    show(<ConsumersEditor consumers={[
      { id: "c1", name: "Spexregister", clientId: "fgv-spexregister-service", notifyUrl: null, enabled: true, acknowledged: "42", acknowledgedAt: "2026-11-16T10:00:00Z", lag: 3, lastNotifiedAt: null, lastError: "Timeout" },
      { id: "c2", name: "Spexify", clientId: "fgv-spexify-service", notifyUrl: "http://spexify-api:8080/api/sync/notify", enabled: false, lag: 0 },
    ]} />);

    expect(screen.getByText("Timeout")).toBeInTheDocument();
    expect(screen.getByText("pullsOnly")).toBeInTheDocument();
    expect(screen.getByText("disabled")).toBeInTheDocument();
    expect(screen.getByText("upToDate")).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "edit" })[1]);
    await userEvent.click(screen.getByRole("checkbox", { name: "enabled" }));
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveConsumerAction).toHaveBeenCalledWith({
      id: "c2", name: "Spexify", clientId: "fgv-spexify-service", notifyUrl: "http://spexify-api:8080/api/sync/notify", enabled: true,
    }));

    await userEvent.click(screen.getByRole("button", { name: "add" }));
    await userEvent.click(screen.getAllByRole("button", { name: "delete" })[0]);
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(actions.deleteConsumerAction).toHaveBeenCalledWith("c1"));
  });
});
