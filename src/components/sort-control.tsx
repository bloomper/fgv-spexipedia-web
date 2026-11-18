import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { LinkSegments } from "@/components/link-tabs";
import { type SortChoice, sortHref } from "@/utils/sorting";

type Params = Record<string, string | string[] | undefined>;

type Props<F extends string> = {
  path: string;
  params: Params;
  current: SortChoice<F>;
  fallback: SortChoice<F>;
  fields: { field: F; label: string }[];
};

/**
 * How the visitor orders a list: what to sort by, as segments, and which way, as a toggle. Both are links that put the
 * order in the address; picking another field keeps the direction.
 */
export function SortControl<F extends string>({ path, params, current, fallback, fields }: Props<F>) {
  const t = useTranslations("Sort");
  const flipped: SortChoice<F> = { field: current.field, dir: current.dir === "asc" ? "desc" : "asc" };
  const Icon = current.dir === "asc" ? ArrowUpNarrowWide : ArrowDownWideNarrow;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LinkSegments label={t("by")} items={fields.map(({ field, label }) => ({
        href: sortHref(path, params, { field, dir: current.dir }, fallback),
        label,
        active: field === current.field,
      }))} />
      <Link href={sortHref(path, params, flipped, fallback)} rel="nofollow"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            aria-label={t(current.dir === "asc" ? "switchToDesc" : "switchToAsc")}>
        <Icon className="size-4" aria-hidden />
        {t(current.dir)}
      </Link>
    </div>
  );
}
