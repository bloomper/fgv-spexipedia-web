/** The kinds of record Spexipedia's change log has. */
export const ENTITY_TYPES = [
  "SPEX", "SPEX_PAGE", "SPEX_CATEGORY", "TASK", "TASK_CATEGORY", "CHARACTER", "SCENE", "NUMBER", "FIGURE", "RECORDING",
  "ARTICLE", "ARTICLE_CATEGORY", "REVISION", "IMAGE", "REDIRECT", "SYNC_CONSUMER", "SETTINGS", "TRASH",
] as const;

/**
 * Where a record in the change log can be seen.
 */
export function auditLink(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "SPEX":
    case "SPEX_PAGE":
      return `/manage/spex/${entityId}`;
    case "SPEX_CATEGORY":
    case "TASK":
    case "TASK_CATEGORY":
      return `/manage/base-data?edit=${entityId}`;
    case "FIGURE":
      return `/figures/${entityId}`;
    case "RECORDING":
      return `/manage/recordings/${entityId}`;
    case "ARTICLE":
      return `/articles/${entityId}`;
    case "REDIRECT":
      return "/admin/redirects";
    case "SYNC_CONSUMER":
      return "/admin/consumers";
    case "SETTINGS":
      return "/admin/settings";
    case "IMAGE":
    case "TRASH":
      return "/manage/trash";
    default:
      return null;
  }
}
