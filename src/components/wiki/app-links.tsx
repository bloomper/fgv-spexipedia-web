import { useTranslations } from "next-intl";
import { BookUser, Clapperboard, ExternalLink, FileText, Images, Library, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/utils";

export type AppLinkData = { kind: string; title: string; url: string; detail?: string | null };

const ICONS: Record<string, LucideIcon> = {
  SPEXREGISTER: BookUser,
  SPEXIFY_ALBUM: Music,
  SPEXIFY_TRACK: Music,
  SPEXFLIX_VIDEO: Clapperboard,
  ARCHIVE_MANUSCRIPT: Library,
  ARCHIVE_ARRANGEMENT: Library,
  SPEXGRAM_ALBUM: Images,
  SPEXFLIX_CHAPTER: Clapperboard,
  ARCHIVE_DOCUMENT: FileText,
  SPEXIFY_SPEX: Music,
  SPEXFLIX_SPEX: Clapperboard,
  SPEXGRAM_SPEX: Images,
  ARCHIVE_SPEX: Library,
};

/** A link to everything an application has about the spex: its title is the application's, not the material's. */
export const isSpexPageLink = (link: AppLinkData) => link.kind.endsWith("_SPEX");

/**
 * Links into the other FGV applications, as the server lists them for the viewer: only those the viewer can open,
 * except Spexgram's public albums, which are for everyone.
 */
export function AppLinks({ links, compact = false }: { links: AppLinkData[]; compact?: boolean }) {
  const t = useTranslations("AppLinks");

  if (links.length === 0) {
    return null;
  }
  return (
    <ul className={cn("flex flex-wrap gap-2", compact && "gap-1")}>
      {links.map(link => {
        const Icon = ICONS[link.kind] ?? ExternalLink;
        // A chapter is named with its video, a document with its kind
        const title = link.detail ? (link.kind === "ARCHIVE_DOCUMENT" ? `${link.detail}: ${link.title}` : `${link.title} (${link.detail})`) : link.title;
        const label = isSpexPageLink(link) ? t(link.kind) : `${t(link.kind)}: ${title}`;

        return (
          <li key={`${link.kind}-${link.url}`}>
            <a href={link.url} target="_blank" rel="noopener noreferrer" title={label}
               className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-card text-xs hover:border-primary hover:text-link",
                 compact ? "px-2 py-0.5" : "px-3 py-1.5 text-sm")}>
              <Icon className="size-3.5" aria-hidden />
              {compact || isSpexPageLink(link) ? t(link.kind) : <><span className="text-muted-foreground">{t(link.kind)}:</span> {title}</>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
