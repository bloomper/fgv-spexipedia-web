"use server";

import { revalidatePath } from "next/cache";
import {
  maintenanceJobRun,
  redirectDelete,
  redirectSave,
  settingsUpdate,
  syncConsumerDelete,
  syncConsumerSave,
} from "@/lib/admin/admin.server";
import { type ActionResult, toActionResult } from "@/lib/graphql.server";
import type { MaintenanceJob, RedirectInput, SettingsInput, SyncConsumerInput } from "@/gql/graphql";
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

function requireId(id: string) {
  if (!ID.test(id)) {
    throw new Error("Invalid id");
  }
}
