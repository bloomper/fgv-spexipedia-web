"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { HtmlContent } from "@/components/wiki/html-content";
import { appRefAction, previewAction } from "@/app/(app)/articles/actions.server";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/dialogs.client";
import { appRefMarkdown } from "@/utils/app-refs";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

/**
 * Markdown with a preview: CommonMark with tables, `[[Title]]` links to articles, and links to material in the other
 * FGV applications, made from an address pasted from there. The preview is rendered by the server, as the page will be.
 */
export function MarkdownEditor({ id, value, onChange, rows = 16, label }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  label: string;
}) {
  const t = useTranslations("Editor");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { prompt } = useDialogs();

  const insertAppLink = async (textarea: HTMLTextAreaElement | null) => {
    const address = await prompt({ title: t("appLink"), label: t("appLinkAddress"), confirmLabel: t("appLinkNext"), maxLength: 2000 });

    if (!address) {
      return;
    }

    const result = await appRefAction(address);

    if (!result.ok) {
      toast.error(t("appLinkUnknown"));
      return;
    }

    const text = await prompt({ title: t("appLink"), label: t("appLinkText"), confirmLabel: t("appLinkInsert"), maxLength: 200 });

    if (text === null) {
      return;
    }

    const link = appRefMarkdown(result.data, text);
    const at = textarea?.selectionStart ?? value.length;

    onChange(value.slice(0, at) + link + value.slice(textarea?.selectionEnd ?? at));
  };
  const tab = (value_: "write" | "preview") => (
    <button type="button" role="tab" aria-selected={mode === value_} onClick={() => {
      setMode(value_);
      if (value_ === "preview") {
        startTransition(async () => {
          const result = await previewAction(value);

          setHtml(result.ok ? result.data : `<p>${t("previewFailed")}</p>`);
        });
      }
    }} className={cn("rounded px-2.5 py-1 text-xs", mode === value_ ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {t(value_)}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <div role="tablist" className="flex gap-1 rounded-md bg-muted p-0.5">{tab("write")}{tab("preview")}</div>
      </div>
      {mode === "write" ? (
        <>
          <Textarea id={id} rows={rows} value={value} onChange={event => onChange(event.target.value)} className="font-mono text-sm" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t("help")}</p>
            <Button type="button" variant="outline" size="sm"
                    onClick={() => void insertAppLink(document.getElementById(id) as HTMLTextAreaElement | null)}>
              <Link2 />{t("appLink")}
            </Button>
          </div>
        </>
      ) : (
        <div role="tabpanel" className="min-h-40 rounded-md border border-border p-4">
          {pending ? <Spinner /> : <HtmlContent html={html} />}
        </div>
      )}
    </div>
  );
}
