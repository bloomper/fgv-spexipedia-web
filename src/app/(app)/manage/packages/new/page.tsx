import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
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
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("new")} description={t("newDescription")} />
        <p className="text-sm"><a href="/api/packages/template" download className="text-primary hover:text-primary/80">{t("template")}</a> · <Link href="/manage/packages" className="text-primary hover:text-primary/80">{t("back")}</Link></p>
        <NewPackageForm />
      </div>
    );
  });
}
