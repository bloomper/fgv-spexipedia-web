import "server-only";

import { graphql } from "@/gql";
import { runMutation, runQuery } from "@/lib/graphql.server";

/*
 * Spex packages (spec 5.14): a spreadsheet and a zip that become a spex in every application. The files go over REST
 * through the web's /api/packages routes; the rest is here. EDITOR only; the server checks the role.
 */

graphql(`
  fragment SpexPackageReportFields on SpexPackageReport {
    unmatched warnings
    apps {
      app status records files created updated unchanged kept failed message webUrl
      items { kind sourceKey id outcome message warnings }
    }
  }
`);

graphql(`
  fragment SpexPackageRow on SpexPackage {
    id state fileName zipFileName zipSize zipReceived progress message uploadedByName createdAt appliedAt
    spex { id slug title year }
  }
`);

const SpexPackagesQuery = graphql(`
  query SpexPackages { spexPackages { ...SpexPackageRow } }
`);

const SpexPackageQuery = graphql(`
  query SpexPackage($id: ID!) {
    spexPackage(id: $id) {
      ...SpexPackageRow
      preview { ...SpexPackageReportFields }
      results { ...SpexPackageReportFields }
    }
  }
`);

const PreviewMutation = graphql(`mutation SpexPackagePreview($id: ID!) { spexPackagePreview(id: $id) { id state } }`);
const ApplyMutation = graphql(`mutation SpexPackageApply($id: ID!) { spexPackageApply(id: $id) { id state } }`);
const DeleteMutation = graphql(`mutation SpexPackageDelete($id: ID!) { spexPackageDelete(id: $id) }`);

export const getSpexPackages = async () => (await runQuery(SpexPackagesQuery, {}))?.spexPackages ?? [];
export const getSpexPackage = async (id: string) => (await runQuery(SpexPackageQuery, { id }))?.spexPackage ?? null;
export const spexPackagePreview = (id: string) => runMutation(PreviewMutation, { id });
export const spexPackageApply = (id: string) => runMutation(ApplyMutation, { id });
export const spexPackageDelete = (id: string) => runMutation(DeleteMutation, { id });

export type SpexPackageRowData = Awaited<ReturnType<typeof getSpexPackages>>[number];
export type SpexPackageData = NonNullable<Awaited<ReturnType<typeof getSpexPackage>>>;
export type SpexPackageReportData = NonNullable<SpexPackageData["preview"]>;
