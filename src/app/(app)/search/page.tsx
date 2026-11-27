import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { search } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { groupBy } from "@/utils/wiki";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Search"))("title"));
}

/**
 * Search across spex, characters, numbers, original songs and articles. People are not searched:
 * they live in Spexregister. A title that finds nothing can be written as a new article by members.
 */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 200);
  const [t, hits, viewer] = await Promise.all([getTranslations("Search"), q.length >= 2 ? search(q) : Promise.resolve([]), getViewer()]);

  return (
    <Page variant="content" className="mx-auto w-full max-w-7xl">
      <PageHeader title={t("title")} />
      <form role="search" className="flex gap-2">
        <Input name="q" type="search" defaultValue={q} placeholder={t("placeholder")} aria-label={t("placeholder")} autoFocus />
        <Button type="submit"><Search aria-hidden /> {t("submit")}</Button>
      </form>
      {q.length >= 2 && hits.length === 0 && (
        <div className="space-y-2">
          <DataEmpty title={t("noHits", { q })} description={null} />
          {viewer.member && <p className="text-center text-sm"><Link href={`/articles/new?title=${encodeURIComponent(q)}`} className="text-link hover:text-link/80">{t("writeArticle", { q })}</Link></p>}
        </div>
      )}
      {groupBy(hits, hit => hit.kind).map(([kind, list]) => (
        <section key={kind} className="space-y-2" aria-labelledby={`hits-${kind}`}>
          <h2 id={`hits-${kind}`} className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{t(`kinds.${kind}`)}</h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {list.map(hit => (
              <li key={`${hit.kind}-${hit.id}`} className="link-row px-4 py-2.5">
                <Link href={hit.path} className="row-link font-medium">{hit.title}</Link>
                {hit.context && <p className="line-clamp-2 text-xs text-muted-foreground">{hit.context}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Page>
  );
}
