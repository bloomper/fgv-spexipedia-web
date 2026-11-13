import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataEmpty } from "@/components/data-empty";

type Row = { id: string; slug: string; title: string; visibility: string; published: boolean; categories: { id: string; name: string }[] };

/**
 * Articles by title, marked when they are for members or not yet published.
 */
export function ArticleList({ articles }: { articles: Row[] }) {
  const t = useTranslations("Articles");

  if (articles.length === 0) {
    return <DataEmpty title={t("empty")} />;
  }
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {[...articles].sort((a, b) => a.title.localeCompare(b.title, "sv")).map(article => (
        <li key={article.id} className="link-row flex flex-wrap items-center gap-2 px-4 py-3">
          <Link href={`/articles/${article.slug}`} className="row-link wiki-heading text-lg font-semibold">{article.title}</Link>
          {article.visibility === "MEMBERS" && <Badge variant="secondary"><Lock aria-hidden /> {t("members")}</Badge>}
          {!article.published && <Badge variant="outline">{t("unpublished")}</Badge>}
          <span className="ml-auto text-xs text-muted-foreground">{article.categories.map(category => category.name).join(", ")}</span>
        </li>
      ))}
    </ul>
  );
}
