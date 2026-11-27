"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { ExternalLink, ImageOff, Lock, Play } from "lucide-react";
import { cn } from "@/utils/utils";

export type PhotoData = {
  itemId: string;
  caption?: string | null;
  thumbnailUrl: string;
  previewUrl: string;
  width?: number | null;
  height?: number | null;
  url: string;
  public: boolean;
  video: boolean;
  videoUrl?: string | null;
};

export type PhotoSetData = { photos: PhotoData[]; hiddenCount: number; available: boolean };

/**
 * Photos and short films of people, from Spexgram: public ones for everyone, members' ones for those with access
 * there. Others see how many they may not, and nothing when Spexgram cannot be reached but that it could not.
 */
export function PhotoSet({ set, member, className }: { set: PhotoSetData; member: boolean; className?: string }) {
  const t = useTranslations("Photos");
  const [index, setIndex] = useState(-1);

  if (!set.available) {
    return (
      <p className="text-muted-foreground text-sm">
        <ImageOff
          className="mr-1 inline size-4"
          aria-hidden
        />
        {t("unavailable")}
      </p>
    );
  }
  if (set.photos.length === 0 && set.hiddenCount === 0) {
    return null;
  }
  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {set.photos.map((photo, i) => (
          <button
            key={photo.itemId}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={photo.caption ?? t("open")}
            className="border-border bg-muted focus-visible:ring-ring relative block overflow-hidden rounded-md border focus-visible:ring-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnailUrl}
              alt={photo.caption ?? ""}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            {photo.video && (
              <Play
                className="bg-background/80 absolute right-2 bottom-2 size-6 rounded-full p-1"
                aria-hidden
              />
            )}
          </button>
        ))}
        {set.hiddenCount > 0 && (
          <div className="border-border text-muted-foreground flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-md border border-dashed p-3 text-center text-xs">
            <Lock
              className="size-5"
              aria-hidden
            />
            {member ? t("hiddenMember", { count: set.hiddenCount }) : t("hiddenVisitor", { count: set.hiddenCount })}
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{t("from")}</p>
      <Lightbox
        open={index >= 0}
        index={Math.max(index, 0)}
        close={() => setIndex(-1)}
        plugins={[Captions, Video]}
        render={{
          buttonPrev: set.photos.length <= 1 ? () => null : undefined,
          buttonNext: set.photos.length <= 1 ? () => null : undefined,
        }}
        toolbar={{
          buttons: [
            <a
              key="spexgram"
              href={set.photos[Math.max(index, 0)]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="yarl__button"
              aria-label={t("openInSpexgram")}
              title={t("openInSpexgram")}
            >
              <ExternalLink className="size-6" />
            </a>,
            "close",
          ],
        }}
        slides={set.photos.map((photo) =>
          photo.video && photo.videoUrl
            ? {
                type: "video" as const,
                poster: photo.previewUrl,
                width: photo.width ?? 1280,
                height: photo.height ?? 720,
                sources: [{ src: photo.videoUrl, type: "video/mp4" }],
                description: photo.caption ?? undefined,
              }
            : {
                src: photo.previewUrl,
                width: photo.width ?? undefined,
                height: photo.height ?? undefined,
                alt: photo.caption ?? "",
                description: photo.caption ?? undefined,
              }
        )}
      />
    </div>
  );
}
