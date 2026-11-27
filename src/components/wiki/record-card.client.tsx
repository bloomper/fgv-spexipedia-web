"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";

export type RecordData = {
  id: string;
  title: string;
  year?: number | null;
  mediumNameSv?: string | null;
  mediumNameEn?: string | null;
  catalogueNumber?: string | null;
  released?: string | null;
  conductor?: string | null;
  coverUrl?: string | null;
  url?: string | null;
  tracks: {
    id: string;
    side?: string | null;
    position: number;
    title: string;
    hasAudio: boolean;
    url?: string | null;
    /** A signed link to the audio, only in a section that shows the record, for users with access to Spexify. */
    audioUrl?: string | null;
    number?: { id: string } | null;
  }[];
};

/**
 * A record of Spexify's discography (spec 4.4), shown read-only: the cover, catalogue number, medium and dates, and the
 * tracks, each linking to its number on the page. In a section that shows the record (4.2.1) tracks play on the page,
 * one at a time, from Spexify's signed links; elsewhere they link to Spexify for users with access there.
 */
export function RecordCard({ record, large = false }: { record: RecordData; large?: boolean }) {
  const t = useTranslations("SpexPage");
  const locale = useLocale();
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const toggle = (track: RecordData["tracks"][number]) => {
    const element = audio.current;

    if (!element || !track.audioUrl) {
      return;
    }
    if (playing === track.id) {
      element.pause();
      setPlaying(null);
      return;
    }
    element.src = track.audioUrl;
    void element.play().then(() => setPlaying(track.id)).catch(() => setPlaying(null));
  };

  return (
    <div className="flex gap-3 rounded-lg border border-border bg-card p-3 text-sm">
      {record.coverUrl && (
        // A link Spexify signs for some hours, not one of Spexipedia's own images
        // eslint-disable-next-line @next/next/no-img-element
        <img src={record.coverUrl} alt={t("records.cover", { title: record.title })} loading="lazy"
             className={large ? "size-32 shrink-0 rounded object-cover sm:size-40" : "size-20 shrink-0 rounded object-cover"} />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-semibold">{record.title}</p>
        <p className="text-muted-foreground">
          {[record.catalogueNumber, locale === "en" ? record.mediumNameEn : record.mediumNameSv, record.released ?? record.year]
            .filter(Boolean).join(" · ")}
        </p>
        {record.conductor && <p className="text-xs text-muted-foreground">{t("records.conductor", { name: record.conductor })}</p>}
        {record.tracks.length > 0 && (
          <ol className="space-y-0.5 text-xs">
            {record.tracks.map(track => (
              <li key={track.id} className="flex flex-wrap items-center gap-x-2">
                {track.audioUrl && (
                  <button type="button" onClick={() => toggle(track)} aria-pressed={playing === track.id}
                          aria-label={playing === track.id ? t("records.pause", { title: track.title }) : t("records.play", { title: track.title })}
                          className="inline-flex size-5 items-center justify-center rounded-full text-link hover:bg-primary/10">
                    {playing === track.id ? <Pause className="size-3" aria-hidden /> : <Play className="size-3" aria-hidden />}
                  </button>
                )}
                <span className="text-muted-foreground tabular-nums">{track.side ? `${track.side}${track.position}` : `${track.position}.`}</span>
                {track.number
                  ? <a href={`#number-${track.number.id}`} className="hover:text-link">{track.title}</a>
                  : <span>{track.title}</span>}
                {!track.audioUrl && (track.url
                  ? <a href={track.url} className="text-link hover:text-link/80">{t("records.listen")}</a>
                  : !track.hasAudio && <span className="text-muted-foreground">({t("records.noAudio")})</span>)}
              </li>
            ))}
          </ol>
        )}
        {record.url && <a href={record.url} className="inline-block text-xs text-link hover:text-link/80">{t("records.open")}</a>}
        {record.tracks.some(track => track.audioUrl) && (
          <audio ref={audio} preload="none" onEnded={() => setPlaying(null)} onPause={() => setPlaying(null)} className="hidden" />
        )}
      </div>
    </div>
  );
}
