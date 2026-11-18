import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { RevisionList } from "@/components/wiki/revision-list";
import { getRecentChanges } from "@/lib/wiki/wiki.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { buttonVariants } from "@/components/ui/button";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";

const SIZE = 50;

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Revisions"))("recentTitle"));
}

/**
 * Every revision the viewer may see, newest first, so that members can follow what is written.
 */
export default async function RecentChangesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return withPolicyPage(Policies.app.requireAccess, () => RecentChanges({ searchParams }));
}

async function RecentChanges({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(0, Number((await searchParams).page) || 0);
  const [t, changes] = await Promise.all([getTranslations("Revisions"), getRecentChanges(page, SIZE)]);
  const pages = changes ? Math.ceil(changes.totalCount / SIZE) : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
      <PageHeader title={t("recentTitle")} description={t("recentDescription")} />
      <RevisionList revisions={changes?.entries ?? []} />
      {pages > 1 && (
        <nav className="flex justify-between" aria-label={t("pages")}>
          {page > 0 ? <Link href={`?page=${page - 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>{t("newer")}</Link> : <span />}
          {page + 1 < pages && <Link href={`?page=${page + 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>{t("older")}</Link>}
        </nav>
      )}
    </div>
  );
}
