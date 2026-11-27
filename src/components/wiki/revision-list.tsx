import Link from "next/link";
import { useTranslations } from "next-intl";
import { EyeOff } from "lucide-react";
import { formatInstant } from "@/utils/format";

export type RevisionRow = {
  id: string;
  target: string;
  targetId: string;
  targetTitle: string;
  field?: string | null;
  comment?: string | null;
  hidden: boolean;
  authorName?: string | null;
  createdAt: string;
};

/** Where a revision's article or spex page is: by id, which the pages send on to their current address. */
export function revisionTargetHref(revision: Pick<RevisionRow, "target" | "targetId">): string {
  return revision.target === "ARTICLE" ? `/articles/${revision.targetId}` : `/spex/${revision.targetId}`;
}

/**
 * Revisions, newest first: what was changed, when and (for authors) by whom.
 */
export function RevisionList({
  revisions,
  showTarget = true,
  compare,
}: {
  revisions: RevisionRow[];
  showTarget?: boolean;
  /** Where to compare a revision with the one before, e.g. an article's history. */
  compare?: (revision: RevisionRow) => string | null;
}) {
  const t = useTranslations("Revisions");

  return (
    <ul className="divide-border border-border bg-card divide-y rounded-lg border text-sm">
      {revisions.map((revision) => {
        const href = compare?.(revision);

        return (
          <li
            key={revision.id}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2"
          >
            <span className="text-muted-foreground w-36 shrink-0 text-xs">{formatInstant(revision.createdAt)}</span>
            {showTarget && (
              <Link
                href={revisionTargetHref(revision)}
                className="hover:text-link font-medium"
              >
                {revision.targetTitle}
              </Link>
            )}
            {revision.field && <span className="text-muted-foreground text-xs">{t(`fields.${revision.field}`)}</span>}
            {revision.comment && <span className="text-muted-foreground italic">{revision.comment}</span>}
            {revision.hidden && (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <EyeOff
                  className="size-3"
                  aria-hidden
                />
                {t("hidden")}
              </span>
            )}
            {revision.authorName && (
              <span className="text-muted-foreground ml-auto text-xs">{revision.authorName}</span>
            )}
            {href && (
              <Link
                href={href}
                className="text-link hover:text-link/80 text-xs"
              >
                {t("compare")}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
