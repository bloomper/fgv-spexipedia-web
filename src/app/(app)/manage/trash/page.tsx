import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getTrash } from "@/lib/wiki/edit.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { TrashView } from "@/components/wiki/manage/trash.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("Trash"))("title"));
}

/**
 * Trashed articles and images, to restore; admins empty the trash.
 */
export default async function TrashPage() {
  return withPolicyPage(Policies.author.requireAuthor, async () => {
    const [t, trash, viewer] = await Promise.all([getTranslations("Trash"), getTrash(), getViewer()]);

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("title")} description={t("description")} />
        <TrashView articles={trash?.articles ?? []} images={trash?.images ?? []} admin={viewer.admin} />
      </div>
    );
  });
}
