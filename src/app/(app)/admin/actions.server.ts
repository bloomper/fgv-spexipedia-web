"use server";

import { revalidatePath } from "next/cache";
import {
  kindMerge,
  kindRetire,
  kindSave,
  kindsReorder,
  maintenanceJobRun,
  redirectDelete,
  redirectSave,
  settingsUpdate,
  syncConsumerDelete,
  syncConsumerSave,
} from "@/lib/admin/admin.server";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import type { KindInput, KindType, KindUse, MaintenanceJob, RedirectInput, SettingsInput, SyncConsumerInput } from "@/gql/graphql";
import { isKindType, isKindUse, isSectionContent } from "@/utils/kinds";
import { ID } from "@/utils/ids";
import { withPolicyAction } from "@/utils/route.server";
import { Policies } from "@/utils/policy.server";

export async function saveSettingsAction(input: SettingsInput): Promise<ActionResult<null>> {
  return withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
    await settingsUpdate(input);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return null;
  }));
}

/**
 * Starts a maintenance job in the background. The data is false when it is already running.
 */
export async function runMaintenanceJobAction(job: MaintenanceJob): Promise<ActionResult<boolean>> {
  return withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
    const started = await maintenanceJobRun(job);
    revalidatePath("/admin/maintenance");
    return started;
  }));
}

const admin = <T, >(path: string, work: () => Promise<T>) => withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
  const result = await work();

  revalidatePath(path);
  return result;
}));

export async function saveConsumerAction(input: SyncConsumerInput): Promise<ActionResult<null>> {
  return admin("/admin/consumers", async () => {
    await syncConsumerSave(input);
    return null;
  });
}

export async function deleteConsumerAction(id: string): Promise<ActionResult<null>> {
  requireId(id);
  return admin("/admin/consumers", async () => {
    await syncConsumerDelete(id);
    return null;
  });
}

export async function saveRedirectAction(input: RedirectInput): Promise<ActionResult<null>> {
  return admin("/admin/redirects", async () => {
    await redirectSave(input);
    return null;
  });
}

export async function deleteRedirectAction(id: string): Promise<ActionResult<null>> {
  requireId(id);
  return admin("/admin/redirects", async () => {
    await redirectDelete(id);
    return null;
  });
}

// Kinds (spec 4.6): every page that shows or offers them changes, so the whole site is revalidated -------------------

const kinds = <T, >(work: () => Promise<T>) => withPolicyAction(Policies.admin.requireAdmin, () => toActionResult(async () => {
  const result = await work();

  revalidatePath("/", "layout");
  return result;
}));

function requireKindGroup(type: KindType | null | undefined, use: KindUse | null | undefined, sectionId?: string | null) {
  if ((type != null && !isKindType(type)) || (use != null && !isKindUse(use))) {
    throw new Error("Invalid kind type");
  }
  if (sectionId) {
    requireId(sectionId);
  }
}

/**
 * A new kind (no id: with its type, use for image kinds, the image section for those of use SECTION, and the content
 * for section kinds) or changes to one; aliases one per entry.
 */
export async function saveKindAction(id: string | null, input: KindInput): Promise<ActionResult<null>> {
  if (id) {
    requireId(id);
  }
  requireKindGroup(input.type, input.use, input.sectionId);
  if (input.content != null && !isSectionContent(input.content)) {
    throw new Error("Invalid content");
  }
  return kinds(async () => {
    const section = (id ? null : input.type) === "SECTION" || input.subtitleSv != null || input.subtitleEn != null;

    await kindSave(id, {
      ...(id ? {} : { type: input.type, use: input.use ?? null, sectionId: input.sectionId ?? null, content: input.content ?? null }),
      valueType: input.valueType ?? null,
      nameSv: input.nameSv.trim(),
      nameEn: input.nameEn.trim(),
      aliases: (input.aliases ?? []).map(alias => alias.trim()).filter(Boolean),
      ...(section ? { subtitleSv: input.subtitleSv?.trim().slice(0, 200) || null, subtitleEn: input.subtitleEn?.trim().slice(0, 200) || null } : {}),
    });
    return null;
  });
}

export async function reorderKindsAction(type: KindType, use: KindUse | null, ids: string[], sectionId: string | null = null): Promise<ActionResult<null>> {
  requireKindGroup(type, use, sectionId);
  ids.forEach(requireId);
  return kinds(async () => (await kindsReorder(type, use, sectionId, ids), null));
}

export async function retireKindAction(id: string, retired: boolean): Promise<ActionResult<null>> {
  requireId(id);
  return kinds(async () => (await kindRetire(id, retired), null));
}

export async function mergeKindAction(id: string, intoId: string): Promise<ActionResult<null>> {
  requireId(id);
  requireId(intoId);
  return kinds(async () => (await kindMerge(id, intoId), null));
}

function requireId(id: string) {
  if (!ID.test(id)) {
    throw new Error("Invalid id");
  }
}
