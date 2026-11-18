import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBooks } from "@/lib/wiki/wiki.server";
import { getBookKinds } from "@/lib/wiki/edit.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { NewBookForm } from "@/components/wiki/manage/book-editor.client";

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("ManageBooks"))("title"));
}

/**
 * Every book, published or not, and a new one.
 */
export default async function ManageBooksPage() {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const [t, books, kinds] = await Promise.all([getTranslations("ManageBooks"), getBooks(), getBookKinds()]);

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={t("title")} description={t("intro")} />
        <NewBookForm kinds={kinds} />
        {books.length > 0 && (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card text-sm">
            {books.map(book => (
              <li key={book.id} className="link-row flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="w-10 text-muted-foreground">{book.volume ?? "–"}</span>
                <Link href={`/manage/books/${book.id}`} className="row-link font-medium">{book.title}</Link>
                <span className="text-xs text-muted-foreground">{book.kind.name}</span>
                {!book.published && <Badge variant="outline">{t("unpublished")}</Badge>}
                {book.publishedYear && <span className="ml-auto text-xs text-muted-foreground">{book.publishedYear}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  });
}
