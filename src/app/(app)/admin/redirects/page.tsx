import { getTranslations } from "next-intl/server";
import { getRedirects } from "@/lib/admin/admin.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { PageHeader } from "@/components/page-header";
import { RedirectsEditor } from "@/components/wiki/manage/admin-lists.client";

/**
 * Redirects from the old MediaWiki's titles to the pages that replaced them.
 */
export default async function RedirectsPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const [t, redirects] = await Promise.all([getTranslations("AdminRedirects"), getRedirects()]);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <PageHeader title={t("title")} description={t("description")} />
        <RedirectsEditor redirects={redirects} />
      </div>
    );
  });
}
