import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getUnresolvedCredits } from "@/lib/wiki/edit.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { UnresolvedCredits } from "@/components/wiki/manage/unresolved-credits.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("UnresolvedCredits"))("title"));
}

/**
 * Imported credits nobody has resolved yet (spec 5.3), for editors to resolve.
 */
export default async function UnresolvedCreditsPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const [t, data] = await Promise.all([getTranslations("UnresolvedCredits"), getUnresolvedCredits()]);

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("title")} description={t("description", { count: data?.total ?? 0 })} />
        <UnresolvedCredits data={data ?? { total: 0, credits: [] }} />
      </div>
    );
  });
}
