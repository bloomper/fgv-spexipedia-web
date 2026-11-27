import { Skeleton } from "@bloomper/fgv-web-ui/ui/skeleton";

/** A page title with its description, as `PageHeader` draws them. */
export function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

/** Lines of running text, as wide as `.prose-wiki` lets them be. */
export function TextSkeleton({ lines = 5 }: { lines?: number }) {
  return (
    <div className="max-w-[75ch] space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? "h-4 w-2/3" : "h-4 w-full"}
        />
      ))}
    </div>
  );
}

/** The section rail beside a spex page or an article, from the width where it is shown. */
export function RailSkeleton({ className }: { className: string }) {
  return (
    <aside className={className}>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"
          />
        ))}
      </div>
    </aside>
  );
}
