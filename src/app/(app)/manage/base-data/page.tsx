import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBaseData } from "@/lib/wiki/edit.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { BaseDataManager } from "@/components/wiki/manage/base-data-manager.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("BaseData"))("title"));
}

/**
 * Base data, which every other FGV application copies: spex categories, spex, task categories and tasks. Editors
 * create and change them; admins disable and merge.
 */
export default async function BaseDataPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; tab?: string }>;
}) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const [t, data, viewer, { edit, tab }] = await Promise.all([
      getTranslations("BaseData"),
      getBaseData(),
      getViewer(),
      searchParams,
    ]);

    return (
      <Page
        variant="content"
        className="mx-auto w-full max-w-7xl"
      >
        <PageHeader
          title={t("title")}
          description={t("intro")}
        />
        {data && (
          <BaseDataManager
            data={data}
            admin={viewer.admin}
            highlight={edit ?? null}
            initialTab={tab ?? null}
          />
        )}
      </Page>
    );
  });
}
