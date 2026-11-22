import "server-only";

import { graphql } from "@/gql";
import { runMutation, runQuery } from "@/lib/graphql.server";
import type { AuditFilter, KindInput, KindType, KindUse, MaintenanceJob, SettingsInput, SyncConsumerInput, RedirectInput } from "@/gql/graphql";

const AuditLogQuery = graphql(`
    query AuditLog($page: Int!, $size: Int!, $filter: AuditFilter) {
        auditLog(page: $page, size: $size, filter: $filter) {
            totalCount page size
            entries { id at actorId actorName action entityType entityId summary }
        }
    }
`);
const AuditActorsQuery = graphql(`
    query AuditActors { auditActors { id name } }
`);
const SettingsQuery = graphql(`
    query Settings {
        settings {
            welcomeSv welcomeEn publicWelcomeSv publicWelcomeEn contactEmail lastModifiedAt
        }
    }
`);
const SettingsUpdateMutation = graphql(`
    mutation SettingsUpdate($input: SettingsInput!) { settingsUpdate(input: $input) { lastModifiedAt } }
`);
const MaintenanceJobsQuery = graphql(`
    query MaintenanceJobs { maintenanceJobs { job schedule running lastStartedAt lastFinishedAt lastSucceeded } }
`);
const MaintenanceJobRunMutation = graphql(`
    mutation MaintenanceJobRun($job: MaintenanceJob!) { maintenanceJobRun(job: $job) }
`);
const SyncConsumersQuery = graphql(`
    query SyncConsumers {
        syncConsumers { id name clientId notifyUrl enabled acknowledged acknowledgedAt lag lastNotifiedAt lastError }
    }
`);
const SyncConsumerSaveMutation = graphql(`
    mutation SyncConsumerSave($input: SyncConsumerInput!) { syncConsumerSave(input: $input) { id } }
`);
const SyncConsumerDeleteMutation = graphql(`
    mutation SyncConsumerDelete($id: ID!) { syncConsumerDelete(id: $id) }
`);
const RedirectsQuery = graphql(`
    query Redirects { redirects { id oldTitle target } }
`);
const RedirectSaveMutation = graphql(`
    mutation RedirectSave($input: RedirectInput!) { redirectSave(input: $input) { id } }
`);
const RedirectDeleteMutation = graphql(`
    mutation RedirectDelete($id: ID!) { redirectDelete(id: $id) }
`);

export const getAuditLog = async (page: number, size: number, filter: AuditFilter = {}) =>
  (await runQuery(AuditLogQuery, { page, size, filter }))?.auditLog;
export const getAuditActors = async () => (await runQuery(AuditActorsQuery, {}))?.auditActors ?? [];
export const getSettings = async () => (await runQuery(SettingsQuery, {}))?.settings;
export const settingsUpdate = (input: SettingsInput) => runMutation(SettingsUpdateMutation, { input });
export const getMaintenanceJobs = async () => (await runQuery(MaintenanceJobsQuery, {}))?.maintenanceJobs ?? [];
export const maintenanceJobRun = async (job: MaintenanceJob) =>
  Boolean((await runMutation(MaintenanceJobRunMutation, { job }))?.maintenanceJobRun);
export const getSyncConsumers = async () => (await runQuery(SyncConsumersQuery, {}))?.syncConsumers ?? [];
export const syncConsumerSave = (input: SyncConsumerInput) => runMutation(SyncConsumerSaveMutation, { input });
export const syncConsumerDelete = (id: string) => runMutation(SyncConsumerDeleteMutation, { id });
export const getRedirects = async () => (await runQuery(RedirectsQuery, {}))?.redirects ?? [];
export const redirectSave = (input: RedirectInput) => runMutation(RedirectSaveMutation, { input });
export const redirectDelete = (id: string) => runMutation(RedirectDeleteMutation, { id });

// Kinds (spec 4.6) ---------------------------------------------------------------------------------------------------------

const KindsQuery = graphql(`
    query AdminKinds($type: KindType!, $use: KindUse, $sectionId: ID) {
        kinds(type: $type, use: $use, sectionId: $sectionId, includeRetired: true) {
            id type use valueType content name nameSv nameEn subtitleSv subtitleEn aliases position retired
        }
    }
`);
const KindSaveMutation = graphql(`
    mutation KindSave($id: ID, $input: KindInput!) { kindSave(id: $id, input: $input) { id } }
`);
const KindsReorderMutation = graphql(`
    mutation KindsReorder($type: KindType!, $use: KindUse, $sectionId: ID, $ids: [ID!]!) { kindsReorder(type: $type, use: $use, sectionId: $sectionId, ids: $ids) { id } }
`);
const KindRetireMutation = graphql(`
    mutation KindRetire($id: ID!, $retired: Boolean!) { kindRetire(id: $id, retired: $retired) { id } }
`);
const KindMergeMutation = graphql(`
    mutation KindMerge($id: ID!, $intoId: ID!) { kindMerge(id: $id, intoId: $intoId) { id } }
`);

/** Every kind of a type (and, for image kinds, a use and maybe an image section), retired ones included, in order. */
export const getKinds = async (type: KindType, use: KindUse | null = null, sectionId: string | null = null) =>
  (await runQuery(KindsQuery, { type, use, sectionId }))?.kinds ?? [];
export const kindSave = (id: string | null, input: KindInput) => runMutation(KindSaveMutation, { id, input });
export const kindsReorder = (type: KindType, use: KindUse | null, sectionId: string | null, ids: string[]) =>
  runMutation(KindsReorderMutation, { type, use, sectionId, ids });
export const kindRetire = (id: string, retired: boolean) => runMutation(KindRetireMutation, { id, retired });
export const kindMerge = (id: string, intoId: string) => runMutation(KindMergeMutation, { id, intoId });

export type AdminKind = Awaited<ReturnType<typeof getKinds>>[number];
