import { beforeEach, describe, expect, it, vi } from "vitest";
import * as admin from "@/lib/admin/admin.server";

const { runQuery, runMutation } = vi.hoisted(() => ({ runQuery: vi.fn(), runMutation: vi.fn() }));

vi.mock("@/lib/graphql.server", () => ({ runQuery, runMutation }));

describe("the admin client", () => {
  beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
  });

  it("unwraps the query results", async () => {
    runQuery.mockResolvedValueOnce({ redirects: [{ id: "r" }] });
    expect(await admin.getRedirects()).toEqual([{ id: "r" }]);

    runQuery.mockResolvedValueOnce({ auditActors: [{ id: "a" }] });
    expect(await admin.getAuditActors()).toEqual([{ id: "a" }]);
    runQuery.mockResolvedValueOnce(undefined);
    expect(await admin.getAuditActors()).toEqual([]);

    runQuery.mockResolvedValueOnce({ auditLog: { totalCount: 0 } });
    expect(await admin.getAuditLog(2, 50)).toEqual({ totalCount: 0 });
    expect(runQuery.mock.calls.at(-1)?.[1]).toEqual({ page: 2, size: 50, filter: {} });

    runQuery.mockResolvedValueOnce({ settings: { welcomeSv: "Hej" } });
    expect(await admin.getSettings()).toEqual({ welcomeSv: "Hej" });
  });

  it("sends the mutations", async () => {
    runMutation.mockResolvedValue({});
    await admin.redirectSave({ oldTitle: "Lasse-Maja", target: "/spex/1984-lasse-maja" });
    expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({
      input: { oldTitle: "Lasse-Maja", target: "/spex/1984-lasse-maja" },
    });
    await admin.syncConsumerDelete("c1");
    expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({ id: "c1" });
    await admin.settingsUpdate({ welcomeSv: "Hej" } as never);
    expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({ input: { welcomeSv: "Hej" } });
    expect(runMutation).toHaveBeenCalledTimes(3);
  });

  it("reads the maintenance jobs and starts one", async () => {
    runQuery.mockResolvedValueOnce({ maintenanceJobs: [{ job: "SEARCH_REBUILD", running: false }] });
    expect(await admin.getMaintenanceJobs()).toEqual([{ job: "SEARCH_REBUILD", running: false }]);
    runQuery.mockResolvedValueOnce(undefined);
    expect(await admin.getMaintenanceJobs()).toEqual([]);

    runMutation.mockResolvedValueOnce({ maintenanceJobRun: true });
    expect(await admin.maintenanceJobRun("UPLOAD_CLEANUP")).toBe(true);
    expect(runMutation.mock.calls.at(-1)?.[1]).toEqual({ job: "UPLOAD_CLEANUP" });
    runMutation.mockResolvedValueOnce({ maintenanceJobRun: false });
    expect(await admin.maintenanceJobRun("UPLOAD_CLEANUP")).toBe(false);
  });
});
