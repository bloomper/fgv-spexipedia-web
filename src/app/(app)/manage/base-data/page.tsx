import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBaseData } from "@/lib/wiki/edit.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { BaseDataManager } from "@/components/wiki/manage/base-data-manager.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("BaseData"))("title"));
}

/**
 * Base data, which every other FGV application copies: spex categories, spex, task categories and tasks. Editors
 * create and change them; admins disable and merge.
 */
export default async function BaseDataPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const [t, data, viewer, { edit }] = await Promise.all([getTranslations("BaseData"), getBaseData(), getViewer(), searchParams]);

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("title")} description={t("description")} />
        {data && <BaseDataManager data={data} admin={viewer.admin} highlight={edit ?? null} />}
      </div>
    );
  });
}
