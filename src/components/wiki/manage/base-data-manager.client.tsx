"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Archive, ArchiveRestore, GitMerge, Pencil, Plus, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@/components/dialogs.client";
import {
  mergeAction,
  retireAction,
  saveSpexAction,
  saveSpexCategoryAction,
  saveTaskAction,
  saveTaskCategoryAction,
} from "@/app/(app)/manage/actions.server";
import type { BaseData } from "@/lib/wiki/edit.server";
import type { BaseDataKind } from "@/gql/graphql";
import { cn } from "@/utils/utils";
import { categoryYears } from "@/utils/spex-years";

type Row = { id: string; label: string; retired?: boolean; extra?: ReactNode };

/**
 * One kind of base data as a list: each row can be edited in place; admins retire a record (it stays readable by id
 * but is not offered for new use) or merge it into another (the other applications move their references).
 */
function BaseList({ id, title, kind, rows, admin, highlight, form, editHref, newForm }: {
  id: string;
  title: string;
  kind: BaseDataKind | null;
  rows: Row[];
  admin: boolean;
  highlight: string | null;
  /** A row is edited in place by its form, or on its own page at editHref. */
  form?: (rowId: string, done: () => void) => ReactNode;
  editHref?: (rowId: string) => string;
  newForm: (done: () => void) => ReactNode;
}) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const { choose, confirm } = useDialogs();
  const [editing, setEditing] = useState<string | null>(rows.some(row => row.id === highlight) ? highlight : null);
  const [showRetired, setShowRetired] = useState(false);
  const shown = rows.filter(row => showRetired || !row.retired || row.id === highlight);

  return (
    <section id={id} className="scroll-mt-20 space-y-3" aria-labelledby={`${id}-heading`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-heading`} className="wiki-heading text-xl font-semibold">{title} <span className="text-sm text-muted-foreground">({rows.length})</span></h2>
        <div className="flex items-center gap-3">
          {rows.some(row => row.retired) && (
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={showRetired} onCheckedChange={checked => setShowRetired(!!checked)} /> {t("showRetired")}</label>
          )}
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("add")}</Button>
        </div>
      </div>
      {editing === "new" && newForm(() => setEditing(null))}
      <ul className="max-h-[36rem] divide-y divide-border overflow-y-auto rounded-lg border border-border bg-card text-sm">
        {shown.map(row => (
          <li key={row.id} className={cn("space-y-2 px-3 py-2", row.id === highlight && "bg-primary/10")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("font-medium", row.retired && "text-muted-foreground line-through")}>{row.label}</span>
              {row.retired && <Badge variant="outline">{t("retired")}</Badge>}
              {row.extra}
              <span className="ml-auto inline-flex">
                {editHref
                  ? <Link href={editHref(row.id)} aria-label={t("edit")} title={t("edit")} className={buttonVariants({ size: "icon", variant: "ghost" })}><Pencil /></Link>
                  : <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === row.id ? null : row.id)}><Pencil /></Button>}
                {admin && kind && (
                  <>
                    <Button type="button" size="icon" variant="ghost" aria-label={row.retired ? t("unretire") : t("retire")} title={row.retired ? t("unretire") : t("retire")} disabled={pending}
                            onClick={() => save(() => retireAction(kind, row.id, !row.retired))}>{row.retired ? <ArchiveRestore /> : <Archive />}</Button>
                    <Button type="button" size="icon" variant="ghost" aria-label={t("merge")} title={t("merge")} disabled={pending} onClick={async () => {
                      const intoId = await choose({
                        title: t("mergeTitle", { label: row.label }),
                        items: rows.filter(other => other.id !== row.id && !other.retired).map(other => ({ id: other.id, label: other.label })),
                      });

                      if (intoId && await confirm({ title: t("mergeConfirm"), description: t("mergeConfirmText"), confirmLabel: t("merge"), destructive: true })) {
                        void save(() => mergeAction(kind, row.id, intoId));
                      }
                    }}><GitMerge /></Button>
                  </>
                )}
              </span>
            </div>
            {editing === row.id && form?.(row.id, () => setEditing(null))}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Buttons({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  const t = useTranslations("BaseData");

  return (
    <div className="flex gap-2">
      <Button type="submit" size="sm" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
      <Button type="button" size="sm" variant="ghost" onClick={onCancel}><X aria-hidden /> {t("cancel")}</Button>
    </div>
  );
}

const box = "space-y-3 rounded-md border border-border bg-background p-3";

function SpexCategoryForm({ category, done }: { category?: BaseData["spexCategories"][number]; done: () => void }) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ name: category?.name ?? "", firstYear: category?.firstYear ?? "", description: category?.description ?? "" });

  return (
    <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
      {category ? (
        <ImageSlot label={t("logo")} kind="LOGO" image={category.logo}
                   onChange={logoId => save(() => saveSpexCategoryAction(category.id, { name: category.name, firstYear: category.firstYear, description: category.description ?? null }, logoId))} />
      ) : <div />}
      <form className={box} onSubmit={async event => {
        event.preventDefault();
        if (await save(() => saveSpexCategoryAction(category?.id ?? null, { ...values, description: values.description.trim() || null }, undefined))) {
          done();
        }
      }}>
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
          <div className="space-y-1.5"><Label>{t("name")}<Input required value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} /></Label></div>
          <div className="space-y-1.5"><Label>{t("firstYear")}<Input required pattern="\d{4}" value={values.firstYear} onChange={event => setValues({ ...values, firstYear: event.target.value })} /></Label></div>
        </div>
        <Label className="flex-col items-start">{t("description")}<Textarea rows={3} value={values.description} onChange={event => setValues({ ...values, description: event.target.value })} /></Label>
        <Buttons pending={pending} onCancel={done} />
      </form>
    </div>
  );
}

function SpexForm({ categories, spex, done }: { categories: BaseData["spexCategories"]; spex: BaseData["spexAll"]; done: () => void }) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ year: "", title: "", categoryId: "" });
  const years = categoryYears(categories.find(c => c.id === values.categoryId), spex);

  return (
    <form className={box} onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveSpexAction(null, { year: values.year, title: values.title.trim(), categoryId: values.categoryId }))) {
        done();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)]">
        <Label className="flex-col items-start">{t("category")}
          <NativeSelect required className="w-full" value={values.categoryId}
                        onChange={event => setValues({ ...values, categoryId: event.target.value, year: "" })}>
            <NativeSelectOption value="" disabled>{t("chooseCategory")}</NativeSelectOption>
            {categories.filter(c => !c.retired).map(c => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}
          </NativeSelect>
        </Label>
        <Label className="flex-col items-start">{t("year")}
          <NativeSelect required className="w-full" value={values.year} disabled={!values.categoryId}
                        onChange={event => setValues({ ...values, year: event.target.value })}>
            <NativeSelectOption value="" disabled>{values.categoryId && years.length === 0 ? t("noFreeYear") : t("chooseYear")}</NativeSelectOption>
            {years.map(year => <NativeSelectOption key={year} value={year}>{year}</NativeSelectOption>)}
          </NativeSelect>
        </Label>
        <Label className="flex-col items-start">{t("spexTitle")}<Input required value={values.title} onChange={event => setValues({ ...values, title: event.target.value })} /></Label>
      </div>
      <p className="text-xs text-muted-foreground">{t("spexHelp")}</p>
      <Buttons pending={pending} onCancel={done} />
    </form>
  );
}

function TaskCategoryForm({ category, done }: { category?: BaseData["taskCategories"][number]; done: () => void }) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ name: category?.name ?? "", actorPresent: category?.actorPresent ?? false, board: category?.board ?? false, instruments: category?.instruments ?? false });

  return (
    <form className={box} onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveTaskCategoryAction(category?.id ?? null, { ...values, name: values.name.trim() }))) {
        done();
      }
    }}>
      <Label className="flex-col items-start">{t("name")}<Input required value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} /></Label>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={values.actorPresent} onCheckedChange={checked => setValues({ ...values, actorPresent: !!checked })} /> {t("actorPresent")}</label>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={values.board} onCheckedChange={checked => setValues({ ...values, board: !!checked })} /> {t("board")}</label>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={values.instruments} onCheckedChange={checked => setValues({ ...values, instruments: !!checked })} /> {t("instruments")}</label>
      <Buttons pending={pending} onCancel={done} />
    </form>
  );
}

function TaskForm({ task, categories, done }: { task?: BaseData["tasks"][number]; categories: BaseData["taskCategories"]; done: () => void }) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ name: task?.name ?? "", categoryId: task?.category?.id ?? categories[0]?.id ?? "" });

  return (
    <form className={box} onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveTaskAction(task?.id ?? null, { name: values.name.trim(), categoryId: values.categoryId }))) {
        done();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Label className="flex-col items-start">{t("name")}<Input required value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} /></Label>
        <Label className="flex-col items-start">{t("category")}
          <NativeSelect required value={values.categoryId} onChange={event => setValues({ ...values, categoryId: event.target.value })}>
            {categories.filter(c => !c.retired || c.id === values.categoryId).map(c => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}
          </NativeSelect>
        </Label>
      </div>
      <Buttons pending={pending} onCancel={done} />
    </form>
  );
}

export function BaseDataManager({ data, admin, highlight }: { data: BaseData; admin: boolean; highlight: string | null }) {
  const t = useTranslations("BaseData");
  const spex = [...data.spexAll].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <div className="space-y-10">
      <nav className="flex flex-wrap gap-2 text-sm">
        {["spex", "spex-categories", "task-categories", "tasks"].map(id => (
          <a key={id} href={`#${id}`} className="rounded-full border border-border px-3 py-1 hover:border-primary hover:text-primary">{t(`sections.${id}`)}</a>
        ))}
      </nav>
      <BaseList id="spex" title={t("sections.spex")} kind="SPEX" admin={admin} highlight={highlight}
                rows={spex.map(s => ({
                  id: s.id, label: `${s.year} ${s.title}`, retired: s.retired,
                  extra: <>
                    {s.revival && <Badge variant="secondary">{t("revival")}</Badge>}
                    {!s.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                    {s.category && <span className="text-xs text-muted-foreground">{s.category.name}</span>}
                  </>,
                }))}
                editHref={id => `/manage/spex/${id}`}
                newForm={done => <SpexForm categories={data.spexCategories} spex={data.spexAll} done={done} />} />
      <BaseList id="spex-categories" title={t("sections.spex-categories")} kind="SPEX_CATEGORY" admin={admin} highlight={highlight}
                rows={data.spexCategories.map(c => ({ id: c.id, label: c.name, retired: c.retired, extra: <span className="text-xs text-muted-foreground">{t("since", { year: c.firstYear })}</span> }))}
                form={(id, done) => <SpexCategoryForm category={data.spexCategories.find(c => c.id === id)} done={done} />}
                newForm={done => <SpexCategoryForm done={done} />} />
      <BaseList id="task-categories" title={t("sections.task-categories")} kind="TASK_CATEGORY" admin={admin} highlight={highlight}
                rows={data.taskCategories.map(c => ({
                  id: c.id, label: c.name, retired: c.retired,
                  extra: <>{c.actorPresent && <Badge variant="secondary">{t("actorPresent")}</Badge>}{c.board && <Badge variant="secondary">{t("board")}</Badge>}{c.instruments && <Badge variant="secondary">{t("instruments")}</Badge>}</>,
                }))}
                form={(id, done) => <TaskCategoryForm category={data.taskCategories.find(c => c.id === id)} done={done} />}
                newForm={done => <TaskCategoryForm done={done} />} />
      <BaseList id="tasks" title={t("sections.tasks")} kind="TASK" admin={admin} highlight={highlight}
                rows={data.tasks.map(task => ({ id: task.id, label: task.name, retired: task.retired, extra: <span className="text-xs text-muted-foreground">{task.category?.name}</span> }))}
                form={(id, done) => <TaskForm task={data.tasks.find(task => task.id === id)} categories={data.taskCategories} done={done} />}
                newForm={done => <TaskForm categories={data.taskCategories} done={done} />} />
    </div>
  );
}
