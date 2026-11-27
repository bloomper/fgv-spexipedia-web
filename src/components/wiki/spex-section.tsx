import type { ReactNode } from "react";

/**
 * A section of a spex page: an anchor for the rail, a serif heading with a subtitle, and its content.
 */
export function SpexSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      data-section
      className="border-border/60 scroll-mt-28 space-y-4 border-t pt-8 xl:scroll-mt-20"
    >
      <header className="space-y-1">
        <h2
          id={`${id}-heading`}
          className="wiki-heading text-foreground text-2xl font-semibold"
        >
          {title}
        </h2>
        {subtitle && <p className="text-link text-sm tracking-[0.18em] uppercase">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
