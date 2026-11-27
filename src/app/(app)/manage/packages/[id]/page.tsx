import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getSpexPackage } from "@/lib/packages/packages.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { SpexSection } from "@/components/wiki/spex-section";
import { StateChip } from "@/components/wiki/packages/package-state";
import { PackageReport } from "@/components/wiki/packages/package-report";
import { PackageActions, ProgressBar, ZipResume } from "@/components/wiki/packages/package-forms.client";
import { RefreshWhileRunning } from "@/app/(app)/admin/maintenance/refresh-while-running.client";
import { ID } from "@/utils/ids";
import { formatInstant } from "@/utils/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Packages"))("title"));
}

/**
 * A spex package (spec 5.14): its state, the rest of its zip when it did not all arrive, the progress of a preview
 * or apply that runs (the page polls), and the preview and the results per application.
 */
export default async function PackagePage({ params }: Props) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const { id } = await params;

    if (!ID.test(id)) {
      notFound();
    }
    const [t, pkg] = await Promise.all([getTranslations("Packages"), getSpexPackage(id)]);

    if (!pkg) {
      notFound();
    }
    const running = pkg.state === "PREVIEWING" || pkg.state === "APPLYING";
    const zipComplete = pkg.zipSize == null || pkg.zipReceived >= pkg.zipSize;

    return (
      <Page variant="content" className="mx-auto w-full max-w-7xl">
        <RefreshWhileRunning running={running} />
        <PageHeader title={pkg.fileName} description={[pkg.zipFileName, pkg.uploadedByName, formatInstant(pkg.createdAt)].filter(Boolean).join(" · ")}
                    actions={<PackageActions id={pkg.id} state={pkg.state} zipComplete={zipComplete} />} />
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StateChip state={pkg.state} />
          {pkg.spex && <Link href={`/spex/${pkg.spex.slug}`} className="text-link hover:text-link/80">{t("spexLink", { title: pkg.spex.title, year: pkg.spex.year })}</Link>}
          {pkg.appliedAt && <span className="text-muted-foreground">{t("appliedAt", { at: formatInstant(pkg.appliedAt) ?? "" })}</span>}
          <Link href="/manage/packages" className="ml-auto text-link hover:text-link/80">{t("back")}</Link>
        </div>
        {!zipComplete && !running && <ZipResume id={pkg.id} zipFileName={pkg.zipFileName ?? null} zipSize={pkg.zipSize!} zipReceived={pkg.zipReceived} />}
        {running && (
          <div className="space-y-2 rounded-lg border border-border bg-card p-4" role="status">
            <ProgressBar value={pkg.progress} label={t(`states.${pkg.state}`)} />
            <p className="text-sm text-muted-foreground">{pkg.progress} % {pkg.message && `· ${pkg.message}`}</p>
          </div>
        )}
        {!running && pkg.message && <p className={pkg.state === "FAILED" ? "rounded-md border border-destructive/50 p-3 text-sm text-destructive" : "text-sm text-muted-foreground"}>{pkg.message}</p>}
        {pkg.state === "UPLOADED" && zipComplete && <p className="text-sm text-muted-foreground">{t("previewFirst")}</p>}
        {pkg.results && (
          <SpexSection id="results" title={t("results")}>
            <PackageReport report={pkg.results} />
          </SpexSection>
        )}
        {pkg.preview && (
          <SpexSection id="preview" title={t("previewHeading")}>
            <PackageReport report={pkg.preview} />
          </SpexSection>
        )}
      </Page>
    );
  });
}
