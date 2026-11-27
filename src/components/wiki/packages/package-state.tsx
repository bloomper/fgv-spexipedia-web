import { useTranslations } from "next-intl";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import type { SpexPackageState } from "@/gql/graphql";
import { cn } from "@/utils/utils";

const TONES: Record<SpexPackageState, string> = {
  UPLOADED: "",
  PREVIEWING: "border-sky-500/60 text-sky-600 dark:text-sky-400",
  PREVIEWED: "border-sky-500/60 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  APPLYING: "border-emerald-500/60 text-emerald-600 dark:text-emerald-400",
  APPLIED: "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  FAILED: "border-destructive/60 text-destructive",
};

/** A spex package's state (spec 5.14). */
export function StateChip({ state }: { state: SpexPackageState }) {
  const t = useTranslations("Packages.states");

  return (
    <Badge
      variant="outline"
      className={cn(TONES[state])}
    >
      {t(state)}
    </Badge>
  );
}
