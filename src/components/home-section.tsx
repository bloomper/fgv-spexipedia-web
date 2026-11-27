import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/utils/utils";

/**
 * A row of the start page: a heading, a link to everything of its kind, and its content.
 */
export function HomeSection({ id, title, more, className, children }: {
  id: string;
  className?: string;
  title: string;
  more?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)} aria-labelledby={id}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id={id} className="wiki-heading text-xl font-semibold">{title}</h2>
        {more && <Link href={more.href} className="text-sm text-link hover:text-link/80">{more.label}</Link>}
      </div>
      {children}
    </section>
  );
}
