import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Lock, Pencil } from "lucide-react";
import { getSpexPage, type SpexPageData } from "@/lib/wiki/wiki.server";
import { getViewer } from "@/lib/wiki/viewer.server";
import { privateMetadata, publicMetadata } from "@/lib/wiki/metadata.server";
import { SpexSection } from "@/components/wiki/spex-section";
import { SectionBar, SectionRail } from "@/components/wiki/section-rail.client";
import { HtmlContent } from "@/components/wiki/html-content";
import { WikiImage } from "@/components/wiki/wiki-image";
import { ImageGallery } from "@/components/wiki/image-gallery.client";
import { RebusReveal } from "@/components/wiki/rebus-reveal.client";
import { PHOTOS_VIEW, RoleGrid, type RoleView } from "@/components/wiki/role-grid.client";
import { PhotoSet } from "@/components/wiki/photo-set.client";
import { CreditList, PersonList, PersonName } from "@/components/wiki/person";
import { AppLinks, isSpexPageLink } from "@/components/wiki/app-links";
import { RecordCard } from "@/components/wiki/record-card.client";
import { EmbeddedVideo } from "@/components/wiki/embedded-video.client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDay } from "@/utils/format";
import { cn } from "@/utils/utils";
import { creditLabel, groupBy, personLabel, sceneLabel } from "@/utils/wiki";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const spex = await getSpexPage(decodeURIComponent((await params).slug));

  if (!spex) {
    return privateMetadata("Spex");
  }
  const title = `${spex.title} (${spex.year})`;

  return spex.published
    ? publicMetadata(title, spex.page?.introduction, spex.poster?.pageJpegUrl)
    : privateMetadata(title);
}

/**
 * A spex's page: its head beside the poster, then the sections that have content, with a rail leading to them. A
 * revival's page shows what it changed and its parent's page for the rest (the server merges them). Addressed by slug;
 * an id (as other applications link) or an old slug goes to the current address.
 */
export default async function SpexPage({ params }: Props) {
  const { slug } = await params;
  const [spex, viewer, t, locale] = await Promise.all([
    getSpexPage(decodeURIComponent(slug)), getViewer(), getTranslations("SpexPage"), getLocale(),
  ]);

  if (!spex || (!spex.published && !viewer.author)) {
    notFound();
  }
  if (spex.slug !== decodeURIComponent(slug)) {
    permanentRedirect(`/spex/${spex.slug}`);
  }

  const page = spex.page;
  const production = (s: { year: string; revival: boolean }) => s.revival ? t("revivalYear", { year: s.year }) : t("originalYear", { year: s.year });
  const photos = (set?: { photos: unknown[]; hiddenCount: number } | null) => !!set && (set.photos.length > 0 || (viewer.member && set.hiddenCount > 0));
  const shownPeople = (holders: Holder[]) => holders.some(holder => holder.people.some(person => personLabel(person)));
  /**
   * What a section shows, by its content (spec 4.2); null when it has nothing, so that it is left out. People
   * sections are kept while Spexregister cannot be reached, so that they can say so.
   */
  const body = (section: PageSection): ReactNode => {
    switch (section.content) {
      case "GROUP":
        return photos(page?.groupPhotos) ? (
          <>
            <PhotoSet set={page!.groupPhotos} member={viewer.member} />
          </>
        ) : null;
      case "CHARACTERS":
        return spex.characters.length > 0 ? (
          <>
            <RoleGrid views={roleViews(spex.characters, t("photosView"))} cards={spex.characters.map(character => ({
              id: character.id,
              arts: [
                ...character.images.map(image => ({ view: image.kind?.id ?? "", caption: image.caption ?? image.kind?.name, image: image.image })),
                ...character.photos.photos.map(photo => ({ view: PHOTOS_VIEW, caption: photo.caption, photo })),
              ],
              hiddenPhotos: character.photos.hiddenCount,
              body: (
                <>
                  <h3 className="wiki-heading text-base leading-tight font-semibold">{character.name}</h3>
                  {character.retired && <Badge variant="outline">{t("retired")}</Badge>}
                  {character.playedBy.some(played => personLabel(played.person)) && (
                    <dl className="text-xs">
                      {groupBy(character.playedBy, played => played.spex.id).map(([id, played]) => (
                        <div key={id}>
                          <dt className="sr-only">{production(played[0].spex)}</dt>
                          <dd className="text-primary">
                            <PersonList people={played.map(p => p.person)} />
                            {played[0].spex.revival && <span className="text-muted-foreground"> · {production(played[0].spex)}</span>}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <HtmlContent html={character.descriptionHtml} className="text-sm text-foreground/85" />
                </>
              ),
            }))} />
          </>
        ) : null;
      case "MANUSCRIPT":
        return !!(page?.synopsisHtml || spex.scenes.length > 0) ? (
          <>
            {/* The synopsis, with the scenes beside it as in a programme; the synopsis may have act headings of its own */}
            <div className={cn("grid gap-8", page?.synopsisHtml && spex.scenes.length > 0 && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
              <HtmlContent html={page?.synopsisHtml} />
              {spex.scenes.length > 0 && (
                <aside aria-labelledby="scenes-heading" className="h-fit space-y-4 rounded-lg border border-border bg-card p-4">
                  <h3 id="scenes-heading" className="text-sm font-semibold">{t("scenes")}</h3>
                  {groupBy(spex.scenes, scene => scene.act).map(([act, scenes]) => (
                    <div key={act} className="space-y-1.5">
                      <h4 className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">{t("act", { act })}</h4>
                      <ol className="space-y-1 text-sm">
                        {scenes.map(scene => (
                          <li key={scene.id}>
                            <span className="font-medium">{sceneLabel(scene)}</span>
                            {scene.place && <span className="text-muted-foreground"> — {scene.place}</span>}
                            {scene.intervalAfter && (
                              <p className="mt-3 flex items-center gap-3 text-xs tracking-[0.3em] text-primary uppercase before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                                {t("interval")}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </aside>
              )}
            </div>
            <AppLinks links={spex.links.filter(link => link.kind === "ARCHIVE_MANUSCRIPT")} />
          </>
        ) : null;
      case "MUSIC":
        return spex.numbers.length > 0 ? (
          <>
            {groupBy(spex.numbers, number => number.act).map(([act, numbers]) => (
              <div key={act} className="space-y-2">
                <h3 className="wiki-heading text-xl font-semibold">{t("act", { act })}</h3>
                <ol className="divide-y divide-border rounded-lg border border-border bg-card">
                  {numbers.map(number => {
                    // Unresolved credits (spec 5.3) reach editors only, and are never shown on pages
                    const credits = groupBy(number.credits.filter(credit => !credit.credit.unresolved && creditLabel(credit.credit)), credit => credit.kind.id);

                    return (
                      <li key={number.id} id={`number-${number.id}`} className="scroll-mt-28 xl:scroll-mt-20 space-y-1 p-3 text-sm">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p><span className="text-muted-foreground">{number.position}.</span> <span className="font-semibold">{number.title}</span>
                            {number.kind && <span className="text-xs text-muted-foreground"> · {number.kind.name}</span>}
                            {number.originalTitle && <span className="text-muted-foreground"> — {t("melody", { title: number.originalTitle, artist: number.originalArtist ?? "" })}</span>}
                            {number.fromWork && <span className="text-muted-foreground"> {t("fromWork", { work: number.fromWork })}</span>}
                          </p>
                          <AppLinks links={number.links} compact />
                        </div>
                        {number.firstLine && <p className="text-xs text-foreground/80 italic">”{number.firstLine}”</p>}
                        {number.characters.length > 0 && <p className="text-xs text-muted-foreground">{t("sungBy", { names: number.characters.map(c => c.name).join(", ") })}</p>}
                        {number.books.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {t("inBooks")}{" "}
                            {number.books.map((book, i) => (
                              <span key={`${book.id}-${book.position}`}>
                                {i > 0 && ", "}
                                {/* Books are Spexarkivet's (spec 4.4): a link for those with access there */}
                                {book.url
                                  ? <a href={book.url} className="text-primary hover:text-primary/80" title={t("openBook")}>{book.title}</a>
                                  : book.title}
                                {book.textOnly && ` (${t("textOnly")})`}
                              </span>
                            ))}
                          </p>
                        )}
                        {credits.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {credits.map(([kind, list], i) => <span key={kind}>{i > 0 && " · "}{list[0].kind.name}: <CreditList credits={list.map(credit => credit.credit)} /></span>)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
            <AppLinks links={spex.links.filter(link => link.kind === "SPEXIFY_ALBUM")} />
          </>
        ) : null;
      case "RECORDS":
        return spex.records.length > 0 ? (
          <>
            {/* The records are Spexify's discography (spec 4.4), shown read-only; they are kept in Spexify */}
            <ul className="grid gap-4 lg:grid-cols-2">
              {spex.records.map(record => <li key={record.id}><RecordCard record={record} /></li>)}
            </ul>
          </>
        ) : null;
      case "REBUS":
        return !!page?.rebus ? (
          <>
            {page!.rebus && page!.rebusSolution
              ? <RebusReveal rebus={page!.rebus} solution={page!.rebusSolution} />
              : page!.rebus && <WikiImage image={page!.rebus} sizes="(min-width: 1024px) 48rem, 100vw" className="w-full max-w-3xl rounded-lg border border-border" />}
          </>
        ) : null;
      case "VEST":
        return !!page && (!!page.vestDescriptionHtml || section.images.length > 0) ? (
          <>
            <HtmlContent html={page!.vestDescriptionHtml} />
            {creditLabel(page!.vestWornBy) && <p className="text-sm"><span className="text-muted-foreground">{t("wornBy")}: </span><CreditList credits={page!.vestWornBy ? [page!.vestWornBy] : []} /></p>}
            <ImageGallery images={section.images.map(image => ({ image: image.image, caption: image.caption }))} />
          </>
        ) : null;
      case "BOARD":
        return !spex.people.available || shownPeople(spex.people.board) || photos(spex.people.boardPhotos) ? (
          <>
            {!spex.people.available ? <p className="text-sm text-muted-foreground">{t("peopleUnavailable")}</p> : (
              <>
                <PhotoSet set={spex.people.boardPhotos} member={viewer.member} />
                <Holders holders={spex.people.board} production={production} />
              </>
            )}
          </>
        ) : null;
      case "TASKS":
        return !spex.people.available || shownPeople(spex.people.tasks) ? (
          <>
            {!spex.people.available ? <p className="text-sm text-muted-foreground">{t("peopleUnavailable")}</p> : (
              <div className="grid gap-6 md:grid-cols-2">
                {groupBy(spex.people.tasks, holder => holder.task.category?.name ?? "").map(([category, holders]) => (
                  <div key={category} className="space-y-2">
                    {category && <h3 className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{category}</h3>}
                    <Holders holders={holders} production={production} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null;
      case "LINKS":
        return spex.links.some(link => link.kind !== "ARCHIVE_MANUSCRIPT" && link.kind !== "SPEXIFY_ALBUM") ? (
          <>
            {/* Everything about the spex in the other applications, for a logged-in user with access there */}
            <div className="space-y-4">
              <AppLinks links={spex.links.filter(link => link.kind !== "ARCHIVE_MANUSCRIPT" && link.kind !== "SPEXIFY_ALBUM" && !isSpexPageLink(link))} />
              {spex.links.some(isSpexPageLink) && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t("allMaterial")}</p>
                  <AppLinks links={spex.links.filter(isSpexPageLink)} />
                </div>
              )}
            </div>
          </>
        ) : null;
      case "IMAGES":
        return section.images.length > 0
          ? <ImagesByKind images={section.images} headings={new Set(section.images.map(image => image.kind?.id)).size > 1} />
          : null;
      default:
        return external(section, viewer.member, t);
    }
  };
  const shown = spex.sections
    .map(section => ({ section, anchor: anchorOf(section), body: body(section) }))
    .filter(({ body }) => body != null);
  const sections = [{ id: "overview", title: t("sections.overview.title") }, ...shown.map(({ section, anchor }) => ({ id: anchor, title: section.title }))];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: spex.title,
    dateCreated: page?.premiere ?? spex.year,
    genre: spex.category?.name,
    description: page?.introduction ?? undefined,
    image: spex.poster?.pageJpegUrl,
    isBasedOn: spex.parent ? { "@type": "CreativeWork", name: spex.parent.title, dateCreated: spex.parent.year } : undefined,
    character: spex.characters.map(character => ({ "@type": "Person", name: character.name })),
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-10 px-4 py-6 md:px-8">
      {spex.published && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      )}
      <article className="min-w-0 flex-1 space-y-10">
        {/* Head */}
        <header id="overview" data-section className="scroll-mt-28 xl:scroll-mt-20 grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8">
          <div className="mx-auto w-48 md:w-full">
            {spex.poster ? (
              <WikiImage image={spex.poster} eager sizes="(min-width: 768px) 16rem, 12rem"
                         className="w-full rounded-lg border border-border shadow-lg shadow-black/30" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                {t("noPoster")}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm tracking-[0.25em] text-primary">
                {spex.year}{spex.category && <> · <Link href={`/categories/${spex.category.id}`} className="hover:text-primary">{spex.category.name}</Link></>}
              </p>
              <h1 className="wiki-heading text-3xl leading-tight font-semibold md:text-4xl">{spex.title}</h1>
              <div className="flex flex-wrap gap-2">
                {spex.revival && spex.parent && (
                  <Badge variant="secondary">
                    {t("revivalOf")} <Link href={`/spex/${spex.parent.slug}`} className="ml-1 font-medium hover:text-primary">{spex.parent.title} ({spex.parent.year})</Link>
                  </Badge>
                )}
                {!spex.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                {spex.retired && <Badge variant="destructive">{t("retired")}</Badge>}
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {page?.premiere && <><dt className="text-muted-foreground">{t("premiere")}</dt><dd>{formatDay(page.premiere, locale)}</dd></>}
              {page?.facts.map(fact => (
                <div key={fact.kind.id} className="contents">
                  <dt className="text-muted-foreground">{fact.kind.name}</dt>
                  <dd>{fact.kind.valueType === "DATE" ? formatDay(fact.value, locale) ?? fact.value : fact.value}</dd>
                </div>
              ))}
              {spex.revivals.length > 0 && (
                <>
                  <dt className="text-muted-foreground">{t("revivals")}</dt>
                  <dd className="flex flex-wrap gap-x-2">
                    {spex.revivals.map(revival => <Link key={revival.id} href={`/spex/${revival.slug}`} className="text-primary hover:text-primary/80">{revival.year}</Link>)}
                  </dd>
                </>
              )}
            </dl>
            {page?.introduction && <p className="text-lg leading-relaxed text-foreground/90">{page.introduction}</p>}
            {page?.shortDescription && <p className="leading-relaxed text-foreground/80">{page.shortDescription}</p>}
            <HtmlContent html={page?.descriptionHtml} />
            {viewer.author && (
              <div className="pt-2">
                <Link href={`/manage/spex/${spex.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <Pencil aria-hidden /> {t("edit")}
                </Link>
              </div>
            )}
          </div>
        </header>
        <SectionBar sections={sections} label={t("onThisPage")} />

        {shown.map(({ section, anchor, body }) => (
          <SpexSection key={section.id} id={anchor} title={section.title} subtitle={section.subtitle ?? undefined}>
            {body}
          </SpexSection>
        ))}

        {(spex.previous || spex.next) && (
          <nav aria-label={t("pager")} className="grid gap-3 sm:grid-cols-2">
            {spex.previous ? (
              <Link href={`/spex/${spex.previous.slug}`} rel="prev"
                    className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/60">
                <ArrowLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{t("previousSpex")}</span>
                  <span className="block truncate font-semibold group-hover:text-primary">{spex.previous.title} ({spex.previous.year})</span>
                </span>
              </Link>
            ) : <span className="max-sm:hidden" />}
            {spex.next && (
              <Link href={`/spex/${spex.next.slug}`} rel="next"
                    className="group flex items-center justify-end gap-3 rounded-lg border border-border bg-card p-3 text-right hover:border-primary/60">
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{t("nextSpex")}</span>
                  <span className="block truncate font-semibold group-hover:text-primary">{spex.next.title} ({spex.next.year})</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
              </Link>
            )}
          </nav>
        )}

      </article>
      <aside className="w-52 shrink-0 max-xl:hidden">
        <SectionRail sections={sections} label={t("onThisPage")} />
      </aside>
    </div>
  );
}

type PageSection = SpexPageData["sections"][number];
type PageImage = PageSection["images"][number];

/** Where its section is on the page: the old anchors for the contents with one kind, so links into pages keep working. */
const ANCHORS: Partial<Record<PageSection["content"], string>> = {
  GROUP: "group", CHARACTERS: "characters", MANUSCRIPT: "manuscript", MUSIC: "music", RECORDS: "recordings",
  REBUS: "rebus", VEST: "vest", BOARD: "board", TASKS: "tasks", LINKS: "links",
};

const anchorOf = (section: PageSection) => ANCHORS[section.content] ?? `section-${section.id}`;

/**
 * A section that shows material of another application (spec 4.2.1), as the server answered for the viewer: null when
 * it found nothing the viewer may see. Logged-in users without access to Spexflix or Spexarkivet are told the material
 * is there; visitors get no such section.
 */
function external(section: PageSection, member: boolean, t: (key: string, values?: Record<string, string>) => string): ReactNode {
  switch (section.content) {
    case "SPEXFLIX_VIDEO":
      if (!section.video) {
        return null;
      }
      return section.video.access && section.video.playback
        ? <EmbeddedVideo video={section.video} />
        : <NoAccess text={t("embeds.inSpexflix", { title: section.video.title })} />;
    case "SPEXGRAM": {
      const album = section.photos;

      if (!album || !(album.photos.photos.length > 0 || (member && album.photos.hiddenCount > 0))) {
        return null;
      }
      return (
        <div className="space-y-3">
          <PhotoSet set={album.photos} member={member} />
          {album.url && <OpenLink href={album.url} text={t("embeds.openAlbum", { title: album.title })} />}
        </div>
      );
    }
    case "SPEXIFY_ALBUM":
      return section.record ? <RecordCard record={section.record} large /> : null;
    case "ARCHIVE_DOCUMENT": {
      const document = section.document;

      if (!document) {
        return null;
      }
      if (!document.access) {
        return <NoAccess text={t("embeds.inArchive", { title: document.title })} />;
      }
      return (
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-semibold">{document.title}</span>
            {[document.kindName, document.year].filter(Boolean).length > 0 && <span className="text-muted-foreground"> · {[document.kindName, document.year].filter(Boolean).join(" · ")}</span>}
          </p>
          {document.files.some(file => file.previewUrl) && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {document.files.filter(file => file.previewUrl).map(file => (
                <li key={file.id}>
                  <a href={document.url ?? undefined} className="group block space-y-1">
                    {/* A link Spexarkivet signs for some hours: the first page, never the file */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.previewUrl!} alt={t("embeds.firstPage", { title: file.title })} loading="lazy"
                         className="aspect-[1/1.414] w-full rounded border border-border bg-white object-contain object-top group-hover:border-primary/60" />
                    <span className="block truncate text-xs text-muted-foreground group-hover:text-primary">
                      {file.title}{file.pages ? ` (${t("embeds.pages", { count: String(file.pages) })})` : ""}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {document.url && <OpenLink href={document.url} text={t("embeds.openDocument")} />}
        </div>
      );
    }
    default:
      return null;
  }
}

function NoAccess({ text }: { text: string }) {
  return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="size-4" aria-hidden /> {text}</p>;
}

function OpenLink({ href, text }: { href: string; text: string }) {
  return <a href={href} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80">{text} <ExternalLink className="size-3.5" aria-hidden /></a>;
}

/**
 * The views of the roles: the image kinds the roles have, in the kinds' order, then the actors' photos when the viewer
 * gets any.
 */
function roleViews(characters: SpexPageData["characters"], photos: string): RoleView[] {
  const views = new Map<string, string>();

  characters.flatMap(character => character.images).forEach(image => {
    if (image.kind && !views.has(image.kind.id)) {
      views.set(image.kind.id, image.kind.name);
    }
  });
  if (characters.some(character => character.photos.photos.length > 0)) {
    views.set(PHOTOS_VIEW, photos);
  }
  return [...views].map(([key, label]) => ({ key, label }));
}

/**
 * Images grouped by their image kind (spec 4.6), which the server sends in the kinds' order; with `headings`, each
 * group under its kind's name.
 */
function ImagesByKind({ images, headings }: { images: PageImage[]; headings: boolean }) {
  return groupBy(images, image => image.kind?.id ?? "").map(([kind, group]) => (
    <div key={kind} className="space-y-3">
      {headings && group[0].kind && <h3 className="text-sm font-semibold tracking-[0.15em] text-muted-foreground uppercase">{group[0].kind.name}</h3>}
      <ImageGallery images={group.map(image => ({ image: image.image, caption: image.caption }))} />
    </div>
  ));
}

type Holder = { spex: { id: string; year: string; revival: boolean }; task: { id: string; name: string }; people: SpexPageData["people"]["tasks"][number]["people"] };

function Holders({ holders, production }: {
  holders: Holder[];
  production: (spex: { year: string; revival: boolean }) => string;
}) {
  const shown = holders.filter(holder => holder.people.some(person => personLabel(person)));
  const productions = new Set(shown.map(holder => holder.spex.id));

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {shown.map(holder => (
        <div key={`${holder.spex.id}-${holder.task.id}`} className="contents">
          <dt className="text-muted-foreground">{holder.task.name}{productions.size > 1 && ` (${production(holder.spex)})`}</dt>
          <dd>{holder.people.map((person, i) => <span key={person.id ?? i}>{i > 0 && ", "}<PersonName person={person} /></span>)}</dd>
        </div>
      ))}
    </dl>
  );
}
