import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getTrash } from "@/lib/wiki/edit.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
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
      <Page
        variant="content"
        className="mx-auto w-full max-w-7xl"
      >
        <PageHeader
          title={t("title")}
          description={t("description")}
        />
        <TrashView
          articles={trash?.articles ?? []}
          images={trash?.images ?? []}
          admin={viewer.admin}
        />
      </Page>
    );
  });
}
