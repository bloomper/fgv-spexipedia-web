"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { WikiImage, type WikiImageData } from "@/components/wiki/wiki-image";
import { cn } from "@/utils/utils";

export type GalleryImage = { image: WikiImageData; caption?: string | null };

/**
 * Images with captions in a grid; one opens them all full screen.
 */
export function ImageGallery({ images, columns = 3, className }: { images: GalleryImage[]; columns?: 2 | 3 | 4; className?: string }) {
  const [index, setIndex] = useState(-1);

  if (images.length === 0) {
    return null;
  }
  return (
    <>
      <div className={cn("grid gap-4", columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "grid-cols-2 md:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3", className)}>
        {images.map(({ image, caption }, i) => (
          <figure key={`${image.id}-${i}`} className="space-y-2">
            <button type="button" onClick={() => setIndex(i)}
                    className="block w-full overflow-hidden rounded-md border border-border bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <WikiImage image={image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                         className="aspect-[4/3] w-full object-cover transition-transform hover:scale-[1.02]" />
            </button>
            {(caption ?? image.caption) && <figcaption className="text-sm text-muted-foreground">{caption ?? image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <Lightbox
        open={index >= 0}
        index={Math.max(index, 0)}
        close={() => setIndex(-1)}
        plugins={[Captions, Zoom]}
        slides={images.map(({ image, caption }) => ({
          src: image.fullUrl,
          alt: image.alt,
          width: image.width,
          height: image.height,
          description: caption ?? image.caption ?? undefined,
          srcSet: [
            { src: image.thumbnailUrl, width: 320, height: Math.round(image.height * 320 / image.width) },
            { src: image.pageUrl, width: 1280, height: Math.round(image.height * 1280 / image.width) },
          ],
        }))}
      />
    </>
  );
}
