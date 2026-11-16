import { diffLines } from "@/utils/diff";
import { cn } from "@/utils/utils";

/**
 * Two texts' differences line by line: removed lines struck through in red, added ones in green.
 */
export function DiffView({ before, after, labels }: { before: string; after: string; labels?: { removed: string; added: string } }) {
  const lines = diffLines(before, after);

  return (
    <div className="space-y-2">
      {labels && (
        <p className="flex gap-4 text-xs text-muted-foreground">
          <span><span className="mr-1 inline-block size-2 rounded-full bg-red-500" />{labels.removed}</span>
          <span><span className="mr-1 inline-block size-2 rounded-full bg-green-500" />{labels.added}</span>
        </p>
      )}
      <pre className="max-h-[32rem] overflow-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
        {lines.map((line, i) => (
          <div key={i} className={cn(
            line.kind === "removed" && "bg-red-500/15 text-red-300 line-through decoration-red-400/60",
            line.kind === "added" && "bg-green-500/15 text-green-300",
          )}>
            <span aria-hidden className="mr-2 select-none opacity-60">{line.kind === "removed" ? "−" : line.kind === "added" ? "+" : " "}</span>
            {line.text || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
