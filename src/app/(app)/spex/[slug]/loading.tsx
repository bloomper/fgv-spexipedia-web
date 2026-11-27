import { Skeleton } from "@bloomper/fgv-web-ui/ui/skeleton";
import { RailSkeleton, TextSkeleton } from "@/components/page-skeleton";

/** A spex page: the poster beside the head, a section, and the rail. */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl gap-10 p-4 md:p-8">
      <div className="min-w-0 flex-1 space-y-10">
        <div className="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8">
          <Skeleton className="mx-auto aspect-[3/4] w-48 md:w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-48" />
            </div>
            <TextSkeleton lines={4} />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <TextSkeleton />
        </div>
      </div>
      <RailSkeleton className="w-52 shrink-0 max-xl:hidden" />
    </div>
  );
}
