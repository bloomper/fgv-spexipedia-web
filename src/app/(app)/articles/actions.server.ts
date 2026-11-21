"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import {
  articleCategoryCreate,
  articleCategoryUpdate,
  articleCreate,
  articleEditing,
  articleMove,
  articleReorderChildren,
  articleRestore,
  articleSetPublished,
  articleTrash,
  articleUpdate,
  revisionSetHidden,
} from "@/lib/wiki/edit.server";
import { getArticle, markdownPreview } from "@/lib/wiki/wiki.server";
import type { ArticleCategoryInput, ArticleInput } from "@/gql/graphql";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { ID } from "@/utils/ids";
import { appRef } from "@/utils/app-refs";

function requireId(...ids: (string | null | undefined)[]) {
  if (ids.some(id => id != null && !ID.test(id))) {
    throw new Error("Invalid id");
  }
}

const member = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.app.requireAccess, () => toActionResult(work));
const author = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.author.requireAuthor, () => toActionResult(work));

/**
 * The reference for an address pasted from another FGV application (spec 4.5), e.g. `spexify:album/<id>`; an error
 * when it is no page an article can link to.
 */
export async function appRefAction(address: string): Promise<ActionResult<string>> {
  return member(async () => {
    const ref = appRef(address.slice(0, 2000), {
      spexify: process.env.SPEXIFY_WEB_URL, spexflix: process.env.SPEXFLIX_WEB_URL,
      spexgram: process.env.SPEXGRAM_WEB_URL, archive: process.env.ARCHIVE_WEB_URL,
    });

    if (!ref) {
      throw new Error("APP_LINK_UNKNOWN");
    }
    return ref;
  });
}

/** The Markdown as the page will show it. */
export async function previewAction(markdown: string): Promise<ActionResult<string>> {
  return member(() => markdownPreview(markdown.slice(0, 200_000)));
}

/**
 * Saves the article: a new one, or a new revision of one. A revision based on an older one than the latest is refused
 * with CONFLICT, and the editor then gets the latest to merge with.
 */
export async function saveArticleAction(id: string | null, input: ArticleInput, baseRevisionId: string | null): Promise<ActionResult<{ slug: string }>> {
  requireId(id, baseRevisionId, input.parentId, ...(input.categoryIds ?? []));
  return member(async () => {
    const saved = id ? await articleUpdate(id, input, baseRevisionId) : await articleCreate(input);

    revalidatePath("/articles", "layout");
    revalidatePath("/");
    return { slug: saved.slug };
  });
}

/**
 * Saves an article category: any member creates one, an author changes one. The parents replace the old ones; the
 * server refuses a category under itself or under one of its own subcategories.
 */
export async function saveArticleCategoryAction(id: string | null, input: ArticleCategoryInput): Promise<ActionResult<{ slug: string }>> {
  requireId(id, ...(input.parentIds ?? []));
  const work = async () => {
    const saved = id ? await articleCategoryUpdate(id, input) : await articleCategoryCreate(input);

    revalidatePath("/articles", "layout");
    return { slug: saved.slug };
  };

  return id ? author(work) : member(work);
}

/** The latest revision of the article, for merging after a conflict. */
export async function latestArticleAction(id: string): Promise<ActionResult<{ body: string; revisionId: string | null }>> {
  requireId(id);
  return member(async () => {
    const article = await getArticle(id);

    return { body: article?.body ?? "", revisionId: article?.revision?.id ?? null };
  });
}

/** Tells the server the user is editing the article, and who else is. */
export async function editingAction(id: string): Promise<ActionResult<string[]>> {
  requireId(id);
  return member(() => articleEditing(id));
}

export async function restoreRevisionAction(id: string, revisionId: string): Promise<ActionResult<{ slug: string }>> {
  requireId(id, revisionId);
  return member(async () => {
    const restored = await articleRestore(id, revisionId);

    revalidatePath("/articles", "layout");
    return { slug: restored.slug };
  });
}

export async function setPublishedAction(id: string, published: boolean): Promise<ActionResult<null>> {
  requireId(id);
  return author(async () => {
    await articleSetPublished(id, published);
    revalidatePath("/articles", "layout");
    return null;
  });
}

/** Moves the article to the trash; one with children only `withChildren`, which trashes them too. */
export async function trashArticleAction(id: string, withChildren = false): Promise<ActionResult<null>> {
  requireId(id);
  return author(async () => {
    await articleTrash(id, withChildren);
    revalidatePath("/articles", "layout");
    return null;
  });
}

export async function setRevisionHiddenAction(id: string, hidden: boolean): Promise<ActionResult<null>> {
  requireId(id);
  return author(async () => {
    await revisionSetHidden(id, hidden);
    revalidatePath("/articles", "layout");
    revalidatePath("/");
    return null;
  });
}

/**
 * Moves an article under another (null for the top of the tree), last among its new siblings; its children move with
 * it. The server refuses a move into the article's own subtree. Addresses do not change.
 */
export async function moveArticleAction(id: string, parentId: string | null): Promise<ActionResult<null>> {
  requireId(id, parentId);
  return author(async () => {
    await articleMove(id, parentId);
    revalidatePath("/articles", "layout");
    return null;
  });
}

/** The children of an article (null for the top of the tree) in a new order; all of them. */
export async function reorderChildrenAction(parentId: string | null, ids: string[]): Promise<ActionResult<null>> {
  requireId(parentId, ...ids);
  return author(async () => {
    await articleReorderChildren(parentId, ids);
    revalidatePath("/articles", "layout");
    return null;
  });
}
