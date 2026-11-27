import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getUnresolvedCredits } from "@/lib/wiki/edit.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
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
      <Page
        variant="content"
        className="mx-auto w-full max-w-7xl"
      >
        <PageHeader
          title={t("title")}
          description={t("description", { count: data?.total ?? 0 })}
        />
        <UnresolvedCredits data={data ?? { total: 0, credits: [] }} />
      </Page>
    );
  });
}
