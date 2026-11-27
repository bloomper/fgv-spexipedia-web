import { Skeleton } from "@bloomper/fgv-web-ui/ui/skeleton";
import { Page } from "@bloomper/fgv-web-ui/shell/page-header";
import { HeaderSkeleton } from "@/components/page-skeleton";

/** The browsing pages: a title, then posters by decade as `SpexCard` shows them. */
export default function Loading() {
  return (
    <Page variant="content" className="mx-auto w-full max-w-7xl">
      <HeaderSkeleton />
      <Skeleton className="h-6 w-40" />
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </Page>
  );
}
