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
import { FactsEditor, SpexBaseDataEditor, SpexProductions, SpexTextsEditor } from "@/components/wiki/manage/spex-head-editor.client";
import { ConsumersEditor, RedirectsEditor } from "@/components/wiki/manage/admin-lists.client";
import { DialogsProvider } from "@/components/dialogs.client";
import { router } from "@/test/manage-mocks";
import type { BaseData, RecordingEditData, SpexEditData } from "@/lib/wiki/edit.server";

const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);
const spexOptions = [{ id: "s1", label: "1984 Lasse-Maja" }];
const media = [
  { id: "m1", name: "LP", retired: false, valueType: null },
  { id: "m2", name: "EP", retired: false, valueType: null },
  { id: "m3", name: "CD", retired: false, valueType: null },
  { id: "m4", name: "Kassett", retired: true, valueType: null },
];

const recording = (published = false) => ({
  id: "r1", catalogueNumber: "CEP 019", title: "Lasse-Maja", medium: { id: "m2" }, published,
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
    show(<NewRecordingForm spex={spexOptions} media={media} />);

    expect(screen.getByLabelText("medium")).toHaveValue("m1");
    expect(screen.queryByRole("option", { name: "Kassett" })).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("catalogueNumber"), "CLP 100");
    await userEvent.type(screen.getByLabelText("recordingTitle"), "Det bästa");
    await userEvent.selectOptions(screen.getByLabelText("medium"), "m3");
    await userEvent.click(screen.getByRole("button", { name: "create" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/recordings/r9"));
    expect(actions.saveRecordingAction).toHaveBeenCalledWith(null, { catalogueNumber: "CLP 100", title: "Det bästa", mediumId: "m3", spexId: null });
  });

  it("save a recording's fields with its conductor", async () => {
    show(<RecordingEditor recording={recording()} spex={spexOptions} media={media} />);

    expect(screen.getByText("unpublishedText")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("description"), "En EP");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveRecordingAction).toHaveBeenCalledWith("r1", expect.objectContaining({
      catalogueNumber: "CEP 019", mediumId: "m2", spexId: "s1", released: "1984-12", recorded: null,
      description: "En EP", conductor: { name: "Harald Hornblåsare" }, frontImageId: null,
    })));

    await userEvent.click(screen.getByRole("button", { name: "publish" }));
    await waitFor(() => expect(actions.setRecordingPublishedAction).toHaveBeenCalledWith("r1", true));
  });

  it("edit, remove, add and paste tracks", async () => {
    show(<RecordingEditor recording={recording(true)} spex={spexOptions} media={media} />);

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
    show(<RecordingEditor recording={recording(true)} spex={spexOptions} media={media} />);

    await userEvent.click(screen.getByRole("button", { name: "unpublish" }));
    await userEvent.click(screen.getByRole("button", { name: "delete" }));
    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "delete" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/recordings"));
    expect(actions.setRecordingPublishedAction).toHaveBeenCalledWith("r1", false);
  });
});

const spex = (revival = false) => ({
  id: "s1", slug: "1984-lasse-maja", year: revival ? "2010" : "1984", title: "Lasse-Maja", revival, poster: null,
  category: { id: "k1", name: "Chalmersspexet" },
  revivals: revival ? [] : [{ id: "s3", year: "2015", retired: false }],
  parent: revival ? { id: "s0", year: "1984", revivals: [{ id: "s1", year: "2010", retired: false }, { id: "s3", year: "2015", retired: true }] } : null,
  page: {
    premiere: "1984-02-14", introduction: "Ett spex", description: "Lång", synopsis: null,
    vestDescription: null, vestWornBy: null, published: false,
    revisionIds: { introduction: "r1", description: "r2", synopsis: null },
  },
}) as unknown as SpexEditData;

const categories = [
  { id: "k1", name: "Chalmersspexet", firstYear: "1948", description: null, retired: false, logo: null },
  { id: "k2", name: "Gammal", firstYear: "1930", description: null, retired: true, logo: null },
] as BaseData["spexCategories"];
const allSpex = [
  { id: "s1", year: "1984", category: { id: "k1" }, parent: null },
  { id: "s3", year: "2015", category: null, parent: { id: "s1" } },
  { id: "s4", year: "1986", category: { id: "k1" }, parent: null },
] as unknown as BaseData["spexAll"];

describe("The spex head editors", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("save an original's year, title and category", async () => {
    actions.saveSpexAction = vi.fn(() => Promise.resolve({ ok: true, data: { slug: "1985-lasse-maja" } }));
    show(<SpexBaseDataEditor spex={spex()} categories={categories} allSpex={allSpex} editor />);

    expect(screen.queryByRole("option", { name: "Gammal" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("category")).toBeRequired();
    expect(screen.getByRole("option", { name: "chooseCategory" })).toBeDisabled();
    expect(screen.getByLabelText("year")).toHaveValue("1984");
    expect(within(screen.getByLabelText("year")).queryByRole("option", { name: "1986" })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("year")).queryByRole("option", { name: "2015" })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("year")).queryByRole("option", { name: "1947" })).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("year"), "1985");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveSpexAction).toHaveBeenCalledWith("s1", { year: "1985", title: "Lasse-Maja", categoryId: "k1" }));
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(screen.queryByLabelText("newRevival")).not.toBeInTheDocument();
  });

  it("show an original's productions and create a revival", async () => {
    actions.createRevivalAction = vi.fn(() => Promise.resolve({ ok: true, data: { id: "s2" } }));
    show(<SpexProductions spex={spex()} editor admin={false} />);

    expect(screen.getByRole("link", { name: /^originalProduction/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "2015" })).toHaveAttribute("href", "/manage/spex/s3");
    expect(screen.queryByText(/^editingRevival/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "createRevival" })).toBeDisabled();
    expect(within(screen.getByLabelText("newRevival")).queryByRole("option", { name: "2015" })).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("newRevival")).queryByRole("option", { name: "1984" })).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("newRevival"), "2026");
    await userEvent.click(screen.getByRole("button", { name: "createRevival" }));
    await waitFor(() => expect(actions.createRevivalAction).toHaveBeenCalledWith("s1", "2026"));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/manage/spex/s2"));
  });

  it("mark the revival being edited among its original's, and let admins retire it", async () => {
    actions.retireAction = vi.fn(() => Promise.resolve({ ok: true, data: null }));
    const { unmount } = show(<SpexProductions spex={spex(true)} editor admin />);

    expect(screen.getByRole("link", { name: /^originalProduction/ })).toHaveAttribute("href", "/manage/spex/s0");
    expect(screen.getByRole("link", { name: "2010" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "2015" })).toHaveClass("line-through");
    expect(screen.getByText(/^editingRevival/)).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("newRevival"), "2026");
    await userEvent.click(screen.getByRole("button", { name: "createRevival" }));
    await waitFor(() => expect(actions.createRevivalAction).toHaveBeenCalledWith("s0", "2026"));
    await userEvent.click(screen.getByRole("button", { name: "retireRevival" }));
    await waitFor(() => expect(actions.retireAction).toHaveBeenCalledWith("SPEX", "s1", true));
    unmount();
    show(<SpexProductions spex={spex(true)} editor={false} admin={false} />);
    expect(screen.queryByLabelText("newRevival")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "retireRevival" })).not.toBeInTheDocument();
  });

  it("let a revival change only its year, and authors nothing", () => {
    const { unmount } = show(<SpexBaseDataEditor spex={spex(true)} categories={categories} allSpex={allSpex} editor />);

    expect(screen.queryByLabelText("title")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("newRevival")).not.toBeInTheDocument();
    expect(screen.getByLabelText("year")).toHaveValue("2010");
    expect(screen.getByRole("option", { name: "1985" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "1984" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "2015" })).not.toBeInTheDocument();
    unmount();
    show(<SpexBaseDataEditor spex={spex()} categories={categories} allSpex={allSpex} editor={false} />);
    expect(screen.getByLabelText("year")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "save" })).not.toBeInTheDocument();
  });

  it("save the texts with the revisions they were based on, and publish the page", async () => {
    show(<SpexTextsEditor spex={spex()} />);

    await userEvent.type(screen.getByLabelText("introduction"), " om en tjuv");
    await userEvent.type(screen.getByLabelText("shortDescription"), "Om Lasse-Maja.");
    await userEvent.click(screen.getByRole("button", { name: "saveTexts" }));
    await waitFor(() => expect(actions.savePageAction).toHaveBeenCalledWith("s1", {
      premiere: "1984-02-14", introduction: "Ett spex om en tjuv", shortDescription: "Om Lasse-Maja.", description: "Lång", synopsis: null,
      vestDescription: null, vestWornBy: null, baseRevisionIds: { introduction: "r1", description: "r2", synopsis: null },
    }));

    await userEvent.click(screen.getByRole("button", { name: "publish" }));
    await waitFor(() => expect(actions.setPagePublishedAction).toHaveBeenCalledWith("s1", true));
  });
});

describe("The facts editor", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  const factKinds = [
    { id: "f1", name: "Spelplats", retired: false, valueType: "TEXT" as const },
    { id: "f2", name: "Sista föreställningen", retired: false, valueType: "DATE" as const },
    { id: "f3", name: "Gammal", retired: true, valueType: "TEXT" as const },
    { id: "f4", name: "Utgången med värde", retired: true, valueType: "TEXT" as const },
  ];
  const withFacts = (revival = false) => ({
    ...spex(revival), page: { facts: [{ kind: { id: "f1" }, value: "Chalmers" }, { kind: { id: "f4" }, value: "Kvar" }] },
  }) as unknown as SpexEditData;

  it("save a fact per kind, dates as dates, leaving out empty ones and retired kinds without a value", async () => {
    show(<FactsEditor spex={withFacts()} factKinds={factKinds} />);

    expect(screen.getByLabelText("Spelplats")).toHaveValue("Chalmers");
    expect(screen.queryByLabelText("Gammal")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Utgången med värde (retired)")).toHaveValue("Kvar");
    expect(screen.getByLabelText("Sista föreställningen")).toHaveAttribute("pattern");
    expect(screen.queryByText("factsRevivalHelp")).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Sista föreställningen"), "1984-05");
    await userEvent.clear(screen.getByLabelText("Utgången med värde (retired)"));
    await userEvent.click(screen.getByRole("button", { name: "saveFacts" }));
    await waitFor(() => expect(actions.setFactsAction).toHaveBeenCalledWith("s1", [
      { kindId: "f1", value: "Chalmers" }, { kindId: "f2", value: "1984-05" },
    ]));
  });

  it("say when there are no kinds of facts, and tell revivals whose facts they edit", () => {
    const { unmount } = show(<FactsEditor spex={withFacts()} factKinds={[]} />);

    expect(screen.getByText("noFactKinds")).toBeInTheDocument();
    unmount();
    show(<FactsEditor spex={withFacts(true)} factKinds={factKinds} />);
    expect(screen.getByText("factsRevivalHelp")).toBeInTheDocument();
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
    await userEvent.type(screen.getByLabelText("target"), "articles/bellman");
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.saveRedirectAction).toHaveBeenCalledWith({ id: null, oldTitle: "Bellman", target: "/articles/bellman" }));

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
