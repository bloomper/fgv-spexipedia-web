import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/utils/utils";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Pencil } from "lucide-react";
import { HtmlContent } from "@/components/wiki/html-content";
import { ImageGallery } from "@/components/wiki/image-gallery.client";
import { AppLinks } from "@/components/wiki/app-links";
import { CreditList } from "@/components/wiki/person";
import { buttonVariants } from "@/components/ui/button";
import { getRecording } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { creditLabel, groupBy } from "@/utils/wiki";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recording = await getRecording(decodeURIComponent((await params).slug));

  return recording
    ? (recording.published ? publicMetadata(`${recording.title} – ${recording.catalogueNumber}`, null, recording.front?.fullUrl) : privateMetadata(recording.title))
    : privateMetadata("Spexipedia");
}

/**
 * A recording: covers, the facts, the tracks by side, and the album in Spexify for those who can open it.
 */
export default async function RecordingPage({ params }: Props) {
  const { slug } = await params;
  const [recording, viewer, t] = await Promise.all([
    getRecording(decodeURIComponent(slug)), getViewer(), getTranslations("Recordings"),
  ]);

  if (!recording) {
    notFound();
  }
  if (recording.slug !== decodeURIComponent(slug)) {
    permanentRedirect(`/recordings/${recording.slug}`);
  }
  const covers = [recording.front, recording.back].filter((image): image is NonNullable<typeof image> => !!image);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 md:px-8">
      <header className="grid gap-6 md:grid-cols-[minmax(0,18rem)_1fr]">
        <ImageGallery images={covers.map(image => ({ image, caption: null }))} columns={2} className="md:grid-cols-1" />
        <div className="space-y-3">
          <p className="text-sm tracking-[0.25em] text-primary">{recording.catalogueNumber} · {recording.medium.name}</p>
          <h1 className="wiki-heading text-3xl font-semibold md:text-4xl">{recording.title}</h1>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {recording.spex && <><dt className="text-muted-foreground">{t("spex")}</dt><dd><Link href={`/spex/${recording.spex.slug}`} className="text-primary hover:text-primary/80">{recording.spex.title} ({recording.spex.year})</Link></dd></>}
            {recording.released && <><dt className="text-muted-foreground">{t("released")}</dt><dd>{recording.released}</dd></>}
            {recording.recorded && <><dt className="text-muted-foreground">{t("recorded")}</dt><dd>{recording.recorded}</dd></>}
            {creditLabel(recording.conductor) && <><dt className="text-muted-foreground">{t("conductor")}</dt><dd><CreditList credits={[recording.conductor!]} /></dd></>}
          </dl>
          <HtmlContent html={recording.descriptionHtml} />
          <AppLinks links={recording.links} />
          {viewer.editor && (
            <Link href={`/manage/recordings/${recording.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Pencil aria-hidden /> {t("edit")}</Link>
          )}
        </div>
      </header>
      {recording.tracks.length > 0 && (
        <section className="space-y-4" aria-labelledby="tracks">
          <h2 id="tracks" className="wiki-heading text-xl font-semibold">{t("tracks")}</h2>
          {groupBy(recording.tracks, track => track.side ?? "").map(([side, tracks]) => (
            <div key={side} className="space-y-1">
              {side && <h3 className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{t("side", { side })}</h3>}
              <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-sm">
                {tracks.map(track => (
                  <li key={track.id} className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-3 py-2", track.number && "link-row")}>
                    <span className="w-6 text-muted-foreground">{track.position}</span>
                    {track.number ? (
                      <>
                        <Link href={`/spex/${track.number.spex.slug}#number-${track.number.id}`} className="row-link min-w-0 flex-1">{track.title}</Link>
                        {/* The track is a number of a spex: say which, so that it is clear where the row leads */}
                        <span className="text-xs text-muted-foreground">
                          {t("trackNumber", { spex: `${track.number.spex.title} (${track.number.spex.year})`, act: track.number.act, number: track.number.position })}
                        </span>
                      </>
                    ) : <span>{track.title}</span>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
