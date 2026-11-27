import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, ChevronRight, CornerLeftUp, FileText, Lock } from "lucide-react";
import { Badge } from "@bloomper/fgv-web-ui/ui/badge";
import { TreeBranch } from "@/components/wiki/tree-branch.client";
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
        <li><Link href="/articles" className="hover:text-link">{t("title")}</Link></li>
        {ancestors.map(ancestor => (
          <li key={ancestor.id} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={`/articles/${ancestor.slug}`} className="hover:text-link">{ancestor.title}</Link>
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
            <a href={`#${heading.anchor}`} className="text-muted-foreground hover:text-link">{heading.text}</a>
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
  const leaf = (crumb: Crumb) => (
    <li key={crumb.id}>
      <Link href={`/articles/${crumb.slug}`} className="flex min-h-8 items-center rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">{crumb.title}</Link>
    </li>
  );
  const siblingList = (
    <ul className={cn("text-sm", parent && "article-tree")}>
      {list.map(sibling => sibling.id === current
        ? (
          <li key={sibling.id}>
            <span aria-current="page" className="flex min-h-8 items-center rounded-md bg-primary/10 px-1.5 font-semibold text-link">{sibling.title || t("thisArticle")}</span>
            {items.length > 0 && <ul className="article-tree">{items.map(leaf)}</ul>}
          </li>
        )
        : leaf(sibling))}
    </ul>
  );

  return (
    <nav aria-label={t("tree")} className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{t("tree")}</p>
      {parent && (
        <Link href={`/articles/${parent.slug}`} className="flex min-h-8 items-center gap-1.5 rounded-md text-sm font-medium transition-colors hover:text-link">
          <CornerLeftUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {parent.title}
        </Link>
      )}
      {siblingList}
    </nav>
  );
}

/** How many articles lie below a node, those below the depth that was read included. */
function countBelow(node: TreeNode | { id: string }): number {
  return known(node) ? (node.children ?? []).reduce((sum, child) => sum + 1 + countBelow(child), 0) : 0;
}

function Marks({ node }: { node: TreeNode }) {
  const t = useTranslations("Articles");

  return (
    <>
      {node.visibility === "MEMBERS" && <Lock className="size-3 shrink-0 text-muted-foreground" aria-label={t("members")} />}
      {node.published === false && <Badge variant="outline" className="text-muted-foreground">{t("unpublished")}</Badge>}
    </>
  );
}

/**
 * The branches below a node, joined by lines; a node whose children were not sent links to its article for the rest.
 */
function Branches({ nodes }: { nodes: TreeNode[] }) {
  const t = useTranslations("Articles");

  return (
    <ul className="article-tree text-sm">
      {nodes.map(node => {
        const children = node.children ?? [];
        const row = (
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 py-1">
            <Link href={`/articles/${node.slug}`} className={cn("transition-colors hover:text-link", children.length > 0 ? "font-medium" : "text-muted-foreground")}>{node.title}</Link>
            <Marks node={node} />
          </span>
        );

        if (children.length > 0 && children.every(known)) {
          return <li key={node.id}><TreeBranch title={node.title} row={row}><Branches nodes={children} /></TreeBranch></li>;
        }
        return (
          <li key={node.id}>
            <div className="flex min-h-8 items-center gap-1.5">
              <FileText className="size-4 shrink-0 text-muted-foreground/70 mx-0.5" aria-hidden />
              {row}
            </div>
            {children.length > 0 && (
              <Link href={`/articles/${node.slug}`} className="ml-6.5 inline-block pb-1 text-xs text-link hover:text-link/80">{t("moreBelow", { count: children.length })}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The whole tree for the list of articles: each article at the top a card, with the articles below it as branches.
 */
export function ArticleTree({ nodes }: { nodes: TreeNode[] }) {
  const t = useTranslations("Articles");

  return (
    <ul className="columns-1 gap-4 md:columns-2 xl:columns-3">
      {nodes.map(node => {
        const below = countBelow(node);
        const children = node.children ?? [];

        return (
          <li key={node.id} className="mb-4 break-inside-avoid rounded-lg border border-border bg-card p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-link">
                {children.length > 0 ? <BookOpen className="size-4.5" aria-hidden /> : <FileText className="size-4.5" aria-hidden />}
              </span>
              <div className="min-w-0 space-y-0.5">
                <span className="flex flex-wrap items-center gap-2">
                  <Link href={`/articles/${node.slug}`} className="wiki-heading text-base font-semibold transition-colors hover:text-link">{node.title}</Link>
                  <Marks node={node} />
                </span>
                {below > 0 && <p className="text-xs text-muted-foreground">{t("subArticles", { count: below })}</p>}
              </div>
            </div>
            {children.length > 0 && (
              children.every(known)
                ? <div className="mt-2 ml-2"><Branches nodes={children} /></div>
                : <Link href={`/articles/${node.slug}`} className="mt-2 ml-12 inline-block text-xs text-link hover:text-link/80">{t("moreBelow", { count: children.length })}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
