/**
 * An image of Spexipedia's own, from the media server, in the size the layout needs: the browser picks from the
 * thumbnail (about 320 px), page (1280) and full (2560) variants. Plain `<img>`, never `next/image`: the media server
 * has made the sizes already.
 */
export type WikiImageData = {
  id: string;
  alt: string;
  caption?: string | null;
  width: number;
  height: number;
  thumbnailUrl: string;
  pageUrl: string;
  fullUrl: string;
};

export function WikiImage({
  image,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
  eager = false,
}: {
  image: WikiImageData;
  sizes?: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.pageUrl}
      srcSet={`${image.thumbnailUrl} 320w, ${image.pageUrl} 1280w, ${image.fullUrl} 2560w`}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
