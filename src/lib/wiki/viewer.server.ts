import "server-only";

import { getSessionContext } from "@/utils/auth.server";
import { hasAccess, isAdmin, isAuthor, isEditor } from "@/utils/auth";

export type ViewerContext = {
  loggedIn: boolean;
  /** Has `USER`: sees names, members' articles and photos, and writes articles. */
  member: boolean;
  /** Writes the texts and images of spex pages and publishes articles. */
  author: boolean;
  /** Keeps base data and the structured parts of spex pages. */
  editor: boolean;
  admin: boolean;
};

/**
 * Who is looking, as far as the pages need to know. The roles only choose what to show; the server decides what anyone
 * may see. Someone logged in without `USER` is a visitor to the server.
 */
export async function getViewer(): Promise<ViewerContext> {
  const { session, roles } = await getSessionContext();

  return {
    loggedIn: session !== null,
    member: hasAccess(roles),
    author: isAuthor(roles),
    editor: isEditor(roles),
    admin: isAdmin(roles),
  };
}
