"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/utils";

/**
 * The rail beside a spex page: a link to each section that is shown, the one being read highlighted as the page
 * scrolls.
 */
export function SectionRail({ sections, label }: { sections: { id: string; title: string }[]; label: string }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const elements = sections.map(section => document.getElementById(section.id)).filter((e): e is HTMLElement => !!e);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0]) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: "-80px 0px -60% 0px" });

    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

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
