"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/utils";

type Section = { id: string; title: string };

/**
 * The section being read: the topmost one in the upper part of the viewport, as the page scrolls.
 */
function useActiveSection(sections: Section[]): string | undefined {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections.map(section => document.getElementById(section.id)).filter((e): e is HTMLElement => !!e);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0]) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: "-112px 0px -60% 0px" });

    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return active;
}

/**
 * The rail beside a spex page on wide screens: a link to each section that is shown, the one being read highlighted as
 * the page scrolls.
 */
export function SectionRail({ sections, label }: { sections: Section[]; label: string }) {
  const active = useActiveSection(sections);

  return (
    <nav aria-label={label} className="sticky top-20 hidden max-h-[calc(100svh-6rem)] overflow-y-auto xl:block">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <ul className="space-y-1 border-l border-border">
        {sections.map(section => (
          <li key={section.id}>
            <a href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined}
               className={cn("-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors",
                 active === section.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The same links on phones and tablets, where the rail has no room: a bar that stays under the header and scrolls
 * sideways, keeping the section being read in view.
 */
export function SectionBar({ sections, label }: { sections: Section[]; label: string }) {
  const active = useActiveSection(sections);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = list.current;
    const link = container?.querySelector<HTMLElement>(`[data-section-link="${active}"]`);

    if (container && link) {
      // Scrolls the bar only, never the page
      container.scrollTo({ left: link.offsetLeft - (container.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [active]);

  if (sections.length < 2) {
    return null;
  }
  return (
    <nav aria-label={label}
         className="sticky top-(--header-height) z-40 -mx-4 border-b border-border/60 bg-background/95 backdrop-blur md:-mx-8 xl:hidden print:hidden">
      <ul ref={list} className="flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-8">
        {sections.map(section => (
          <li key={section.id} className="shrink-0">
            <a href={`#${section.id}`} data-section-link={section.id} aria-current={active === section.id ? "location" : undefined}
               className={cn("flex min-h-9 items-center rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
                 active === section.id ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
