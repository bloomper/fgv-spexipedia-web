import type { ReactNode } from "react";

/**
 * A section of a spex page: an anchor for the rail, a serif heading with a subtitle, and its content.
 */
export function SpexSection({ id, title, subtitle, children }: {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} data-section className="scroll-mt-20 space-y-4 border-t border-border/60 pt-8">
      <header className="space-y-1">
        <h2 id={`${id}-heading`} className="wiki-heading text-3xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm uppercase tracking-[0.18em] text-primary">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
