import { cn } from "@/utils/utils";

/**
 * Markdown the server has rendered: HTML escaped, links made safe, `[[Title]]` resolved. Never pass anything else.
 */
export function HtmlContent({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) {
    return null;
  }
  return <div className={cn("prose-wiki", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
