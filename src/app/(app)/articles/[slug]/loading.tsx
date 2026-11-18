import { Skeleton } from "@/components/ui/skeleton";
import { RailSkeleton, TextSkeleton } from "@/components/page-skeleton";

/** An article: its title, the text, and the tree beside it. */
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-10 px-4 py-6 md:px-8">
      <div className="min-w-0 flex-1 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-2/3 max-w-xl" />
        </div>
        <TextSkeleton lines={8} />
        <TextSkeleton lines={5} />
      </div>
      <RailSkeleton className="w-60 shrink-0 max-lg:hidden" />
    </div>
  );
}
