"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { Checkbox } from "@bloomper/fgv-web-ui/ui/checkbox";
import { MarkdownEditor } from "@/components/wiki/editor/markdown-editor.client";
import { DiffView } from "@/components/wiki/diff-view";
import { editingAction, latestArticleAction, saveArticleAction } from "@/app/(app)/articles/actions.server";
import type { Visibility } from "@/gql/graphql";

const EDITING_INTERVAL_MS = 60_000;

export type ArticleFormValues = {
  title: string;
  body: string;
  visibility: Visibility;
  categoryIds: string[];
};

/**
 * Writes an article: title, visibility, categories and the Markdown body, with a comment for the history. While it is
 * open it tells the server the user is editing and shows who else is. Saving over someone else's newer revision is
 * refused; the user then sees the differences and either keeps their text (saving over the newer one) or takes it.
 */
export function ArticleForm({
  id,
  initial,
  revisionId,
  categories,
  parentId = null,
}: {
  id: string | null;
  /** For a new article: its parent in the tree; existing ones are moved instead. */
  parentId?: string | null;
  initial: ArticleFormValues;
  revisionId: string | null;
  categories: { id: string; name: string }[];
}) {
  const t = useTranslations("ArticleForm");
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [comment, setComment] = useState("");
  const [base, setBase] = useState(revisionId);
  const [others, setOthers] = useState<string[]>([]);
  const [conflict, setConflict] = useState<{ body: string; revisionId: string | null } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!id) {
      return;
    }
    const tell = () =>
      editingAction(id)
        .then((result) => result.ok && setOthers(result.data))
        .catch(() => undefined);

    void tell();
    const timer = setInterval(tell, EDITING_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [id]);

  const save = (baseRevisionId: string | null) =>
    startTransition(async () => {
      const result = await saveArticleAction(
        id,
        { ...values, comment: comment.trim() || null, ...(id ? {} : { parentId }) },
        baseRevisionId
      );

      if (result.ok) {
        toast.success(t("saved"));
        router.push(`/articles/${result.data.slug}`);
      } else if (result.code === "CONFLICT" && id) {
        const latest = await latestArticleAction(id);

        if (latest.ok) {
          setConflict(latest.data);
        }
        toast.error(result.message);
      } else {
        toast.error(result.message);
      }
    });

  return (
    <form
      className="max-w-4xl space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        save(base);
      }}
    >
      {others.length > 0 && (
        <p
          role="status"
          className="border-primary/40 bg-primary/10 flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
        >
          <Users
            className="size-4"
            aria-hidden
          />{" "}
          {t("othersEditing", { names: others.join(", ") })}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="title">{t("title")}</Label>
        <Input
          id="title"
          required
          maxLength={255}
          value={values.title}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("visibility")}</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {(["PUBLIC", "MEMBERS"] as const).map((visibility) => (
            <label
              key={visibility}
              className="flex items-center gap-2"
            >
              <input
                type="radio"
                name="visibility"
                value={visibility}
                checked={values.visibility === visibility}
                onChange={() => setValues({ ...values, visibility })}
                className="accent-primary"
              />
              {t(`visibilities.${visibility}`)}
            </label>
          ))}
        </div>
      </fieldset>
      {categories.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("categories")}</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2"
              >
                <Checkbox
                  checked={values.categoryIds.includes(category.id)}
                  onCheckedChange={(checked) =>
                    setValues({
                      ...values,
                      categoryIds: checked
                        ? [...values.categoryIds, category.id]
                        : values.categoryIds.filter((c) => c !== category.id),
                    })
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <MarkdownEditor
        id="body"
        label={t("body")}
        value={values.body}
        onChange={(body) => setValues({ ...values, body })}
        rows={22}
      />
      {conflict && (
        <div className="border-destructive/50 space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">{t("conflict")}</p>
          <DiffView
            before={conflict.body}
            after={values.body}
            labels={{ removed: t("theirs"), added: t("mine") }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValues({ ...values, body: conflict.body });
                setBase(conflict.revisionId);
                setConflict(null);
              }}
            >
              {t("takeTheirs")}
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                setBase(conflict.revisionId);
                setConflict(null);
                save(conflict.revisionId);
              }}
            >
              {t("keepMine")}
            </Button>
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="comment">{t("comment")}</Label>
        <Input
          id="comment"
          maxLength={255}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t("commentPlaceholder")}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending || !values.title.trim()}
        >
          {t("save")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
