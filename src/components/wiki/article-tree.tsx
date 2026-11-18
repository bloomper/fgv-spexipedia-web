import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/utils/utils";

/*
 * The structure of the wiki (spec 4.5): the path of an article in the tree as breadcrumbs, the tree around it, its
 * table of contents, and the whole tree for the list of articles.
 */

type Crumb = { id: string; slug: string; title: string };
/** A node of the tree; below the depth that was read, only the ids of children are known. */
export type TreeNode = { id: string; slug: string; title: string; visibility?: string; published?: boolean; children?: (TreeNode | { id: string })[] };

const known = (node: TreeNode | { id: string }): node is TreeNode => "slug" in node;

/**
 * From the top of the tree down to the article.
 */
export function Breadcrumbs({ ancestors, title }: { ancestors: Crumb[]; title: string }) {
  const t = useTranslations("Articles");

  return (
    <nav aria-label={t("breadcrumbs")} className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        <li><Link href="/articles" className="hover:text-primary">{t("title")}</Link></li>
        {ancestors.map(ancestor => (
          <li key={ancestor.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={`/articles/${ancestor.slug}`} className="hover:text-primary">{ancestor.title}</Link>
          </li>
        ))}
        <li className="flex items-center gap-1">
          <ChevronRight className="size-3.5" aria-hidden />
          <span aria-current="page" className="text-foreground">{title}</span>
        </li>
      </ol>
    </nav>
  );
}

/**
 * The article's headings, indented by level; the server sends them only for articles with three or more.
 */
export function TableOfContents({ toc }: { toc: { level: number; anchor: string; text: string }[] }) {
  const t = useTranslations("Articles");

  if (toc.length === 0) {
    return null;
  }
  const top = Math.min(...toc.map(heading => heading.level));

  return (
    <nav aria-label={t("contents")} className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{t("contents")}</p>
      <ol className="space-y-1 text-sm">
        {toc.map(heading => (
          <li key={heading.anchor} style={{ paddingLeft: `${(heading.level - top) * 0.75}rem` }}>
            <a href={`#${heading.anchor}`} className="text-muted-foreground hover:text-primary">{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The tree around an article: its parent, its siblings in their order, and its own children under it.
 */
export function TreeAround({ current, parent, siblings, items }: {
  current: string;
  parent: Crumb | null;
  siblings: Crumb[];
  items: Crumb[];
}) {
  const t = useTranslations("Articles");
  const list = siblings.length > 0 ? siblings : [{ id: current, slug: "", title: "" }];

  if (!parent && siblings.length <= 1 && items.length === 0) {
    return null;
  }
  return (
    <nav aria-label={t("tree")} className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{t("tree")}</p>
      {parent && <Link href={`/articles/${parent.slug}`} className="block text-sm font-medium hover:text-primary">{parent.title}</Link>}
      <ul className={cn("space-y-1 text-sm", parent && "border-l border-border pl-3")}>
        {list.map(sibling => (
          <li key={sibling.id}>
            {sibling.id === current
              ? <span aria-current="page" className="font-semibold text-primary">{sibling.title || t("thisArticle")}</span>
              : <Link href={`/articles/${sibling.slug}`} className="text-muted-foreground hover:text-primary">{sibling.title}</Link>}
            {sibling.id === current && items.length > 0 && (
              <ul className="mt-1 space-y-1 border-l border-border pl-3">
                {items.map(child => <li key={child.id}><Link href={`/articles/${child.slug}`} className="text-muted-foreground hover:text-primary">{child.title}</Link></li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The tree of articles as nested lists, as far down as the nodes go; a node whose children were not sent says so.
 */
export function ArticleTree({ nodes }: { nodes: TreeNode[] }) {
  const t = useTranslations("Articles");

  return (
    <ul className="space-y-1">
      {nodes.map(node => (
        <li key={node.id}>
          <span className="inline-flex flex-wrap items-center gap-2">
            <Link href={`/articles/${node.slug}`} className="hover:text-primary">{node.title}</Link>
            {node.visibility === "MEMBERS" && <Lock className="size-3 text-muted-foreground" aria-label={t("members")} />}
            {node.published === false && <span className="text-xs text-muted-foreground">({t("unpublished")})</span>}
          </span>
          {node.children && node.children.length > 0 && (
            node.children.every(known)
              ? <div className="mt-1 border-l border-border pl-4"><ArticleTree nodes={node.children} /></div>
              : <p className="pl-4 text-xs text-muted-foreground"><Link href={`/articles/${node.slug}`} className="hover:text-primary">{t("moreBelow", { count: node.children.length })}</Link></p>
          )}
        </li>
      ))}
    </ul>
  );
}
