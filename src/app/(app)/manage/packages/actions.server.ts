"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import { spexPackageApply, spexPackageDelete, spexPackagePreview } from "@/lib/packages/packages.server";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";
import { ID } from "@/utils/ids";

/*
 * What editors do with a spex package (spec 5.14). Preview and apply start background jobs on the server; the page
 * polls the package until they are done. Applying creates records in every application, so the whole site is
 * revalidated afterwards.
 */

function requireId(id: string) {
  if (!ID.test(id)) {
    throw new Error("Invalid id");
  }
}

const editor = <T>(work: () => Promise<T>): Promise<ActionResult<T>> =>
  withPolicyAction(Policies.editor.requireEditor, () =>
    toActionResult(async () => {
      const result = await work();

      revalidatePath("/", "layout");
      return result;
    })
  );

export async function previewPackageAction(id: string) {
  requireId(id);
  return editor(async () => (await spexPackagePreview(id), null));
}

export async function applyPackageAction(id: string) {
  requireId(id);
  return editor(async () => (await spexPackageApply(id), null));
}

export async function deletePackageAction(id: string) {
  requireId(id);
  return editor(async () => (await spexPackageDelete(id), null));
}
