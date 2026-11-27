"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Archive, ArchiveRestore, GitMerge, Pencil, Plus, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { Checkbox } from "@bloomper/fgv-web-ui/ui/checkbox";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { NativeSelect, NativeSelectOption } from "@bloomper/fgv-web-ui/ui/native-select";
import { Textarea } from "@bloomper/fgv-web-ui/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@bloomper/fgv-web-ui/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@bloomper/fgv-web-ui/ui/tabs";
import { ImageSlot } from "@/components/wiki/editor/image-slot.client";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
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

type Row = { id: string; label: string; retired?: boolean; categoryId?: string; extra?: ReactNode };

/**
 * One kind of base data as a list: each row can be edited in place; admins retire a record (it stays readable by id
 * but is not offered for new use) or merge it into another (the other applications move their references). Given
 * categories, the list can be narrowed to one of them. A new record is made in a dialog.
 */
function BaseList({
  kind,
  rows,
  admin,
  highlight,
  form,
  editHref,
  newTitle,
  newForm,
  categories,
}: {
  kind: BaseDataKind | null;
  rows: Row[];
  admin: boolean;
  highlight: string | null;
  /** A row is edited in place by its form, or on its own page at editHref. */
  form?: (rowId: string, done: () => void) => ReactNode;
  editHref?: (rowId: string) => string;
  newTitle: string;
  newForm: (done: () => void) => ReactNode;
  categories?: { id: string; name: string; retired?: boolean }[];
}) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const { choose, confirm } = useDialogs();
  const [editing, setEditing] = useState<string | null>(rows.some((row) => row.id === highlight) ? highlight : null);
  const [adding, setAdding] = useState(false);
  const [showRetired, setShowRetired] = useState(false);
  const [category, setCategory] = useState("");
  const shown = rows.filter(
    (row) => row.id === highlight || ((showRetired || !row.retired) && (!category || row.categoryId === category))
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {categories && (
          <NativeSelect
            size="sm"
            aria-label={t("filterCategory")}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <NativeSelectOption value="">{t("allCategories")}</NativeSelectOption>
            {categories
              .filter((c) => !c.retired || c.id === category || rows.some((row) => row.categoryId === c.id))
              .map((c) => (
                <NativeSelectOption
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </NativeSelectOption>
              ))}
          </NativeSelect>
        )}
        {rows.some((row) => row.retired) && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={showRetired}
              onCheckedChange={(checked) => setShowRetired(!!checked)}
            />{" "}
            {t("showRetired")}
          </label>
        )}
        <Button
          type="button"
          size="sm"
          className="ml-auto"
          onClick={() => setAdding(true)}
        >
          <Plus aria-hidden /> {newTitle}
        </Button>
      </div>
      <Dialog
        open={adding}
        onOpenChange={setAdding}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{newTitle}</DialogTitle>
          </DialogHeader>
          {/* The forms frame themselves for editing in a row; the dialog is frame enough */}
          <div className="[&_form]:border-0 [&_form]:bg-transparent [&_form]:p-0">
            {adding && newForm(() => setAdding(false))}
          </div>
        </DialogContent>
      </Dialog>
      <ul className="divide-border border-border bg-card max-h-[36rem] divide-y overflow-y-auto rounded-lg border text-sm">
        {shown.map((row) => (
          <li
            key={row.id}
            className={cn("space-y-2 px-3 py-2", row.id === highlight && "bg-primary/10")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("font-medium", row.retired && "text-muted-foreground line-through")}>
                {row.label}
              </span>
              {row.retired && <Badge variant="outline">{t("retired")}</Badge>}
              {row.extra}
              <span className="ml-auto inline-flex">
                {editHref ? (
                  <Link
                    href={editHref(row.id)}
                    aria-label={t("edit")}
                    title={t("edit")}
                    className={buttonVariants({ size: "icon", variant: "ghost" })}
                  >
                    <Pencil />
                  </Link>
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={t("edit")}
                    title={t("edit")}
                    onClick={() => setEditing(editing === row.id ? null : row.id)}
                  >
                    <Pencil />
                  </Button>
                )}
                {admin && kind && (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={row.retired ? t("unretire") : t("retire")}
                      title={row.retired ? t("unretire") : t("retire")}
                      disabled={pending}
                      onClick={() => save(() => retireAction(kind, row.id, !row.retired))}
                    >
                      {row.retired ? <ArchiveRestore /> : <Archive />}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={t("merge")}
                      title={t("merge")}
                      disabled={pending}
                      onClick={async () => {
                        const intoId = await choose({
                          title: t("mergeTitle", { label: row.label }),
                          items: rows
                            .filter((other) => other.id !== row.id && !other.retired)
                            .map((other) => ({ id: other.id, label: other.label })),
                        });

                        if (
                          intoId &&
                          (await confirm({
                            title: t("mergeConfirm"),
                            description: t("mergeConfirmText"),
                            confirmLabel: t("merge"),
                            destructive: true,
                          }))
                        ) {
                          void save(() => mergeAction(kind, row.id, intoId));
                        }
                      }}
                    >
                      <GitMerge />
                    </Button>
                  </>
                )}
              </span>
            </div>
            {editing === row.id && form?.(row.id, () => setEditing(null))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Buttons({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  const t = useTranslations("BaseData");

  return (
    <div className="flex gap-2">
      <Button
        type="submit"
        size="sm"
        disabled={pending}
      >
        <Save aria-hidden /> {t("save")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onCancel}
      >
        <X aria-hidden /> {t("cancel")}
      </Button>
    </div>
  );
}

const box = "space-y-3 rounded-md border border-border bg-background p-3";

function SpexCategoryForm({ category, done }: { category?: BaseData["spexCategories"][number]; done: () => void }) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({
    name: category?.name ?? "",
    firstYear: category?.firstYear ?? "",
    description: category?.description ?? "",
  });

  const form = (
    <form
      className={box}
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          await save(() =>
            saveSpexCategoryAction(
              category?.id ?? null,
              { ...values, description: values.description.trim() || null },
              undefined
            )
          )
        ) {
          done();
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <Label className="flex-col items-start">
          {t("name")}
          <Input
            required
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
          />
        </Label>
        <Label className="flex-col items-start">
          {t("firstYear")}
          <Input
            required
            type="number"
            min={1000}
            max={9999}
            step={1}
            value={values.firstYear}
            onChange={(event) => setValues({ ...values, firstYear: event.target.value })}
          />
        </Label>
      </div>
      <Label className="flex-col items-start">
        {t("description")}
        <Textarea
          rows={3}
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
        />
      </Label>
      <Buttons
        pending={pending}
        onCancel={done}
      />
    </form>
  );

  // A new category has no id to hang a logo on yet; the logo is added when editing it
  if (!category) {
    return form;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <ImageSlot
        label={t("logo")}
        kind="LOGO"
        image={category.logo}
        onChange={(logoId) =>
          save(() =>
            saveSpexCategoryAction(
              category.id,
              { name: category.name, firstYear: category.firstYear, description: category.description ?? null },
              logoId
            )
          )
        }
      />
      {form}
    </div>
  );
}

function SpexForm({
  categories,
  spex,
  done,
}: {
  categories: BaseData["spexCategories"];
  spex: BaseData["spexAll"];
  done: () => void;
}) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ year: "", title: "", categoryId: "" });
  const years = categoryYears(
    categories.find((c) => c.id === values.categoryId),
    spex
  );

  return (
    <form
      className={box}
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          await save(() =>
            saveSpexAction(null, { year: values.year, title: values.title.trim(), categoryId: values.categoryId })
          )
        ) {
          done();
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)]">
        <Label className="flex-col items-start">
          {t("category")}
          <NativeSelect
            required
            className="w-full"
            value={values.categoryId}
            onChange={(event) => setValues({ ...values, categoryId: event.target.value, year: "" })}
          >
            <NativeSelectOption
              value=""
              disabled
            >
              {t("chooseCategory")}
            </NativeSelectOption>
            {categories
              .filter((c) => !c.retired)
              .map((c) => (
                <NativeSelectOption
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </NativeSelectOption>
              ))}
          </NativeSelect>
        </Label>
        <Label className="flex-col items-start">
          {t("year")}
          <NativeSelect
            required
            className="w-full"
            value={values.year}
            disabled={!values.categoryId}
            onChange={(event) => setValues({ ...values, year: event.target.value })}
          >
            <NativeSelectOption
              value=""
              disabled
            >
              {values.categoryId && years.length === 0 ? t("noFreeYear") : t("chooseYear")}
            </NativeSelectOption>
            {years.map((year) => (
              <NativeSelectOption
                key={year}
                value={year}
              >
                {year}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Label>
        <Label className="flex-col items-start">
          {t("spexTitle")}
          <Input
            required
            value={values.title}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
          />
        </Label>
      </div>
      <p className="text-muted-foreground text-xs">{t("spexHelp")}</p>
      <Buttons
        pending={pending}
        onCancel={done}
      />
    </form>
  );
}

function TaskCategoryForm({ category, done }: { category?: BaseData["taskCategories"][number]; done: () => void }) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({
    name: category?.name ?? "",
    actorPresent: category?.actorPresent ?? false,
    instruments: category?.instruments ?? false,
  });

  return (
    <form
      className={box}
      onSubmit={async (event) => {
        event.preventDefault();
        if (await save(() => saveTaskCategoryAction(category?.id ?? null, { ...values, name: values.name.trim() }))) {
          done();
        }
      }}
    >
      <Label className="flex-col items-start">
        {t("name")}
        <Input
          required
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
      </Label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={values.actorPresent}
          onCheckedChange={(checked) => setValues({ ...values, actorPresent: !!checked })}
        />{" "}
        {t("actorPresent")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={values.instruments}
          onCheckedChange={(checked) => setValues({ ...values, instruments: !!checked })}
        />{" "}
        {t("instruments")}
      </label>
      <Buttons
        pending={pending}
        onCancel={done}
      />
    </form>
  );
}

function TaskForm({
  task,
  categories,
  done,
}: {
  task?: BaseData["tasks"][number];
  categories: BaseData["taskCategories"];
  done: () => void;
}) {
  const t = useTranslations("BaseData");
  const { save, pending } = useSave();
  const [values, setValues] = useState({
    name: task?.name ?? "",
    categoryId: task?.category?.id ?? categories[0]?.id ?? "",
    board: task?.board ?? false,
  });

  return (
    <form
      className={box}
      onSubmit={async (event) => {
        event.preventDefault();
        if (await save(() => saveTaskAction(task?.id ?? null, { ...values, name: values.name.trim() }))) {
          done();
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Label className="flex-col items-start">
          {t("name")}
          <Input
            required
            value={values.name}
            onChange={(event) => setValues({ ...values, name: event.target.value })}
          />
        </Label>
        <Label className="flex-col items-start">
          {t("category")}
          <NativeSelect
            required
            value={values.categoryId}
            onChange={(event) => setValues({ ...values, categoryId: event.target.value })}
          >
            {categories
              .filter((c) => !c.retired || c.id === values.categoryId)
              .map((c) => (
                <NativeSelectOption
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </NativeSelectOption>
              ))}
          </NativeSelect>
        </Label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={values.board}
          onCheckedChange={(checked) => setValues({ ...values, board: !!checked })}
        />{" "}
        {t("board")}
      </label>
      <Buttons
        pending={pending}
        onCancel={done}
      />
    </form>
  );
}

const SECTIONS = ["spex", "tasks", "spex-categories", "task-categories"] as const;

type Section = (typeof SECTIONS)[number];

const isSection = (value: string): value is Section => (SECTIONS as readonly string[]).includes(value);

export function BaseDataManager({
  data,
  admin,
  highlight,
  initialTab,
}: {
  data: BaseData;
  admin: boolean;
  highlight: string | null;
  initialTab?: string | null;
}) {
  const t = useTranslations("BaseData");
  // Only originals are listed; their revivals are edited on the original's page, and named here by year
  const originals = data.spexAll.filter((s) => !s.parent).sort((a, b) => b.year.localeCompare(a.year));
  const revivalsOf = (id: string) =>
    data.spexAll.filter((s) => s.parent?.id === id).sort((a, b) => a.year.localeCompare(b.year));
  const highlighted = data.spexAll.find((s) => s.id === highlight)?.parent?.id ?? highlight;
  // A highlighted record opens its own tab; otherwise the one in the address (?tab=), or the first
  const highlightedSection: Section | null = data.spexAll.some((s) => s.id === highlight)
    ? "spex"
    : data.spexCategories.some((c) => c.id === highlight)
      ? "spex-categories"
      : data.taskCategories.some((c) => c.id === highlight)
        ? "task-categories"
        : data.tasks.some((task) => task.id === highlight)
          ? "tasks"
          : null;
  const [tab, setTab] = useState<Section>(
    highlightedSection ?? (initialTab && isSection(initialTab) ? initialTab : "spex")
  );

  const counts: Record<Section, number> = {
    spex: originals.length,
    "spex-categories": data.spexCategories.length,
    "task-categories": data.taskCategories.length,
    tasks: data.tasks.length,
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value as Section);
        window.history.replaceState(null, "", `?tab=${value}`);
      }}
    >
      <TabsList variant="line">
        {SECTIONS.map((id) => (
          <TabsTrigger
            key={id}
            value={id}
          >
            {t(`sections.${id}`)} <span className="text-muted-foreground text-xs tabular-nums">{counts[id]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="spex">
        <BaseList
          kind="SPEX"
          admin={admin}
          highlight={highlighted}
          rows={originals.map((s) => {
            const revivals = revivalsOf(s.id);

            return {
              id: s.id,
              label: `${s.year} ${s.title}`,
              retired: s.retired,
              categoryId: s.category?.id,
              extra: (
                <>
                  {!s.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                  {s.category && <span className="text-muted-foreground text-xs">{s.category.name}</span>}
                  {revivals.length > 0 && (
                    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
                      <Badge variant="secondary">{t("revivals", { count: revivals.length })}</Badge>
                      {revivals.map((revival) => (
                        <Link
                          key={revival.id}
                          href={`/manage/spex/${revival.id}`}
                          className={cn(
                            "text-link hover:text-link/80",
                            revival.retired && "text-muted-foreground line-through"
                          )}
                        >
                          {revival.year}
                        </Link>
                      ))}
                    </span>
                  )}
                </>
              ),
            };
          })}
          categories={data.spexCategories}
          editHref={(id) => `/manage/spex/${id}`}
          newTitle={t("newTitles.spex")}
          newForm={(done) => (
            <SpexForm
              categories={data.spexCategories}
              spex={data.spexAll}
              done={done}
            />
          )}
        />
      </TabsContent>
      <TabsContent value="spex-categories">
        <BaseList
          kind="SPEX_CATEGORY"
          admin={admin}
          highlight={highlight}
          rows={data.spexCategories.map((c) => ({
            id: c.id,
            label: c.name,
            retired: c.retired,
            extra: <span className="text-muted-foreground text-xs">{t("since", { year: c.firstYear })}</span>,
          }))}
          form={(id, done) => (
            <SpexCategoryForm
              category={data.spexCategories.find((c) => c.id === id)}
              done={done}
            />
          )}
          newTitle={t("newTitles.spex-categories")}
          newForm={(done) => <SpexCategoryForm done={done} />}
        />
      </TabsContent>
      <TabsContent value="task-categories">
        <BaseList
          kind="TASK_CATEGORY"
          admin={admin}
          highlight={highlight}
          rows={data.taskCategories.map((c) => ({
            id: c.id,
            label: c.name,
            retired: c.retired,
            extra: (
              <>
                {c.actorPresent && <Badge variant="secondary">{t("actorPresent")}</Badge>}
                {c.instruments && <Badge variant="secondary">{t("instruments")}</Badge>}
              </>
            ),
          }))}
          form={(id, done) => (
            <TaskCategoryForm
              category={data.taskCategories.find((c) => c.id === id)}
              done={done}
            />
          )}
          newTitle={t("newTitles.task-categories")}
          newForm={(done) => <TaskCategoryForm done={done} />}
        />
      </TabsContent>
      <TabsContent value="tasks">
        <BaseList
          kind="TASK"
          admin={admin}
          highlight={highlight}
          rows={data.tasks.map((task) => ({
            id: task.id,
            label: task.name,
            retired: task.retired,
            categoryId: task.category?.id,
            extra: (
              <>
                <span className="text-muted-foreground text-xs">{task.category?.name}</span>
                {task.board && <Badge variant="secondary">{t("board")}</Badge>}
              </>
            ),
          }))}
          categories={data.taskCategories}
          form={(id, done) => (
            <TaskForm
              task={data.tasks.find((task) => task.id === id)}
              categories={data.taskCategories}
              done={done}
            />
          )}
          newTitle={t("newTitles.tasks")}
          newForm={(done) => (
            <TaskForm
              categories={data.taskCategories}
              done={done}
            />
          )}
        />
      </TabsContent>
    </Tabs>
  );
}
