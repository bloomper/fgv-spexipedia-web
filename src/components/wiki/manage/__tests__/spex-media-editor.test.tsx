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

import { SpexMediaEditor } from "@/components/wiki/manage/spex-media-editor.client";
import { DialogsProvider } from "@/components/dialogs.client";
import type { SectionKind, SpexEditData } from "@/lib/wiki/edit.server";

const image = (id: string) => ({
  id, kind: "SECTION", caption: null, alt: id, width: 800, height: 600,
  thumbnailUrl: `/media/${id}/320.webp`, pageUrl: `/media/${id}/1280.webp`, fullUrl: `/media/${id}/2560.webp`, pageJpegUrl: `/media/${id}/1280.jpg`,
});
const kind = (id: string, name: string, retired = false) => ({ id, name, retired, valueType: null });
const photos = { itemIds: [], photos: [], hiddenCount: 0, available: true };
const section = (id: string, name: string, content: string, images: unknown[] = []) => ({ id, content, kind: { id, name, content }, images });
const spex = {
  id: "s1",
  sections: [
    section("g1", "Ensemblen", "GROUP"),
    section("sc", "Scenografi", "IMAGES", [{ image: image("i1"), kind: { id: "sk2", name: "Scen" }, caption: "Torget" }, { image: image("i2"), kind: { id: "sk9", name: "Gammal" }, caption: null }]),
    section("ve", "Spexvästen", "VEST"),
    section("ob", "Övriga bilder", "IMAGES"),
  ],
  page: { rebus: null, rebusSolution: null, groupPhotos: photos, boardPhotos: photos },
} as unknown as SpexEditData;
const sectionKinds = [
  { ...kind("sc", "Scenografi"), content: "IMAGES", imageKinds: [kind("sk1", "Fond"), kind("sk2", "Scen"), kind("sk3", "Utgången", true), kind("sk9", "Gammal", true)] },
  { ...kind("ve", "Spexvästen"), content: "VEST", imageKinds: [] },
  { ...kind("ob", "Övriga bilder"), content: "IMAGES", imageKinds: [kind("ok1", "Övriga bilder")] },
] as unknown as SectionKind[];

describe("The media editor", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("keeps a list per image kind of each image section in use, and per retired kind that still has images, and saves each by its section and kind", async () => {
    render(<DialogsProvider><SpexMediaEditor spex={spex} sectionKinds={sectionKinds} /></DialogsProvider>);

    // An image section with one kind of its own name is one list under the section's name
    expect(screen.getAllByRole("heading").map(heading => heading.textContent).slice(0, 5)).toEqual([
      "Scenografi: Fond", "Scenografi: Scen", "Scenografi: Gammal", "Spexvästen", "Övriga bilder",
    ]);
    const stage = screen.getByRole("heading", { name: "Scenografi: Scen" }).parentElement!.parentElement!;

    await userEvent.type(within(stage).getByRole("textbox", { name: "caption" }), "!");
    await userEvent.click(within(stage).getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.setPageImagesAction).toHaveBeenCalledWith("s1", "sc", "sk2", [{ imageId: "i1", kindId: null, caption: "Torget!" }]));
  });
});
