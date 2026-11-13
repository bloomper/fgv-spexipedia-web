import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getArticles } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";
import { ArticleList } from "@/components/wiki/article-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Articles");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Every article the viewer may see, with the categories to browse by. Members write new ones.
 */
export default async function ArticlesPage() {
  const [t, data, viewer] = await Promise.all([getTranslations("Articles"), getArticles(), getViewer()]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={<span className="wiki-heading text-4xl">{t("title")}</span>} description={t("description")}
                  actions={viewer.member && <Link href="/articles/new" className={buttonVariants()}><Plus aria-hidden /> {t("new")}</Link>} />
      {(data?.articleCategories ?? []).length > 0 && (
        <nav aria-label={t("categories")} className="flex flex-wrap gap-2">
          {data!.articleCategories.map(category => (
            <Link key={category.id} href={`/articles/categories/${category.slug}`} className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary hover:text-primary">
              {category.name} <span className="text-muted-foreground">({category.articleCount})</span>
            </Link>
          ))}
        </nav>
      )}
      <ArticleList articles={data?.articles ?? []} />
    </div>
  );
}

