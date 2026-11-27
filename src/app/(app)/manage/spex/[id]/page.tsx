import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBaseData, getEditKinds, getSpexEdit } from "@/lib/wiki/edit.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";
import { SpexSection } from "@/components/wiki/spex-section";
import { SectionRail } from "@/components/wiki/section-rail.client";
import { RevisionList } from "@/components/wiki/revision-list";
import { buttonVariants } from "@bloomper/fgv-web-ui/ui/button";
import { FactsEditor, SpexBaseDataEditor, SpexProductions, SpexTextsEditor } from "@/components/wiki/manage/spex-head-editor.client";
import { SpexMediaEditor } from "@/components/wiki/manage/spex-media-editor.client";
import { type SectionMaterial, SpexSectionsEditor } from "@/components/wiki/manage/spex-sections-editor.client";
import type { SpexEditData } from "@/lib/wiki/edit.server";
import type { AppLinkKind, SectionContent } from "@/gql/graphql";
import { appRef } from "@/utils/app-refs";
import { SpexCompleteness } from "@/components/wiki/manage/spex-completeness";
import { CharactersEditor, NumbersEditor, RevivalChangesEditor, ScenesEditor } from "@/components/wiki/manage/spex-lists-editor.client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getSpexEdit((await params).id).catch(() => null);

  return privateMetadata((await getTranslations("Manage"))("editSpex", { title: data?.spex?.title ?? "" }));
}

/**
 * Editing a spex and its page, one production at a time: the original or one of its revivals (SpexProductions switches
 * between them; a revival keeps only what it changes). Authors write the texts, images and photos; editors also keep the base data and the
 * characters, scenes and numbers. Spexregister's editors come here by the spex's id.
 */
export default async function ManageSpexPage({ params }: Props) {
  return withPolicyPage(Policies.author.requireAuthor, async () => {
    const { id } = await params;
    const [t, data, base, viewer, kinds] = await Promise.all([getTranslations("Manage"), getSpexEdit(id), getBaseData(), getViewer(), getEditKinds()]);
    const spex = data?.spex;

    if (!spex) {
      notFound();
    }
    const shown = [
      "base", "texts", "facts", "sections", "media",
      ...(viewer.editor ? ["characters", "scenes", "numbers"] : []),
      ...(viewer.editor && spex.revival ? ["revival"] : []),
      "history",
    ];
    const sections = shown.map(section => ({ id: `edit-${section}`, title: t(`editSections.${section}`) }));
    const completeness = spex.completeness;

    return (
      <div className="mx-auto flex w-full max-w-7xl gap-10 p-4 md:p-8">
        <div className="min-w-0 flex-1 space-y-8">
          <PageHeader title={t("editSpex", { title: `${spex.title} (${spex.year})` })}
                      actions={<Link href={`/spex/${spex.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}><ExternalLink aria-hidden /> {t("showPage")}</Link>} />
          {completeness && <SpexCompleteness completeness={completeness} sections={shown} revival={spex.revival} folded className="xl:hidden" />}
          <SpexProductions spex={spex} editor={viewer.editor} admin={viewer.admin} />
          <SpexSection id="edit-base" title={t("editSections.base")}>
            <SpexBaseDataEditor spex={spex} categories={base?.spexCategories ?? []} allSpex={base?.spexAll ?? []} editor={viewer.editor} />
          </SpexSection>
          <SpexSection id="edit-texts" title={t("editSections.texts")}>
            <SpexTextsEditor spex={spex} />
          </SpexSection>
          <SpexSection id="edit-facts" title={t("editSections.facts")}>
            <FactsEditor spex={spex} factKinds={kinds?.factKinds ?? []} />
          </SpexSection>
          <SpexSection id="edit-sections" title={t("editSections.sections")}>
            <SpexSectionsEditor spex={spex} sectionKinds={kinds?.sectionKinds ?? []} materials={materials(spex)} />
          </SpexSection>
          <SpexSection id="edit-media" title={t("editSections.media")}>
            <SpexMediaEditor spex={spex} sectionKinds={kinds?.sectionKinds ?? []} />
          </SpexSection>
          {viewer.editor && (
            <>
              <SpexSection id="edit-characters" title={t("editSections.characters")}>
                <CharactersEditor spex={spex} editor={viewer.editor} imageKinds={kinds?.characterImageKinds ?? []} />
              </SpexSection>
              <SpexSection id="edit-scenes" title={t("editSections.scenes")}>
                <ScenesEditor spex={spex} />
              </SpexSection>
              <SpexSection id="edit-numbers" title={t("editSections.numbers")}>
                <NumbersEditor spex={spex} numberKinds={kinds?.numberKinds ?? []} creditKinds={kinds?.creditKinds ?? []} />
              </SpexSection>
              {spex.revival && (
                <SpexSection id="edit-revival" title={t("editSections.revival")}>
                  <RevivalChangesEditor spex={spex} />
                </SpexSection>
              )}
            </>
          )}
          <SpexSection id="edit-history" title={t("editSections.history")}>
            {spex.page && spex.page.history.length > 0 ? <RevisionList revisions={spex.page.history} showTarget={false} /> : <p className="text-sm text-muted-foreground">{t("noHistory")}</p>}
          </SpexSection>
        </div>
        <aside className="w-60 shrink-0 max-xl:hidden">
          <div className="sticky top-20 max-h-[calc(100svh-6rem)] space-y-6 overflow-y-auto">
            {completeness && <SpexCompleteness completeness={completeness} sections={shown} revival={spex.revival} />}
            <SectionRail sections={sections} label={t("onThisPage")} />
          </div>
        </aside>
      </div>
    );
  });
}

/** The link kinds whose material a section of that content can show (spec 4.2.1). */
const MATERIAL_LINKS: Partial<Record<AppLinkKind, { content: SectionContent; ref: string }>> = {
  SPEXFLIX_VIDEO: { content: "SPEXFLIX_VIDEO", ref: "spexflix:video/" },
  SPEXGRAM_ALBUM: { content: "SPEXGRAM", ref: "spexgram:album/" },
  SPEXIFY_ALBUM: { content: "SPEXIFY_ALBUM", ref: "spexify:album/" },
  ARCHIVE_MANUSCRIPT: { content: "ARCHIVE_DOCUMENT", ref: "arkiv:document/" },
  ARCHIVE_DOCUMENT: { content: "ARCHIVE_DOCUMENT", ref: "arkiv:document/" },
};

/**
 * What the spex has in the other applications that a section can show: the material it links to, by the ids in the
 * links' addresses, and its records, which everyone sees.
 */
function materials(spex: SpexEditData): SectionMaterial[] {
  const webs = {
    spexify: process.env.SPEXIFY_WEB_URL, spexflix: process.env.SPEXFLIX_WEB_URL,
    spexgram: process.env.SPEXGRAM_WEB_URL, archive: process.env.ARCHIVE_WEB_URL,
  };
  const found = new Map<string, SectionMaterial>();

  for (const link of spex.links) {
    const material = MATERIAL_LINKS[link.kind];
    const ref = material && appRef(link.url, webs);

    if (material && ref?.startsWith(material.ref)) {
      const id = ref.slice(material.ref.length);

      found.set(`${material.content}:${id}`, { content: material.content, id, title: link.detail ? `${link.title} (${link.detail})` : link.title });
    }
  }
  for (const record of spex.records) {
    found.set(`SPEXIFY_ALBUM:${record.id}`, { content: "SPEXIFY_ALBUM", id: record.id, title: record.year ? `${record.title} (${record.year})` : record.title });
  }
  return [...found.values()];
}
