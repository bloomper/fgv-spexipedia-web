import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBaseData } from "@/lib/wiki/edit.server";
import { getRecordings } from "@/lib/wiki/wiki.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { NewRecordingForm } from "@/components/wiki/manage/recording-editor.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("ManageRecordings"))("title"));
}

/**
 * Every recording, published or not, and a new one.
 */
export default async function ManageRecordingsPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const [t, recordings, base] = await Promise.all([getTranslations("ManageRecordings"), getRecordings(), getBaseData()]);

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("title")} />
        <NewRecordingForm spex={(base?.spexAll ?? []).filter(s => !s.retired).map(s => ({ id: s.id, label: `${s.year} ${s.title}` }))} />
        <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
          {recordings.map(recording => (
            <li key={recording.id} className="link-row flex flex-wrap items-center gap-2 px-3 py-2">
              <span className="w-24 text-muted-foreground">{recording.catalogueNumber}</span>
              <Link href={`/manage/recordings/${recording.id}`} className="row-link font-medium">{recording.title}</Link>
              {!recording.published && <Badge variant="outline">{t("unpublished")}</Badge>}
              {recording.spex && <span className="ml-auto text-xs text-muted-foreground">{recording.spex.year} {recording.spex.title}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  });
}
