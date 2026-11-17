import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBaseData, getMedia, getRecordingEdit } from "@/lib/wiki/edit.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { RecordingEditor } from "@/components/wiki/manage/recording-editor.client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("ManageRecordings"))("editTitle"));
}

/**
 * Editing a recording: its facts, covers, conductor, tracks and the album in Spexify.
 */
export default async function ManageRecordingPage({ params }: Props) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const { id } = await params;
    const [t, recording, base, media] = await Promise.all([getTranslations("ManageRecordings"), getRecordingEdit(id), getBaseData(), getMedia()]);

    if (!recording) {
      notFound();
    }
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={`${recording.catalogueNumber} ${recording.title}`} description={t("editDescription")} />
        <RecordingEditor recording={recording} media={media} spex={(base?.spexAll ?? []).filter(s => !s.retired || s.id === recording.spex?.id).map(s => ({ id: s.id, label: `${s.year} ${s.title}` }))} />
      </div>
    );
  });
}
