"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { Checkbox } from "@bloomper/fgv-web-ui/ui/checkbox";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { useSave } from "@/components/wiki/editor/use-save.client";
import { useDialogs } from "@bloomper/fgv-web-ui/shell/dialogs";
import { deleteConsumerAction, deleteRedirectAction, saveConsumerAction, saveRedirectAction } from "@/app/(app)/admin/actions.server";
import { formatInstant } from "@/utils/format";

type Redirect = { id: string; oldTitle: string; target: string };

export function RedirectsEditor({ redirects }: { redirects: Redirect[] }) {
  const t = useTranslations("AdminRedirects");
  const { save, pending } = useSave();
  const { confirm } = useDialogs();
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const shown = redirects.filter(r => !filter || r.oldTitle.toLowerCase().includes(filter.toLowerCase()) || r.target.includes(filter));

  return (
    <div className="max-w-4xl space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" type="search" placeholder={t("filter")} aria-label={t("filter")} value={filter} onChange={event => setFilter(event.target.value)} />
        <Button type="button" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("add")}</Button>
      </div>
      {editing === "new" && <RedirectForm onDone={() => setEditing(null)} />}
      <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
        {shown.map(redirect => (
          <li key={redirect.id} className="space-y-2 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{redirect.oldTitle}</span>
              <span className="text-muted-foreground">→ <a href={redirect.target} className="text-link hover:text-link/80">{redirect.target}</a></span>
              <span className="ml-auto inline-flex">
                <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === redirect.id ? null : redirect.id)}><Pencil /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("delete")} disabled={pending} onClick={async () => {
                  if (await confirm({ title: t("deleteTitle", { title: redirect.oldTitle }), confirmLabel: t("delete"), destructive: true })) {
                    void save(() => deleteRedirectAction(redirect.id));
                  }
                }}><Trash2 /></Button>
              </span>
            </div>
            {editing === redirect.id && <RedirectForm redirect={redirect} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RedirectForm({ redirect, onDone }: { redirect?: Redirect; onDone: () => void }) {
  const t = useTranslations("AdminRedirects");
  const { save, pending } = useSave();
  const [oldTitle, setOldTitle] = useState(redirect?.oldTitle ?? "");
  const [target, setTarget] = useState(redirect?.target ?? "/");

  return (
    <form className="flex flex-wrap items-end gap-2 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveRedirectAction({ id: redirect?.id ?? null, oldTitle: oldTitle.trim(), target: target.trim() }))) {
        onDone();
      }
    }}>
      <Label className="flex-1 flex-col items-start">{t("oldTitle")}<Input required value={oldTitle} onChange={event => setOldTitle(event.target.value)} /></Label>
      <Label className="flex-1 flex-col items-start">{t("target")}<Input required pattern="/.*" value={target} onChange={event => setTarget(event.target.value)} /></Label>
      <Button type="submit" size="sm" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
      <Button type="button" size="sm" variant="ghost" onClick={onDone}><X aria-hidden /></Button>
    </form>
  );
}

type Consumer = {
  id: string; name: string; clientId: string; notifyUrl?: string | null; enabled: boolean;
  acknowledged?: string | null; acknowledgedAt?: string | null; lag: number; lastNotifiedAt?: string | null; lastError?: string | null;
};

export function ConsumersEditor({ consumers }: { consumers: Consumer[] }) {
  const t = useTranslations("AdminConsumers");
  const { save, pending } = useSave();
  const { confirm } = useDialogs();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="max-w-5xl space-y-3">
      <Button type="button" variant="outline" onClick={() => setEditing("new")}><Plus aria-hidden /> {t("add")}</Button>
      {editing === "new" && <ConsumerForm onDone={() => setEditing(null)} />}
      <ul className="space-y-3">
        {consumers.map(consumer => (
          <li key={consumer.id} className="space-y-2 rounded-lg border border-border bg-card p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{consumer.name}</span>
              <code className="text-xs text-muted-foreground">{consumer.clientId}</code>
              {!consumer.enabled && <Badge variant="outline">{t("disabled")}</Badge>}
              {consumer.lag > 0 ? <Badge variant="secondary">{t("lag", { count: consumer.lag })}</Badge> : <Badge variant="secondary">{t("upToDate")}</Badge>}
              <span className="ml-auto inline-flex">
                <Button type="button" size="icon" variant="ghost" aria-label={t("edit")} onClick={() => setEditing(editing === consumer.id ? null : consumer.id)}><Pencil /></Button>
                <Button type="button" size="icon" variant="ghost" aria-label={t("delete")} disabled={pending} onClick={async () => {
                  if (await confirm({ title: t("deleteTitle", { name: consumer.name }), confirmLabel: t("delete"), destructive: true })) {
                    void save(() => deleteConsumerAction(consumer.id));
                  }
                }}><Trash2 /></Button>
              </span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs">
              <dt className="text-muted-foreground">{t("notifyUrl")}</dt><dd>{consumer.notifyUrl ?? t("pullsOnly")}</dd>
              <dt className="text-muted-foreground">{t("acknowledged")}</dt><dd>{consumer.acknowledged ?? "–"} {consumer.acknowledgedAt && `(${formatInstant(consumer.acknowledgedAt)})`}</dd>
              <dt className="text-muted-foreground">{t("lastNotified")}</dt><dd>{formatInstant(consumer.lastNotifiedAt) ?? "–"}</dd>
              {consumer.lastError && <><dt className="text-muted-foreground">{t("lastError")}</dt><dd className="text-destructive">{consumer.lastError}</dd></>}
            </dl>
            {editing === consumer.id && <ConsumerForm consumer={consumer} onDone={() => setEditing(null)} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConsumerForm({ consumer, onDone }: { consumer?: Consumer; onDone: () => void }) {
  const t = useTranslations("AdminConsumers");
  const { save, pending } = useSave();
  const [values, setValues] = useState({ name: consumer?.name ?? "", clientId: consumer?.clientId ?? "", notifyUrl: consumer?.notifyUrl ?? "", enabled: consumer?.enabled ?? true });

  return (
    <form className="space-y-3 rounded-md border border-border p-3" onSubmit={async event => {
      event.preventDefault();
      if (await save(() => saveConsumerAction({ id: consumer?.id ?? null, name: values.name.trim(), clientId: values.clientId.trim(), notifyUrl: values.notifyUrl.trim() || null, enabled: values.enabled }))) {
        onDone();
      }
    }}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Label className="flex-col items-start">{t("name")}<Input required value={values.name} onChange={event => setValues({ ...values, name: event.target.value })} /></Label>
        <Label className="flex-col items-start">{t("clientId")}<Input required value={values.clientId} onChange={event => setValues({ ...values, clientId: event.target.value })} placeholder="fgv-spexregister-service" /></Label>
        <Label className="flex-col items-start">{t("notifyUrl")}<Input type="url" value={values.notifyUrl} onChange={event => setValues({ ...values, notifyUrl: event.target.value })} placeholder="http://spexregister-api:8080/api/sync/notify" /></Label>
      </div>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={values.enabled} onCheckedChange={checked => setValues({ ...values, enabled: !!checked })} /> {t("enabled")}</label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}><Save aria-hidden /> {t("save")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}><X aria-hidden /> {t("cancel")}</Button>
      </div>
    </form>
  );
}
