import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { withPolicyPage } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { getBaseData, getBookEdit, getBookKinds } from "@/lib/wiki/edit.server";
import { privateMetadata } from "@/lib/wiki/metadata.server";
import { PageHeader } from "@/components/page-header";
import { BookEditor } from "@/components/wiki/manage/book-editor.client";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return privateMetadata((await getTranslations("ManageBooks"))("editTitle"));
}

/**
 * Editing a book: its facts, cover and songs.
 */
export default async function ManageBookPage({ params }: Props) {
  return withPolicyPage(Policies.editor.requireEditor, async () => {
    const { id } = await params;
    const [t, book, base, kinds] = await Promise.all([getTranslations("ManageBooks"), getBookEdit(id), getBaseData(), getBookKinds()]);

    if (!book) {
      notFound();
    }
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeader title={book.title} description={t("editDescription")} />
        <BookEditor book={book} kinds={kinds} spex={(base?.spexAll ?? []).filter(s => !s.retired).map(s => ({ id: s.id, label: `${s.year} ${s.title}` }))} />
      </div>
    );
  });
}
