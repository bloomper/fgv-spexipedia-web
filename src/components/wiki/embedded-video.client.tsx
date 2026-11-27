"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type Hls from "hls.js";
import { ExternalLink } from "lucide-react";

export type EmbeddedVideoData = {
  id: string;
  title: string;
  url?: string | null;
  posterUrl?: string | null;
  startSeconds?: number | null;
  chapters: { title: string; startSeconds: number }[];
  playback?: { masterUrl: string; subtitles: { language: string; label: string; url: string }[] } | null;
};

/**
 * A Spexflix video in a section of a spex page (spec 4.2.1), played from Spexflix's media hostname with the signed
 * addresses Spexipedia's server got for the viewer: natively where the browser plays HLS (Safari), else with hls.js,
 * loaded only when a page has a video. It starts where the author chose, and its chapters seek. Plays here are not
 * counted in Spexflix.
 */
export function EmbeddedVideo({ video }: { video: EmbeddedVideoData }) {
  const t = useTranslations("SpexPage");
  const element = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const masterUrl = video.playback?.masterUrl;
  const start = video.startSeconds ?? 0;

  useEffect(() => {
    const media = element.current;

    if (!media || !masterUrl) {
      return;
    }

    let cancelled = false;
    let hls: Hls | null = null;
    const seek = () => {
      if (start > 0) {
        media.currentTime = start;
      }
    };
    const fail = () => setFailed(true);
    const playNatively = () => {
      media.addEventListener("error", fail);
      media.addEventListener("loadedmetadata", seek, { once: true });
      media.src = masterUrl;
    };

    setFailed(false);
    if (media.canPlayType("application/vnd.apple.mpegurl")) {
      playNatively();
    } else {
      void import("hls.js").then(({ default: HlsClass }) => {
        if (cancelled) {
          return;
        }
        if (!HlsClass.isSupported()) {
          playNatively();
          return;
        }

        const instance = new HlsClass({ startPosition: start > 0 ? start : -1 });

        instance.on(HlsClass.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            instance.destroy();
            fail();
          }
        });
        instance.loadSource(masterUrl);
        instance.attachMedia(media);
        hls = instance;
      });
    }
    return () => {
      cancelled = true;
      media.removeEventListener("error", fail);
      media.removeEventListener("loadedmetadata", seek);
      hls?.destroy();
    };
  }, [masterUrl, start]);

  const jump = (seconds: number) => {
    if (element.current) {
      element.current.currentTime = seconds;
      void element.current.play().catch(() => undefined);
    }
  };

  return (
    <figure className="space-y-3">
      <div className="border-border overflow-hidden rounded-lg border bg-black">
        {/* Subtitles come from Spexflix's media hostname, which allows Spexipedia's web (CORS) */}
        <video
          ref={element}
          controls
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          poster={video.posterUrl ?? undefined}
          className="aspect-video w-full"
          aria-label={video.title}
          controlsList="nodownload"
        >
          {video.playback?.subtitles.map((subtitle) => (
            <track
              key={subtitle.language}
              kind="subtitles"
              src={subtitle.url}
              srcLang={subtitle.language}
              label={subtitle.label}
            />
          ))}
        </video>
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold">{video.title}</span>
        {video.url && (
          <a
            href={video.url}
            className="text-link hover:text-link/80 inline-flex items-center gap-1"
          >
            {t("embeds.openVideo")}{" "}
            <ExternalLink
              className="size-3.5"
              aria-hidden
            />
          </a>
        )}
      </figcaption>
      {failed && (
        <p
          role="alert"
          className="text-destructive text-sm"
        >
          {t("embeds.videoFailed")}
        </p>
      )}
      {video.chapters.length > 0 && (
        <ol
          className="flex flex-wrap gap-2 text-xs"
          aria-label={t("embeds.chapters")}
        >
          {video.chapters.map((chapter) => (
            <li key={`${chapter.startSeconds}-${chapter.title}`}>
              <button
                type="button"
                onClick={() => jump(chapter.startSeconds)}
                className="border-border hover:border-primary/60 hover:text-link rounded-full border px-2.5 py-1"
              >
                <span className="text-muted-foreground tabular-nums">{time(chapter.startSeconds)}</span> {chapter.title}
              </button>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

function time(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");

  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
