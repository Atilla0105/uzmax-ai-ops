import { Inject, Injectable } from "@nestjs/common";
import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";

import * as c from "./group-overview.contracts.ts";
import { GROUP_OVERVIEW_PERMISSION } from "./group-overview.contracts.ts";
import type { GroupOverviewRepositoryPort } from "./group-overview.repository.ts";

@Injectable()
export class GroupOverviewService {
  constructor(
    @Inject(c.GROUP_OVERVIEW_REPOSITORY)
    private readonly repository: GroupOverviewRepositoryPort
  ) {}

  async getOverview(access: AccessContext, query: c.GroupOverviewQuery) {
    assertPermission(access, GROUP_OVERVIEW_PERMISSION);
    const window = windowFor(query.windowHours, new Date());
    if (this.repository.runtimeStatus() === "disabled") {
      return response(access, window, [], "disabled", [
        "read_model_unavailable",
        "read_model_refresh_not_configured"
      ]);
    }
    const rows = await this.repository.listTenantAggregates(access, window);
    const kind = rows.length ? "ready" : "empty";
    return response(access, window, rows, kind);
  }
}

function response(
  access: AccessContext,
  window: c.GroupOverviewWindow,
  tenants: c.GroupOverviewTenantAggregate[],
  requestedKind: "disabled" | "empty" | "ready",
  extraReasons: c.GroupOverviewSourceGap[] = []
) {
  const reasons = c.unique([
    ...extraReasons,
    ...tenants.flatMap((row) => row.degraded)
  ]);
  const kind =
    requestedKind === "ready" && reasons.length ? "partial_source" : requestedKind;
  const maxSourceUpdatedAt = maxDate(
    tenants.map((row) => row.sourceWatermark.maxSourceUpdatedAt)
  );
  const out = {
    access: c.accessSummary(access),
    generatedAt: new Date().toISOString(),
    healthSummary: summary(tenants),
    sourceWatermark: c.watermark(reasons, maxSourceUpdatedAt),
    state: c.state(kind, message(kind), reasons),
    tenants,
    window
  };
  c.assertNoForbiddenPayload(out, "groupOverview.response");
  return out;
}

function summary(rows: readonly c.GroupOverviewTenantAggregate[]) {
  return {
    abnormalTenantCount: rows.filter((row) => row.healthCategory !== "healthy").length,
    aiBreakerCount: rows.reduce((total, row) => total + row.aiBreakerCount, 0),
    channelConnectorFaultCount: null,
    modelFaultCount: null,
    orderConnectorFaultCount: null,
    redlineEventCountToday: null,
    tenantCount: rows.length
  };
}

function windowFor(windowHours: number, now: Date): c.GroupOverviewWindow {
  return {
    end: now.toISOString(),
    start: new Date(now.getTime() - windowHours * 60 * 60 * 1000).toISOString()
  };
}
function message(kind: string) {
  if (kind === "disabled") return "group overview runtime is disabled";
  if (kind === "empty") return "no authorized group overview aggregate rows";
  if (kind === "partial_source") return "group overview includes partial sources";
  return "group overview runtime is ready";
}
function maxDate(values: readonly (string | null)[]) {
  const dates = values.map((value) => Date.parse(value ?? "")).filter(Number.isFinite);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
}
