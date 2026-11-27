import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { NewPackageForm } from "@/components/wiki/packages/package-forms.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Packages"))("new"));
}

/**
 * A new spex package: the filled-in template and, optionally, a zip with its files.
 */
export default async function NewPackagePage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const t = await getTranslations("Packages");

    return (
      <Page variant="content" className="mx-auto w-full max-w-7xl">
        <PageHeader title={t("new")} description={t("newDescription")} />
        <p className="text-sm"><a href="/api/packages/template" download className="text-link hover:text-link/80">{t("template")}</a> · <Link href="/manage/packages" className="text-link hover:text-link/80">{t("back")}</Link></p>
        <NewPackageForm />
      </Page>
    );
  });
}
