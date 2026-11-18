import { redirect } from "next/navigation";

/**
 * Spexregister links its editors here; the record is edited in the base data list.
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/manage/base-data?edit=${encodeURIComponent((await params).id)}&tab=task-categories`);
}
