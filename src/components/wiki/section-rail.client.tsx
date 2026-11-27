"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/utils";

type Section = { id: string; title: string };

/**
 * The section being read: the topmost one in the upper part of the viewport, as the page scrolls. The last sections
 * are often too short to reach that far, so at the bottom of the page the last one is active, and a section picked in
 * the rail or bar is active at once (the page may not be able to scroll it to the top).
 */
function useActiveSection(sections: Section[]): [string | undefined, (id: string) => void] {
  const [active, setActive] = useState(sections[0]?.id);
  const pickedAt = useRef(0);

  useEffect(() => {
    const elements = sections.map(section => document.getElementById(section.id)).filter((e): e is HTMLElement => !!e);
    const picking = () => Date.now() - pickedAt.current < 1000;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0] && !picking()) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: "-112px 0px -60% 0px" });
    const onScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const last = elements.at(-1);

      if (atBottom && last && !picking()) {
        setActive(last.id);
      }
    };

    elements.forEach(element => observer.observe(element));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  const pick = (id: string) => {
    pickedAt.current = Date.now();
    setActive(id);
  };

  return [active, pick];
}

/**
 * The rail beside a spex page on wide screens: a link to each section that is shown, the one being read highlighted as
 * the page scrolls.
 */
export function SectionRail({ sections, label }: { sections: Section[]; label: string }) {
  const [active, pick] = useActiveSection(sections);

  return (
    <nav aria-label={label} className="sticky top-20 hidden max-h-[calc(100svh-6rem)] overflow-y-auto xl:block">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <ul className="space-y-1 border-l border-border">
        {sections.map(section => (
          <li key={section.id}>
            <a href={`#${section.id}`} onClick={() => pick(section.id)} aria-current={active === section.id ? "location" : undefined}
               className={cn("-ml-px block border-l-2 py-1 pl-3 text-sm transition-colors",
                 active === section.id ? "border-primary text-link" : "border-transparent text-muted-foreground hover:text-foreground")}>
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
  const [active, pick] = useActiveSection(sections);
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
            <a href={`#${section.id}`} onClick={() => pick(section.id)} data-section-link={section.id} aria-current={active === section.id ? "location" : undefined}
               className={cn("flex min-h-9 items-center rounded-full border px-3 text-sm whitespace-nowrap transition-colors",
                 active === section.id ? "border-primary text-link" : "border-border text-muted-foreground hover:text-foreground")}>
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
