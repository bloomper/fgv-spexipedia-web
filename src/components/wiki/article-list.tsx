import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { formatInstant } from "@/utils/format";

type Row = {
  id: string; slug: string; title: string; visibility: string; published: boolean; lastModifiedAt?: string | null;
  categories: { id: string; name: string }[];
};

/**
 * Articles by title, marked when they are for members or not yet published. Given `ordered`, they keep the order they
 * come in (the visitor's), and `changed` shows when each was last changed.
 */
export function ArticleList({ articles, ordered = false, changed = false }: { articles: Row[]; ordered?: boolean; changed?: boolean }) {
  const t = useTranslations("Articles");

  if (articles.length === 0) {
    return <DataEmpty title={t("empty")} />;
  }
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {(ordered ? articles : [...articles].sort((a, b) => a.title.localeCompare(b.title, "sv"))).map(article => (
        <li key={article.id} className="link-row flex flex-wrap items-center gap-2 px-4 py-2.5">
          <Link href={`/articles/${article.slug}`} className="row-link font-medium">{article.title}</Link>
          {article.visibility === "MEMBERS" && <Badge variant="secondary"><Lock aria-hidden /> {t("members")}</Badge>}
          {!article.published && <Badge variant="outline">{t("unpublished")}</Badge>}
          <span className="ml-auto text-xs text-muted-foreground">{article.categories.map(category => category.name).join(", ")}</span>
          {changed && article.lastModifiedAt && <time dateTime={article.lastModifiedAt} className="text-xs text-muted-foreground tabular-nums">{formatInstant(article.lastModifiedAt)}</time>}
        </li>
      ))}
    </ul>
  );
}
