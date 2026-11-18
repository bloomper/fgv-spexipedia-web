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
import type { SpexEditData } from "@/lib/wiki/edit.server";

const image = (id: string) => ({
  id, kind: "SCENOGRAPHY", caption: null, alt: id, width: 800, height: 600,
  thumbnailUrl: `/media/${id}/320.webp`, pageUrl: `/media/${id}/1280.webp`, fullUrl: `/media/${id}/2560.webp`, pageJpegUrl: `/media/${id}/1280.jpg`,
});
const kind = (id: string, name: string, retired = false) => ({ id, name, retired, valueType: null });
const photos = { itemIds: [], photos: [], hiddenCount: 0, available: true };
const spex = {
  id: "s1",
  page: {
    scenography: [{ image: image("i1"), kind: { id: "sk2", name: "Scen" }, caption: "Torget" }, { image: image("i2"), kind: { id: "sk9", name: "Gammal" }, caption: null }],
    vest: [], other: [], rebus: null, rebusSolution: null, groupPhotos: photos, boardPhotos: photos,
  },
} as unknown as SpexEditData;

describe("The media editor", () => {
  beforeEach(() => {
    Object.keys(actions).forEach(key => delete actions[key]);
    vi.clearAllMocks();
  });

  it("keeps a list per image kind in use, and per retired kind that still has images, and saves each by its kind", async () => {
    render(<DialogsProvider><SpexMediaEditor spex={spex} kinds={{
      scenographyImageKinds: [kind("sk1", "Fond"), kind("sk2", "Scen"), kind("sk3", "Utgången", true), kind("sk9", "Gammal", true)],
      pageImageKinds: [kind("pk1", "Övriga bilder")],
    }} /></DialogsProvider>);

    expect(screen.getAllByRole("heading").map(heading => heading.textContent).slice(0, 5)).toEqual([
      "sections.SCENOGRAPHY: Fond", "sections.SCENOGRAPHY: Scen", "sections.SCENOGRAPHY: Gammal", "sections.VEST", "sections.OTHER: Övriga bilder",
    ]);
    const stage = screen.getByRole("heading", { name: "sections.SCENOGRAPHY: Scen" }).parentElement!.parentElement!;

    await userEvent.type(within(stage).getByRole("textbox", { name: "caption" }), "!");
    await userEvent.click(within(stage).getByRole("button", { name: "save" }));
    await waitFor(() => expect(actions.setPageImagesAction).toHaveBeenCalledWith("s1", "SCENOGRAPHY", "sk2", [{ imageId: "i1", kindId: null, caption: "Torget!" }]));
  });
});
