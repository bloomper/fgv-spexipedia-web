"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FolderPlus, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { saveArticleCategoryAction } from "@/app/(app)/articles/actions.server";

export type CategoryOption = { id: string; name: string; parents: { id: string }[] };

type Editing = { id: string; name: string; description?: string | null; parents: { id: string }[] };

/**
 * The category and every category below it, which can never be its parents (spec 4.5: categories nest, never in a
 * circle).
 */
export function selfAndBelow(id: string, categories: CategoryOption[]): Set<string> {
  const result = new Set([id]);
  let grown = true;

  while (grown) {
    grown = false;
    for (const category of categories) {
      if (!result.has(category.id) && category.parents.some(parent => result.has(parent.id))) {
        result.add(category.id);
        grown = true;
      }
    }
  }
  return result;
}

/**
 * A button that opens a form for an article category: a new one (any member), optionally under a given parent, or
 * the given one (authors). A new category opens its page when saved.
 */
export function ArticleCategoryDialog({ category, categories, parentId, label }: {
  category?: Editing;
  categories: CategoryOption[];
  parentId?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {category ? <Pencil aria-hidden /> : <FolderPlus aria-hidden />} {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{label}</DialogTitle></DialogHeader>
          {open && <CategoryForm category={category} categories={categories} parentId={parentId} done={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryForm({ category, categories, parentId, done }: {
  category?: Editing;
  categories: CategoryOption[];
  parentId?: string;
  done: () => void;
}) {
  const t = useTranslations("Articles");
  const tb = useTranslations("BaseData");
  const router = useRouter();
  const { save, pending } = useSave();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [parentIds, setParentIds] = useState<string[]>(category ? category.parents.map(parent => parent.id) : parentId ? [parentId] : []);
  const [filter, setFilter] = useState("");
  const excluded = category ? selfAndBelow(category.id, categories) : new Set<string>();
  const needle = filter.trim().toLocaleLowerCase("sv");
  // The chosen parents stay in view while the list is filtered
  const options = categories
    .filter(option => !excluded.has(option.id))
    .filter(option => !needle || parentIds.includes(option.id) || option.name.toLocaleLowerCase("sv").includes(needle))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  return (
    <form className="space-y-3" onSubmit={async event => {
      event.preventDefault();
      await save(() => saveArticleCategoryAction(category?.id ?? null, { name: name.trim(), description: description.trim() || null, parentIds }), {
        then: saved => {
          done();
          if (!category) {
            router.push(`/articles/categories/${saved.slug}`);
          }
        },
      });
    }}>
      <Label className="flex-col items-start">{tb("name")}<Input required maxLength={255} value={name} onChange={event => setName(event.target.value)} /></Label>
      <Label className="flex-col items-start">{tb("description")}
        <Textarea rows={3} maxLength={10_000} value={description} onChange={event => setDescription(event.target.value)} />
      </Label>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("parentCategories")}</legend>
        <Input type="search" aria-label={t("filterCategories")} placeholder={t("filterCategories")} value={filter} onChange={event => setFilter(event.target.value)} />
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2 text-sm">
          {options.length === 0
            ? <p className="text-muted-foreground">{t("noCategories")}</p>
            : options.map(option => (
              <label key={option.id} className="flex items-center gap-2">
                <Checkbox checked={parentIds.includes(option.id)} onCheckedChange={checked => setParentIds(checked
                  ? [...parentIds, option.id]
                  : parentIds.filter(id => id !== option.id))} />
                {option.name}
              </label>
            ))}
        </div>
        <p className="text-xs text-muted-foreground">{t("parentCategoriesHint")}</p>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}><Save aria-hidden /> {tb("save")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={done}><X aria-hidden /> {tb("cancel")}</Button>
      </div>
    </form>
  );
}
