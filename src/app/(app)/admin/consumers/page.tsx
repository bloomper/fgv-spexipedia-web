import { getTranslations } from "next-intl/server";
import { getSyncConsumers } from "@/lib/admin/admin.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { ConsumersEditor } from "@/components/wiki/manage/admin-lists.client";

/**
 * The applications that copy base data: how far each has read the change feed, and where to tell them of changes.
 */
export default async function ConsumersPage() {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const [t, consumers] = await Promise.all([getTranslations("AdminConsumers"), getSyncConsumers()]);

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t("description")}
        />
        <ConsumersEditor consumers={consumers} />
      </Page>
    );
  });
}
