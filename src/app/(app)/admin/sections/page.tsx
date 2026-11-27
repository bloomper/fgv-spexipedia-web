import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getKinds } from "@/lib/admin/admin.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { KindsEditor } from "@/components/wiki/manage/kinds-editor.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("AdminSections"))("title"));
}

/**
 * The sections of the spex pages (spec 4.2, 4.6), kept as section kinds: their order is the pages' default order. Image
 * sections and sections of the other applications are added and deleted here; each image section's own image kinds
 * are kept under Kinds, with the other image kinds.
 */
export default async function SectionsPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const [t, kinds] = await Promise.all([getTranslations("AdminSections"), getKinds("SECTION")]);

    return (
      <Page variant="content">
        <PageHeader title={t("title")} description={t("description")} />
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t("imageKinds")} <Link href="/admin/kinds?type=IMAGE" className="underline underline-offset-4 hover:text-foreground">{t("imageKindsLink")}</Link>.
        </p>
        <section className="max-w-4xl space-y-3" aria-label={t("title")}>
          <KindsEditor type="SECTION" use={null} kinds={kinds} />
        </section>
      </Page>
    );
  });
}
