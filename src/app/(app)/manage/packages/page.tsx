import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Download, Plus } from "lucide-react";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getSpexPackages } from "@/lib/packages/packages.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { buttonVariants } from "@bloomper/fgv-web-ui/ui/button";
import { StateChip } from "@/components/wiki/packages/package-state";
import { RefreshWhileRunning } from "@/app/(app)/admin/maintenance/refresh-while-running.client";
import { formatInstant } from "@/utils/format";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Packages"))("title"));
}

/**
 * Every spex package (spec 5.14), newest first: who uploaded it, its state, the spex it made and when it was applied;
 * the template and a new package.
 */
export default async function PackagesPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const [t, packages] = await Promise.all([getTranslations("Packages"), getSpexPackages()]);

    return (
      <Page
        variant="content"
        className="mx-auto w-full max-w-7xl"
      >
        <RefreshWhileRunning running={packages.some((pkg) => pkg.state === "PREVIEWING" || pkg.state === "APPLYING")} />
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/packages/template"
                download
                className={buttonVariants({ variant: "outline" })}
              >
                <Download aria-hidden /> {t("template")}
              </a>
              <Link
                href="/manage/packages/new"
                className={buttonVariants()}
              >
                <Plus aria-hidden /> {t("new")}
              </Link>
            </div>
          }
        />
        {packages.length === 0 ? (
          <DataEmpty title={t("empty")} />
        ) : (
          <ul className="divide-border border-border bg-card divide-y rounded-lg border text-sm">
            {packages.map((pkg) => (
              <li
                key={pkg.id}
                className="link-row flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3"
              >
                <Link
                  href={`/manage/packages/${pkg.id}`}
                  className="row-link font-medium"
                >
                  {pkg.fileName}
                </Link>
                <StateChip state={pkg.state} />
                {pkg.spex && (
                  <Link
                    href={`/spex/${pkg.spex.slug}`}
                    className="text-link hover:text-link/80 relative z-10"
                  >
                    {pkg.spex.title} ({pkg.spex.year})
                  </Link>
                )}
                <span className="text-muted-foreground ml-auto text-xs">
                  {[pkg.uploadedByName, formatInstant(pkg.createdAt)].filter(Boolean).join(" · ")}
                  {pkg.appliedAt && ` · ${t("appliedAt", { at: formatInstant(pkg.appliedAt) ?? "" })}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Page>
    );
  });
}
