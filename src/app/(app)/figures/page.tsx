import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { getFigures } from "@/lib/wiki/wiki.server";
import { publicMetadata } from "@/lib/wiki/metadata.server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Figures");

  return publicMetadata(t("title"), t("description"));
}

/**
 * Figures that appear in several spex, such as Bellman, each with how many characters they have been.
 */
export default async function FiguresPage() {
  const [t, figures] = await Promise.all([getTranslations("Figures"), getFigures()]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={<span className="wiki-heading text-4xl">{t("title")}</span>} description={t("description")} />
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map(figure => (
          <li key={figure.id}>
            <Link href={`/figures/${figure.slug}`} className="flex items-baseline justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/60">
              <span className="wiki-heading text-lg font-semibold">{figure.name}</span>
              <span className="text-xs text-muted-foreground">{t("characters", { count: figure.characters.length })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
