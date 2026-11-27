"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { Input } from "@bloomper/fgv-web-ui/ui/input";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { Textarea } from "@bloomper/fgv-web-ui/ui/textarea";
import type { SettingsInput } from "@/gql/graphql";
import { useServerState } from "@/hooks/use-server-state.client";
import { saveSettingsAction } from "../actions.server";

/**
 * The settings: the start page's texts for members and visitors, and the contact address shown to visitors.
 */
export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const t = useTranslations("AdminSettings");
  const [values, setValues] = useServerState(initial, (value) => JSON.stringify(value));
  const [pending, startTransition] = useTransition();
  const text = (field: "welcomeSv" | "welcomeEn" | "publicWelcomeSv" | "publicWelcomeEn") => (
    <div className="space-y-1.5">
      <Label htmlFor={field}>{t(field)}</Label>
      <Textarea
        id={field}
        rows={3}
        value={values[field] ?? ""}
        onChange={(event) => setValues({ ...values, [field]: event.target.value })}
      />
    </div>
  );

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveSettingsAction({
            ...values,
            contactEmail: values.contactEmail?.trim() || null,
          });

          if (result.ok) {
            toast.success(t("saved"));
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">{t("startPage")}</legend>
        {text("welcomeSv")}
        {text("welcomeEn")}
        {text("publicWelcomeSv")}
        {text("publicWelcomeEn")}
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
          <Input
            id="contactEmail"
            type="email"
            value={values.contactEmail ?? ""}
            onChange={(event) => setValues({ ...values, contactEmail: event.target.value })}
          />
        </div>
      </fieldset>
      <Button
        type="submit"
        disabled={pending}
      >
        {t("save")}
      </Button>
    </form>
  );
}
