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
import { createRevivalAction, saveSpexAction, savePageAction, setPagePublishedAction } from "@/app/(app)/manage/actions.server";
import type { SpexEditData } from "@/lib/wiki/edit.server";

/**
 * The spex's base data, for editors: year, title and category (a revival takes its parent's), the poster, and new
 * revivals.
 */
export function SpexBaseDataEditor({ spex, categories, editor }: {
  spex: SpexEditData;
  categories: { id: string; name: string; retired: boolean }[];
  editor: boolean;
}) {
  const t = useTranslations("Manage");
  const router = useRouter();
  const { save, pending } = useSave();
  const [year, setYear] = useState(spex.year);
  const [title, setTitle] = useState(spex.title);
  const [categoryId, setCategoryId] = useState(spex.category?.id ?? "");
  const [revivalYear, setRevivalYear] = useState("");

  return (
    <div className="grid gap-6 md:grid-cols-[12rem_1fr]">
      <ImageSlot label={t("poster")} kind="POSTER" image={spex.poster} disabled={!editor}
                 onChange={imageId => save(() => saveSpexAction(spex.id, { year: spex.year, title: spex.revival ? null : spex.title, categoryId: spex.category?.id ?? null }, imageId))} />
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        void save(() => saveSpexAction(spex.id, { year, title: spex.revival ? null : title, categoryId: spex.revival ? null : categoryId || null }), {
          then: saved => saved.slug !== spex.slug && router.refresh(),
        });
      }}>
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <div className="space-y-1.5">
            <Label htmlFor="year">{t("year")}</Label>
            <Input id="year" required pattern="\d{4}" value={year} disabled={!editor} onChange={event => setYear(event.target.value)} />
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
            <NativeSelect id="category" value={categoryId} disabled={!editor} onChange={event => setCategoryId(event.target.value)}>
              <NativeSelectOption value="">{t("none")}</NativeSelectOption>
              {categories.filter(c => !c.retired || c.id === categoryId).map(c => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}
            </NativeSelect>
          </div>
        )}
        {editor && <Button type="submit" disabled={pending}><Save aria-hidden /> {t("save")}</Button>}
        {editor && !spex.revival && (
          <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="revival-year">{t("newRevival")}</Label>
              <Input id="revival-year" placeholder="2025" pattern="\d{4}" className="w-28" value={revivalYear} onChange={event => setRevivalYear(event.target.value)} />
            </div>
            <Button type="button" variant="outline" disabled={pending || !/^\d{4}$/.test(revivalYear)} onClick={() => save(() => createRevivalAction(spex.id, revivalYear), {
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
    generation: page.generation ?? "",
    premiere: page.premiere ?? "",
    introduction: page.introduction ?? "",
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
        generation: values.generation.trim() || null,
        premiere: values.premiere || null,
        introduction: values.introduction.trim() || null,
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="generation">{t("generation")}</Label>
          <Input id="generation" value={values.generation} onChange={event => set("generation")(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="premiere">{t("premiere")}</Label>
          <Input id="premiere" type="date" value={values.premiere} onChange={event => set("premiere")(event.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="introduction">{t("introduction")}</Label>
        <Textarea id="introduction" rows={3} maxLength={1000} value={values.introduction} onChange={event => set("introduction")(event.target.value)} />
        <p className="text-xs text-muted-foreground">{t("introductionHelp")}</p>
      </div>
      <MarkdownEditor id="description" label={t("description")} value={values.description} onChange={set("description")} rows={10} />
      <MarkdownEditor id="synopsis" label={t("synopsis")} value={values.synopsis} onChange={set("synopsis")} rows={10} />
      <MarkdownEditor id="vestDescription" label={t("vestDescription")} value={values.vestDescription} onChange={set("vestDescription")} rows={5} />
      <CreditPicker label={t("vestWornBy")} value={wornBy} onChange={setWornBy} single />
      <Button type="submit" disabled={pending}><Save aria-hidden /> {t("saveTexts")}</Button>
    </form>
  );
}
