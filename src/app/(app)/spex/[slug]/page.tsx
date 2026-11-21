import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
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
  const sections = sectionsOf(spex, viewer.member).map(id => ({ id, title: t(`sections.${id}.title`) }));
  const has = (id: string) => sections.some(section => section.id === id);
  const subtitle = (id: string) => t(`sections.${id}.subtitle`);
  const production = (s: { year: string; revival: boolean }) => s.revival ? t("revivalYear", { year: s.year }) : t("originalYear", { year: s.year });
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

        {has("group") && page && (
          <SpexSection id="group" title={t("sections.group.title")} subtitle={subtitle("group")}>
            <PhotoSet set={page.groupPhotos} member={viewer.member} />
          </SpexSection>
        )}

        {has("characters") && (
          <SpexSection id="characters" title={t("sections.characters.title")} subtitle={subtitle("characters")}>
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
          </SpexSection>
        )}

        {has("scenography") && page && (
          <SpexSection id="scenography" title={t("sections.scenography.title")} subtitle={subtitle("scenography")}>
            <ImagesByKind images={page.scenography} headings />
          </SpexSection>
        )}

        {has("manuscript") && (
          <SpexSection id="manuscript" title={t("sections.manuscript.title")} subtitle={subtitle("manuscript")}>
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
          </SpexSection>
        )}

        {has("music") && (
          <SpexSection id="music" title={t("sections.music.title")} subtitle={subtitle("music")}>
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
          </SpexSection>
        )}

        {has("recordings") && (
          <SpexSection id="recordings" title={t("sections.recordings.title")} subtitle={subtitle("recordings")}>
            {/* The records are Spexify's discography (spec 4.4), shown read-only; they are kept in Spexify */}
            <ul className="grid gap-4 lg:grid-cols-2">
              {spex.records.map(record => (
                <li key={record.id} className="flex gap-3 rounded-lg border border-border bg-card p-3 text-sm">
                  {record.coverUrl && (
                    // A link Spexify signs for some hours, not one of Spexipedia's own images
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={record.coverUrl} alt={t("records.cover", { title: record.title })} loading="lazy" className="size-20 shrink-0 rounded object-cover" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold">{record.title}</p>
                    <p className="text-muted-foreground">
                      {[record.catalogueNumber, record.mediumNameSv && (locale === "en" ? record.mediumNameEn : record.mediumNameSv), record.released ?? record.year]
                        .filter(Boolean).join(" · ")}
                    </p>
                    {record.conductor && <p className="text-xs text-muted-foreground">{t("records.conductor", { name: record.conductor })}</p>}
                    {record.tracks.length > 0 && (
                      <ol className="space-y-0.5 text-xs">
                        {record.tracks.map(track => (
                          <li key={track.id} className="flex flex-wrap items-baseline gap-x-2">
                            <span className="text-muted-foreground tabular-nums">{track.side ? `${track.side}${track.position}` : `${track.position}.`}</span>
                            {track.number
                              ? <a href={`#number-${track.number.id}`} className="hover:text-primary">{track.title}</a>
                              : <span>{track.title}</span>}
                            {track.url
                              ? <a href={track.url} className="text-primary hover:text-primary/80">{t("records.listen")}</a>
                              : !track.hasAudio && <span className="text-muted-foreground">({t("records.noAudio")})</span>}
                          </li>
                        ))}
                      </ol>
                    )}
                    {record.url && <a href={record.url} className="inline-block text-xs text-primary hover:text-primary/80">{t("records.open")}</a>}
                  </div>
                </li>
              ))}
            </ul>
          </SpexSection>
        )}

        {has("rebus") && page && (
          <SpexSection id="rebus" title={t("sections.rebus.title")} subtitle={subtitle("rebus")}>
            {page.rebus && page.rebusSolution
              ? <RebusReveal rebus={page.rebus} solution={page.rebusSolution} />
              : page.rebus && <WikiImage image={page.rebus} sizes="(min-width: 1024px) 48rem, 100vw" className="w-full max-w-3xl rounded-lg border border-border" />}
          </SpexSection>
        )}

        {has("vest") && page && (
          <SpexSection id="vest" title={t("sections.vest.title")} subtitle={subtitle("vest")}>
            <HtmlContent html={page.vestDescriptionHtml} />
            {creditLabel(page.vestWornBy) && <p className="text-sm"><span className="text-muted-foreground">{t("wornBy")}: </span><CreditList credits={page.vestWornBy ? [page.vestWornBy] : []} /></p>}
            <ImageGallery images={page.vest.map(image => ({ image: image.image, caption: image.caption }))} />
          </SpexSection>
        )}

        {has("board") && (
          <SpexSection id="board" title={t("sections.board.title")} subtitle={subtitle("board")}>
            {!spex.people.available ? <p className="text-sm text-muted-foreground">{t("peopleUnavailable")}</p> : (
              <>
                <PhotoSet set={spex.people.boardPhotos} member={viewer.member} />
                <Holders holders={spex.people.board} production={production} />
              </>
            )}
          </SpexSection>
        )}

        {has("tasks") && (
          <SpexSection id="tasks" title={t("sections.tasks.title")} subtitle={subtitle("tasks")}>
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
          </SpexSection>
        )}

        {has("images") && page && (
          <SpexSection id="images" title={t("sections.images.title")} subtitle={subtitle("images")}>
            <ImagesByKind images={page.other} headings={new Set(page.other.map(image => image.kind?.id)).size > 1} />
          </SpexSection>
        )}

        {has("links") && (
          <SpexSection id="links" title={t("sections.links.title")} subtitle={subtitle("links")}>
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
          </SpexSection>
        )}

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

type PageImage = NonNullable<SpexPageData["page"]>["other"][number];

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

/**
 * The sections with something to show, in page order. People sections are kept while Spexregister cannot be reached,
 * so that they can say so.
 */
function sectionsOf(spex: SpexPageData, member: boolean): string[] {
  const page = spex.page;
  const photos = (set?: { photos: unknown[]; hiddenCount: number } | null) => !!set && (set.photos.length > 0 || (member && set.hiddenCount > 0));
  const shownPeople = (holders: Holder[]) => holders.some(holder => holder.people.some(person => personLabel(person)));
  const linkKinds = spex.links.filter(link => link.kind !== "ARCHIVE_MANUSCRIPT" && link.kind !== "SPEXIFY_ALBUM");

  return [
    "overview",
    photos(page?.groupPhotos) && "group",
    spex.characters.length > 0 && "characters",
    page && page.scenography.length > 0 && "scenography",
    (page?.synopsisHtml || spex.scenes.length > 0) && "manuscript",
    spex.numbers.length > 0 && "music",
    spex.records.length > 0 && "recordings",
    page?.rebus && "rebus",
    page && (page.vestDescriptionHtml || page.vest.length > 0) && "vest",
    (!spex.people.available || shownPeople(spex.people.board) || photos(spex.people.boardPhotos)) && "board",
    (!spex.people.available || shownPeople(spex.people.tasks)) && "tasks",
    page && page.other.length > 0 && "images",
    linkKinds.length > 0 && "links",
  ].filter((id): id is string => typeof id === "string");
}

