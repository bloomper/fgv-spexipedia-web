"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { MarkdownEditor } from "@/components/wiki/editor/markdown-editor.client";
import { CreditPicker, toCreditInput, toCreditValue, type CreditValue } from "@/components/wiki/editor/credit-picker.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { createRevivalAction, saveSpexAction, savePageAction, setFactsAction, setPagePublishedAction } from "@/app/(app)/manage/actions.server";
import type { EditKind, SpexEditData } from "@/lib/wiki/edit.server";
import { useServerState } from "@/hooks/use-server-state.client";
import { categoryYears, revivalYears } from "@/utils/spex-years";
import type { BaseData } from "@/lib/wiki/edit.server";

/**
 * The spex's base data, for editors: year, title and category (a revival takes its parent's), the poster, and new
 * revivals.
 */
export function SpexBaseDataEditor({ spex, categories, allSpex, editor }: {
  spex: SpexEditData;
  categories: BaseData["spexCategories"];
  allSpex: BaseData["spexAll"];
  editor: boolean;
}) {
  const t = useTranslations("Manage");
  const router = useRouter();
  const { save, pending } = useSave();
  const [year, setYear] = useState(spex.year);
  const [title, setTitle] = useState(spex.title);
  const [categoryId, setCategoryId] = useState(spex.category?.id ?? "");
  const [revivalYear, setRevivalYear] = useState("");
  // An original keeps before its revivals
  const firstRevival = Math.min(...spex.revivals.map(revival => Number(revival.year)));
  const ownYears = spex.parent ? revivalYears(spex.parent.year, spex.parent.revivals, spex.id)
    : categoryYears(categories.find(c => c.id === categoryId), allSpex, spex.id).filter(y => Number(y) < firstRevival);
  const newRevivalYears = revivalYears(spex.year, spex.revivals);

  return (
    <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
      <ImageSlot label={t("poster")} kind="POSTER" image={spex.poster} disabled={!editor}
                 onChange={imageId => save(() => saveSpexAction(spex.id, { year: spex.year, title: spex.revival ? null : spex.title, categoryId: spex.category?.id ?? null }, imageId))} />
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        void save(() => saveSpexAction(spex.id, { year, title: spex.revival ? null : title, categoryId: spex.revival ? null : categoryId }), {
          then: saved => saved.slug !== spex.slug && router.refresh(),
        });
      }}>
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="year">{t("year")}</Label>
            <NativeSelect id="year" required className="w-full" value={year} disabled={!editor} onChange={event => setYear(event.target.value)}>
              <NativeSelectOption value="" disabled>{t("chooseYear")}</NativeSelectOption>
              {year && !ownYears.includes(year) && <NativeSelectOption value={year}>{year}</NativeSelectOption>}
              {ownYears.map(y => <NativeSelectOption key={y} value={y}>{y}</NativeSelectOption>)}
            </NativeSelect>
          </div>
          {!spex.revival && (
            <div className="space-y-1.5">
              <Label htmlFor="spex-title">{t("title")}</Label>
              <Input id="spex-title" required value={title} disabled={!editor} onChange={event => setTitle(event.target.value)} />
            </div>
          )}
        </div>
        {!spex.revival && (
          <div className="space-y-1.5">
            <Label htmlFor="category">{t("category")}</Label>
            <NativeSelect id="category" required value={categoryId} disabled={!editor} onChange={event => {
              const next = event.target.value;

              setCategoryId(next);
              // A year the new category already has is not kept
              if (!categoryYears(categories.find(c => c.id === next), allSpex, spex.id).includes(year)) {
                setYear("");
              }
            }}>
              <NativeSelectOption value="" disabled>{t("chooseCategory")}</NativeSelectOption>
              {categories.filter(c => !c.retired || c.id === categoryId).map(c => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}
            </NativeSelect>
          </div>
        )}
        {editor && <Button type="submit" disabled={pending}><Save aria-hidden /> {t("save")}</Button>}
        {editor && !spex.revival && (
          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="revival-year">{t("newRevival")}</Label>
              <NativeSelect id="revival-year" className="w-28" value={revivalYear} onChange={event => setRevivalYear(event.target.value)}>
                <NativeSelectOption value="" disabled>{t("chooseYear")}</NativeSelectOption>
                {newRevivalYears.map(y => <NativeSelectOption key={y} value={y}>{y}</NativeSelectOption>)}
              </NativeSelect>
            </div>
            <Button type="button" variant="outline" disabled={pending || !revivalYear} onClick={() => save(() => createRevivalAction(spex.id, revivalYear), {
              then: revival => router.push(`/manage/spex/${revival.id}`),
            })}><Plus aria-hidden /> {t("createRevival")}</Button>
          </div>
        )}
      </form>
    </div>
  );
}

type Page = NonNullable<SpexEditData["page"]>;

/**
 * The texts of the page, for authors: every changed text is a revision. Saving over texts someone else changed since
 * the page was opened is refused; the server says so, and the author reloads to see theirs.
 */
export function SpexTextsEditor({ spex }: { spex: SpexEditData }) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const page: Partial<Page> = spex.page ?? {};
  const [values, setValues] = useState({
    premiere: page.premiere ?? "",
    introduction: page.introduction ?? "",
    shortDescription: page.shortDescription ?? "",
    description: page.description ?? "",
    synopsis: page.synopsis ?? "",
    vestDescription: page.vestDescription ?? "",
  });
  const [wornBy, setWornBy] = useState<CreditValue[]>(page.vestWornBy ? [toCreditValue(page.vestWornBy)] : []);
  const set = (field: keyof typeof values) => (value: string) => setValues({ ...values, [field]: value });

  return (
    <form className="space-y-5" onSubmit={event => {
      event.preventDefault();
      void save(() => savePageAction(spex.id, {
        premiere: values.premiere || null,
        introduction: values.introduction.trim() || null,
        shortDescription: values.shortDescription.trim() || null,
        description: values.description.trim() || null,
        synopsis: values.synopsis.trim() || null,
        vestDescription: values.vestDescription.trim() || null,
        vestWornBy: wornBy[0] ? toCreditInput(wornBy[0]) : null,
        baseRevisionIds: page.revisionIds ? {
          introduction: page.revisionIds.introduction ?? null,
          description: page.revisionIds.description ?? null,
          synopsis: page.revisionIds.synopsis ?? null,
        } : null,
      }));
    }}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
        <p className="text-sm">{page.published ? t("pagePublished") : t("pageUnpublished")}</p>
        <Button type="button" size="sm" variant="outline" disabled={pending}
                onClick={() => save(() => setPagePublishedAction(spex.id, !page.published))}>
          {page.published ? <EyeOff aria-hidden /> : <Eye aria-hidden />} {page.published ? t("unpublish") : t("publish")}
        </Button>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="premiere">{t("premiere")}</Label>
        <Input id="premiere" type="date" className="w-fit" value={values.premiere} onChange={event => set("premiere")(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="introduction">{t("introduction")}</Label>
        <Textarea id="introduction" rows={3} maxLength={1000} value={values.introduction} onChange={event => set("introduction")(event.target.value)} />
        <p className="text-xs text-muted-foreground">{t("introductionHelp")}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="shortDescription">{t("shortDescription")}</Label>
        <Textarea id="shortDescription" rows={2} maxLength={1000} value={values.shortDescription} onChange={event => set("shortDescription")(event.target.value)} />
        <p className="text-xs text-muted-foreground">{t("shortDescriptionHelp")}</p>
      </div>
      <MarkdownEditor id="description" label={t("description")} value={values.description} onChange={set("description")} rows={10} />
      <MarkdownEditor id="synopsis" label={t("synopsis")} value={values.synopsis} onChange={set("synopsis")} rows={10} />
      <MarkdownEditor id="vestDescription" label={t("vestDescription")} value={values.vestDescription} onChange={set("vestDescription")} rows={5} />
      <CreditPicker label={t("vestWornBy")} value={wornBy} onChange={setWornBy} single />
      <Button type="submit" disabled={pending}><Save aria-hidden /> {t("saveTexts")}</Button>
    </form>
  );
}

/** What a date fact accepts: as precise as known. */
const DATE = "\\d{4}(-\\d{2}(-\\d{2})?)?";

/**
 * The facts of the spex (spec 4.2), one per fact kind in the kinds' order: text, or a date for kinds marked as dates.
 * A new kind of fact is a kind an admin adds, not a change here. Empty values are left out when saved.
 */
export function FactsEditor({ spex, factKinds }: { spex: SpexEditData; factKinds: EditKind[] }) {
  const t = useTranslations("Manage");
  const { save, pending } = useSave();
  const facts = spex.page?.facts ?? [];
  const [values, setValues] = useServerState<Record<string, string>>(
    Object.fromEntries(facts.map(fact => [fact.kind.id, fact.value])),
    value => JSON.stringify(value));
  const kinds = factKinds.filter(kind => !kind.retired || values[kind.id]);

  if (kinds.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noFactKinds")}</p>;
  }
  return (
    <form className="space-y-4" onSubmit={event => {
      event.preventDefault();
      void save(() => setFactsAction(spex.id, kinds.map(kind => ({ kindId: kind.id, value: values[kind.id]?.trim() || null }))
        .filter(fact => fact.value)));
    }}>
      {spex.revival && <p className="text-xs text-muted-foreground">{t("factsRevivalHelp")}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {kinds.map(kind => (
          <div key={kind.id} className="space-y-1.5">
            <Label htmlFor={`fact-${kind.id}`}>{kind.name}{kind.retired && ` (${t("retired")})`}</Label>
            <Input id={`fact-${kind.id}`} maxLength={1000} value={values[kind.id] ?? ""}
                   {...(kind.valueType === "DATE" ? { pattern: DATE, placeholder: "1984-05-12" } : {})}
                   onChange={event => setValues({ ...values, [kind.id]: event.target.value })} />
            {kind.valueType === "DATE" && <p className="text-xs text-muted-foreground">{t("factDateHelp")}</p>}
          </div>
        ))}
      </div>
      <Button type="submit" disabled={pending}><Save aria-hidden /> {t("saveFacts")}</Button>
    </form>
  );
}
