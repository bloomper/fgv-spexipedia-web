import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const actions = vi.hoisted(() => ({}) as Record<string, ReturnType<typeof vi.fn>>);
const uploadImage = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", async () => {
  const mocks = await import("@/test/manage-mocks");

  return { useRouter: () => mocks.router, usePathname: () => "/", useSearchParams: () => new URLSearchParams() };
});
vi.mock("sonner", async () => ({ toast: (await import("@/test/manage-mocks")).toast }));
vi.mock("@/app/(app)/manage/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));
vi.mock("@/app/(app)/articles/actions.server", async () => (await import("@/test/manage-mocks")).actionsMock(actions));
vi.mock("@/components/wiki/editor/upload.client", () => ({ ACCEPTED_IMAGES: "image/*", uploadImage }));

import { ImageListEditor } from "@/components/wiki/editor/image-list-editor.client";
import { TrashView } from "@/components/wiki/manage/trash.client";
import { ArticleActions } from "@/components/wiki/editor/article-actions.client";
import { RevisionActions } from "@/components/wiki/editor/revision-actions.client";
import { PhotoSet, type PhotoSetData } from "@/components/wiki/photo-set.client";
import { DialogsProvider } from "@bloomper/fgv-web-ui/shell/dialogs";
import { router, toast } from "@/test/manage-mocks";

const show = (node: React.ReactNode) => render(<DialogsProvider>{node}</DialogsProvider>);
const image = (id: string, caption = id) => ({
  id,
  kind: "SKETCH",
  caption,
  alt: caption,
  width: 800,
  height: 600,
  thumbnailUrl: `/media/${id}/320.webp`,
  pageUrl: `/media/${id}/1280.webp`,
  fullUrl: `/media/${id}/2560.webp`,
  pageJpegUrl: `/media/${id}/1280.jpg`,
});
const refused = { ok: false, code: "FORBIDDEN", message: "Du får inte." };

beforeEach(() => {
  Object.keys(actions).forEach((key) => delete actions[key]);
  vi.clearAllMocks();
});

describe("ImageListEditor", () => {
  it("saves images in a new order with kinds and captions", async () => {
    const onSave = vi.fn(() => Promise.resolve(true));

    show(
      <ImageListEditor
        title="Bilder"
        uploadKind="SKETCH"
        kinds={[
          { id: "k1", name: "Skiss" },
          { id: "k2", name: "Sminkskiss" },
          { id: "k3", name: "Gammal", retired: true },
        ]}
        onSave={onSave}
        images={[
          { image: image("i1"), kind: { id: "k1" }, caption: "Skiss" },
          { image: image("i2"), kind: { id: "k1" }, caption: null },
        ]}
      />
    );

    expect(screen.queryByRole("option", { name: "Gammal" })).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: "save" })).toBeDisabled();
    await userEvent.click(screen.getAllByRole("button", { name: "moveDown" })[0]);
    await userEvent.selectOptions(screen.getAllByRole("combobox", { name: "kind" })[1], "k2");
    await userEvent.type(screen.getAllByRole("textbox", { name: "caption" })[0], "Ny ");
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    expect(onSave).toHaveBeenCalledWith([
      { imageId: "i2", kindId: "k1", caption: "Ny" },
      { imageId: "i1", kindId: "k2", caption: "Skiss" },
    ]);
    await waitFor(() => expect(screen.getByRole("button", { name: "save" })).toBeDisabled());
  });

  it("uploads chosen files, says which failed, and removes images", async () => {
    uploadImage.mockResolvedValueOnce(image("i3")).mockRejectedValueOnce(new Error("För stor"));

    const onSave = vi.fn(() => Promise.resolve(false));
    const { container } = show(
      <ImageListEditor
        title="Bilder"
        uploadKind="SCENOGRAPHY"
        onSave={onSave}
        images={[{ image: image("i1") }]}
      />
    );

    await userEvent.upload(container.querySelector("input[type=file]") as HTMLInputElement, [
      new File(["a"], "fond.png", { type: "image/png" }),
      new File(["b"], "stor.png", { type: "image/png" }),
    ]);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("stor.png: För stor")));
    expect(uploadImage).toHaveBeenCalledWith(expect.any(File), "SCENOGRAPHY");
    expect(screen.getAllByRole("img")).toHaveLength(2);

    await userEvent.click(screen.getAllByRole("button", { name: "remove" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "save" }));
    expect(onSave).toHaveBeenCalledWith([{ imageId: "i3", kindId: null, caption: null }]);
    expect(screen.getByRole("button", { name: "save" })).toBeEnabled();
  });

  it("asks for images when there are none, and uploads dropped files", async () => {
    uploadImage.mockResolvedValueOnce(image("i4"));
    show(
      <ImageListEditor
        title="Bilder"
        uploadKind="SCENOGRAPHY"
        onSave={vi.fn()}
        images={[]}
      />
    );

    expect(screen.getByText("dropImages")).toBeInTheDocument();
    fireEvent.drop(screen.getByText("dropImages").parentElement!, {
      dataTransfer: { files: [new File(["a"], "x.png")], types: ["Files"] },
    });
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(1));
  });
});

describe("TrashView", () => {
  it("restores articles and images, and lets admins empty the trash", async () => {
    show(
      <TrashView
        admin
        articles={[{ id: "a1", title: "Gammal artikel", trashedAt: "2026-11-01T10:00:00Z" }]}
        images={[{ ...image("i1"), originalFileName: "fond.png", trashedAt: null }]}
      />
    );

    await userEvent.click(screen.getAllByRole("button", { name: "restore" })[0]);
    await waitFor(() => expect(actions.restoreArticleAction).toHaveBeenCalledWith("a1"));
    await userEvent.click(screen.getAllByRole("button", { name: "restore" })[1]);
    await waitFor(() => expect(actions.restoreImageAction).toHaveBeenCalledWith("i1"));
    expect(screen.getByText("fond.png")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "emptyTrash" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "emptyTrash" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("emptied"));
  });

  it("says when it is empty, and offers emptying to admins only", () => {
    const { unmount } = show(
      <TrashView
        admin
        articles={[]}
        images={[]}
      />
    );

    expect(screen.getByText("empty")).toBeInTheDocument();
    unmount();
    show(
      <TrashView
        admin={false}
        articles={[{ id: "a1", title: "Artikel" }]}
        images={[]}
      />
    );
    expect(screen.queryByRole("button", { name: "emptyTrash" })).not.toBeInTheDocument();
  });
});

describe("ArticleActions", () => {
  it("publishes, and trashes after confirming", async () => {
    show(
      <ArticleActions
        id="a1"
        published={false}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "publish" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("publishedToast"));
    expect(actions.setPublishedAction).toHaveBeenCalledWith("a1", true);

    await userEvent.click(screen.getByRole("button", { name: "trash" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "trash" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/articles"));
  });

  it("shows the server's message when refused, and does nothing when cancelled", async () => {
    actions.setPublishedAction = vi.fn(() => Promise.resolve(refused));
    actions.trashArticleAction = vi.fn(() => Promise.resolve(refused));
    show(
      <ArticleActions
        id="a1"
        published
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "unpublish" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Du får inte."));

    await userEvent.click(screen.getByRole("button", { name: "trash" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "cancel" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(actions.trashArticleAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "trash" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "trash" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2));
  });
});

describe("RevisionActions", () => {
  it("restores an earlier revision and opens the article", async () => {
    actions.restoreRevisionAction = vi.fn(() => Promise.resolve({ ok: true, data: { slug: "traditioner" } }));
    show(
      <RevisionActions
        articleId="a1"
        revisionId="r1"
        hidden={false}
        latest={false}
        author
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "restore" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "restore" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/articles/traditioner"));

    await userEvent.click(screen.getByRole("button", { name: "hide" }));
    await waitFor(() => expect(actions.setRevisionHiddenAction).toHaveBeenCalledWith("r1", true));
    expect(router.refresh).toHaveBeenCalled();
  });

  it("offers neither restoring the latest nor hiding to members, and shows refusals", async () => {
    actions.setRevisionHiddenAction = vi.fn(() => Promise.resolve(refused));
    actions.restoreRevisionAction = vi.fn(() => Promise.resolve(refused));

    const { unmount } = show(
      <RevisionActions
        articleId="a1"
        revisionId="r1"
        hidden={false}
        latest
        author={false}
      />
    );

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    unmount();
    show(
      <RevisionActions
        articleId="a1"
        revisionId="r1"
        hidden
        latest={false}
        author
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "unhide" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Du får inte."));
    await userEvent.click(screen.getByRole("button", { name: "restore" }));
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "restore" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(2));
  });
});

const photo = (id: string, video = false) => ({
  itemId: id,
  caption: `Foto ${id}`,
  thumbnailUrl: `/t/${id}`,
  previewUrl: `/p/${id}`,
  width: 800,
  height: 600,
  url: `https://spexgram.test/items/${id}`,
  public: true,
  video,
  videoUrl: video ? `/v/${id}.mp4` : null,
});

describe("PhotoSet", () => {
  it("shows photos and how many members' photos the viewer may not see", async () => {
    const set: PhotoSetData = { available: true, hiddenCount: 2, photos: [photo("1"), photo("2", true)] };
    const { rerender } = render(
      <PhotoSet
        set={set}
        member={false}
      />
    );

    expect(screen.getByText('hiddenVisitor:{"count":2}')).toBeInTheDocument();
    rerender(
      <PhotoSet
        set={set}
        member
      />
    );
    expect(screen.getByText('hiddenMember:{"count":2}')).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Foto 1" }));
    expect(await screen.findByLabelText("openInSpexgram")).toHaveAttribute("href", "https://spexgram.test/items/1");
  });

  it("says when Spexgram cannot be reached, and shows nothing when there is nothing", () => {
    const { container, rerender } = render(
      <PhotoSet
        set={{ available: false, hiddenCount: 0, photos: [] }}
        member
      />
    );

    expect(screen.getByText("unavailable")).toBeInTheDocument();
    rerender(
      <PhotoSet
        set={{ available: true, hiddenCount: 0, photos: [] }}
        member
      />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <PhotoSet
        set={{ available: true, hiddenCount: 0, photos: [photo("1")] }}
        member
      />
    );
    expect(screen.queryByText(/hidden/)).not.toBeInTheDocument();
  });
});
