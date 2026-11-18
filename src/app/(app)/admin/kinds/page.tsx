import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getKinds } from "@/lib/admin/admin.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { PageHeader } from "@/components/page-header";
import { LinkTabs } from "@/components/link-tabs";
import { KindsEditor } from "@/components/wiki/manage/kinds-editor.client";
import { isKindType, KIND_TYPES, kindTypes } from "@/utils/kinds";

type Props = { searchParams: Promise<{ type?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("AdminKinds"))("title"));
}

/**
 * The kinds admins keep (spec 4.6), one type at a time: number kinds, credit kinds, recording media, image kinds per
 * use, and fact kinds. The types and uses are the schema's; the kinds within them are data.
 */
export default async function KindsPage({ searchParams }: Props) {
  return withPolicyPage(Policies.admin.requireAdmin, async () => {
    const { type: requested } = await searchParams;
    const type = isKindType(requested) ? requested : kindTypes()[0];
    const uses = KIND_TYPES[type].length > 0 ? KIND_TYPES[type] : [null];
    const [t, groups] = await Promise.all([
      getTranslations("AdminKinds"),
      Promise.all(uses.map(async use => ({ use, kinds: await getKinds(type, use) }))),
    ]);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <PageHeader title={t("title")} description={t("description")} />
        <LinkTabs label={t("types.label")} items={kindTypes().map(each => ({ href: `/admin/kinds?type=${each}`, label: t(`types.${each}`), active: each === type }))} />
        <p className="max-w-3xl text-sm text-muted-foreground">{t(`typeHelp.${type}`)}</p>
        <div className="max-w-4xl space-y-8">
          {groups.map(({ use, kinds }) => (
            <section key={use ?? "all"} className="space-y-3" aria-label={use ? t(`uses.${use}`) : t(`types.${type}`)}>
              {use && <h2 className="wiki-heading text-2xl font-semibold">{t(`uses.${use}`)}</h2>}
              <KindsEditor type={type} use={use} kinds={kinds} />
            </section>
          ))}
        </div>
      </div>
    );
  });
}
