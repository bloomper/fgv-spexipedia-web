"use client";

import { type ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { Drama, Lock } from "lucide-react";
import { CompareSlider } from "@/components/wiki/compare-slider.client";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import type { PhotoData } from "@/components/wiki/photo-set.client";
import { cn } from "@/utils/utils";

/** The photos of the actors, as a view beside the image kinds. */
export const PHOTOS_VIEW = "photos";

export type RoleView = { key: string; label: string };

/** A picture of a role: one of Spexipedia's own images, or a photo from Spexgram. */
export type RoleArt = { view: string; caption?: string | null; image?: WikiImageData; photo?: PhotoData };

export type RoleCardData = {
  id: string;
  /** Its pictures, in the order of the views. */
  arts: RoleArt[];
  /** Members' photos the viewer may not see. */
  hiddenPhotos: number;
  /** The name, who played it and the description, rendered on the server. */
  body: ReactNode;
};

const SIZES = "(min-width: 1280px) 16rem, (min-width: 640px) 33vw, 50vw";

function Art({ art, className }: { art: RoleArt; className?: string }) {
  if (art.image) {
    return <WikiImage image={art.image} sizes={SIZES} className={cn("object-cover", className)} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={art.photo!.previewUrl} alt={art.caption ?? ""} loading="lazy" className={cn("object-cover", className)} />;
}

/**
 * A spex's roles as on the Apps Script pages: a grid of cards, each with one picture over its name, who played it and
 * its description. The views (image kinds, and the actors' photos for those who may see them) switch every card at
 * once, and two views can be compared with a slider. A card's picture opens all of its pictures full screen.
 */
export function RoleGrid({ views, cards }: { views: RoleView[]; cards: RoleCardData[] }) {
  const t = useTranslations("SpexPage");
  const [active, setActive] = useState(views[0]?.key);
  const [comparing, setComparing] = useState(false);
  const [against, setAgainst] = useState<string | undefined>(views[1]?.key);
  const [open, setOpen] = useState<{ card: RoleCardData; index: number } | null>(null);
  const label = (key?: string) => views.find(view => view.key === key)?.label ?? "";
  // Cards line up when some roles have pictures: the others get an empty frame
  const framed = cards.some(card => card.arts.length > 0);

  const pick = (key: string) => {
    setActive(key);
    if (key === against) {
      setAgainst(views.find(view => view.key !== key)?.key);
    }
  };

  return (
    <div className="space-y-4">
      {views.length > 1 && (
        <div role="toolbar" aria-label={t("roleViews")} className="flex flex-wrap items-center gap-2">
          {views.map(view => (
            <button key={view.key} type="button" aria-pressed={active === view.key} onClick={() => pick(view.key)}
                    className={cn("rounded-full border px-3 py-1 text-sm transition-colors",
                      active === view.key ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
              {view.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <button type="button" aria-pressed={comparing} onClick={() => setComparing(!comparing)}
                  className={cn("rounded-full border px-3 py-1 text-sm transition-colors",
                    comparing ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
            {t("compare")}
          </button>
          {comparing && views.filter(view => view.key !== active).map(view => (
            <button key={view.key} type="button" aria-pressed={against === view.key} onClick={() => setAgainst(view.key)}
                    className={cn("rounded-full border px-3 py-1 text-sm transition-colors",
                      against === view.key ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground")}>
              ↔ {view.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,13rem),1fr))] gap-4">
        {cards.map(card => {
          const front = card.arts.find(art => art.view === active);
          const back = card.arts.find(art => art.view === against);

          return (
            <article key={card.id} id={`character-${card.id}`}
                     className="flex scroll-mt-28 flex-col overflow-hidden rounded-lg border border-border bg-card xl:scroll-mt-20">
              {framed && card.arts.length === 0 && (
                <div className="flex aspect-[2/3] items-center justify-center bg-muted/50">
                  <Drama className="size-12 text-muted-foreground/25" aria-hidden />
                </div>
              )}
              {card.arts.length > 0 && (
                comparing && front && back ? (
                  <CompareSlider
                    className="aspect-[2/3]"
                    label={t("compareSlider", { front: label(active), back: label(against) })}
                    front={<Art art={front} />}
                    back={<Art art={back} />}
                  />
                ) : front ? (
                  <button type="button" onClick={() => setOpen({ card, index: card.arts.indexOf(front) })}
                          aria-label={t("openPictures")}
                          className="block aspect-[2/3] w-full overflow-hidden bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
                    <Art art={front} className="size-full transition-transform hover:scale-[1.02]" />
                  </button>
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-muted p-3 text-center text-xs text-muted-foreground">
                    {t("noPicture", { view: label(active) })}
                  </div>
                )
              )}
              <div className="flex-1 space-y-2 p-3">
                {card.body}
                {card.hiddenPhotos > 0 && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="size-3.5" aria-hidden /> {t("hiddenPhotos", { count: card.hiddenPhotos })}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <Lightbox
        open={open !== null}
        index={open?.index ?? 0}
        close={() => setOpen(null)}
        plugins={[Captions, Zoom]}
        render={{
          buttonPrev: (open?.card.arts.length ?? 0) <= 1 ? () => null : undefined,
          buttonNext: (open?.card.arts.length ?? 0) <= 1 ? () => null : undefined,
        }}
        slides={(open?.card.arts ?? []).map(art => art.image
          ? { src: art.image.pageUrl, width: art.image.width, height: art.image.height, alt: art.image.alt, description: art.caption ?? label(art.view),
              srcSet: [{ src: art.image.pageUrl, width: 1280, height: Math.round(1280 * art.image.height / art.image.width) },
                       { src: art.image.fullUrl, width: 2560, height: Math.round(2560 * art.image.height / art.image.width) }] }
          : { src: art.photo!.previewUrl, width: art.photo!.width ?? undefined, height: art.photo!.height ?? undefined,
              alt: art.caption ?? "", description: art.caption ?? label(art.view) })}
      />
    </div>
  );
}
