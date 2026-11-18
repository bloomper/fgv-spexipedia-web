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
import { PageHeader } from "@/components/page-header";
import { SpexSection } from "@/components/wiki/spex-section";
import { SectionRail } from "@/components/wiki/section-rail.client";
import { RevisionList } from "@/components/wiki/revision-list";
import { buttonVariants } from "@/components/ui/button";
import { FactsEditor, SpexBaseDataEditor, SpexTextsEditor } from "@/components/wiki/manage/spex-head-editor.client";
import { SpexMediaEditor } from "@/components/wiki/manage/spex-media-editor.client";
import { CharactersEditor, NumbersEditor, RevivalChangesEditor, ScenesEditor } from "@/components/wiki/manage/spex-lists-editor.client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getSpexEdit((await params).id).catch(() => null);

  return privateMetadata((await getTranslations("Manage"))("editSpex", { title: data?.spex?.title ?? "" }));
}

/**
 * Editing a spex and its page. Authors write the texts, images and photos; editors also keep the base data and the
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
    const sections = [
      "base", "texts", "facts", "media",
      ...(viewer.editor ? ["characters", "scenes", "numbers"] : []),
      ...(viewer.editor && spex.revival ? ["revival"] : []),
      "history",
    ].map(section => ({ id: `edit-${section}`, title: t(`editSections.${section}`) }));

    return (
      <div className="mx-auto flex w-full max-w-7xl gap-10 px-4 py-6 md:px-8">
        <div className="min-w-0 flex-1 space-y-8">
          <PageHeader title={t("editSpex", { title: `${spex.title} (${spex.year})` })}
                      actions={<Link href={`/spex/${spex.slug}`} className={buttonVariants({ variant: "outline", size: "sm" })}><ExternalLink aria-hidden /> {t("showPage")}</Link>} />
          <SpexSection id="edit-base" title={t("editSections.base")}>
            <SpexBaseDataEditor spex={spex} categories={base?.spexCategories ?? []} allSpex={base?.spexAll ?? []} editor={viewer.editor} />
          </SpexSection>
          <SpexSection id="edit-texts" title={t("editSections.texts")}>
            <SpexTextsEditor spex={spex} />
          </SpexSection>
          <SpexSection id="edit-facts" title={t("editSections.facts")}>
            <FactsEditor spex={spex} factKinds={kinds?.factKinds ?? []} />
          </SpexSection>
          <SpexSection id="edit-media" title={t("editSections.media")}>
            <SpexMediaEditor spex={spex} kinds={{ scenographyImageKinds: kinds?.scenographyImageKinds ?? [], pageImageKinds: kinds?.pageImageKinds ?? [] }} />
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
        <aside className="w-52 shrink-0 max-xl:hidden">
          <SectionRail sections={sections} label={t("onThisPage")} />
        </aside>
      </div>
    );
  });
}
