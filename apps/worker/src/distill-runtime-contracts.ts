/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";

import {
  createDailyDistillCandidateSelection,
  createDistillOwnerAlertDraft,
  summarizeSevenDayDistillPassRate
} from "../../../packages/distill/src/index.ts";

export const distillRuntimeJobNames = {
  dailyHealth: "distill_daily_health_runtime"
} as const;
export const distillRuntimeModes = {
  disabled: "disabled",
  rlsPrismaGateway: "rls_prisma_gateway"
} as const;

type Frequency = "daily" | "paused" | "weekly";
export type DistillRuntimePlan = ReturnType<typeof createDistillRuntimePlan>;

const prismaFrequencyByRuntime = {
  daily: "DAILY",
  paused: "PAUSED",
  weekly: "WEEKLY"
} as const;
const prismaKindByRuntime = {
  conflict_candidate: "CONFLICT_CANDIDATE",
  eval_candidate: "EVAL_CANDIDATE",
  knowledge_candidate: "KNOWLEDGE_CANDIDATE",
  profile_candidate: "PROFILE_CANDIDATE"
} as const;
const controlledRefPattern = /^(controlled|manifest|storage):\/\/[^\s]+$/i;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const runtimeInputKeyPattern =
  /^(actorUserId|auditRef|businessDate|candidates|currentFrequency|dailyCounts|downshiftReasonRef|healthSummaryRef|orgId|ownerAlertRef|runId|sourceWindowEnd|sourceWindowStart|summaryRef|tenantId)$/;

export function createDistillRuntimePlan(input: any) {
  input = sanitizeDistillDailyRuntimeInput(input);
  const sourceWindowStart = timestampText(input.sourceWindowStart, "sourceWindowStart");
  const sourceWindowEnd = timestampText(input.sourceWindowEnd, "sourceWindowEnd");
  if (Date.parse(sourceWindowEnd) < Date.parse(sourceWindowStart)) {
    throw new Error("sourceWindowEnd must be after or equal to sourceWindowStart");
  }
  const selection = createDailyDistillCandidateSelection({
    auditRef: controlledRef(input.auditRef, "auditRef"),
    businessDate: businessDate(input.businessDate),
    candidateLimit: 10,
    candidates: input.candidates
  });
  const summary = summarizeSevenDayDistillPassRate({
    currentFrequency: input.currentFrequency,
    days: input.dailyCounts,
    summaryRef: controlledRef(input.summaryRef, "summaryRef")
  });
  const runId = input.runId ? uuidText(input.runId, "runId") : randomUUID();
  const ownerAlertAuditLogId = summary.downshiftRecommended ? randomUUID() : undefined;
  const ownerAlertDraft = ownerAlertAuditLogId
    ? createOwnerAlertDraft(input, ownerAlertAuditLogId)
    : undefined;
  const confirmationItems = selection.acceptedCandidates.map((candidate) =>
    confirmationItemFor(input, runId, candidate)
  );
  const current = currentDay(input);
  return {
    actorUserId: uuidText(input.actorUserId, "actorUserId"),
    businessDate: businessDate(input.businessDate),
    confirmationItems,
    distillRun: {
      candidateCount: confirmationItems.length,
      candidateLimit: selection.candidateLimit,
      frequency: input.currentFrequency,
      id: runId,
      metadata: {
        auditRef: selection.auditRef,
        truncatedCandidateRefs: selection.truncatedCandidateRefs
      },
      orgId: uuidText(input.orgId, "orgId"),
      sourceWindowEnd,
      sourceWindowStart,
      tenantId: uuidText(input.tenantId, "tenantId"),
      truncatedCount: selection.truncatedCount
    },
    healthDaily: {
      approvedCount: current.approvedCount,
      candidateCount: current.candidateCount,
      consecutiveLowPassDays: summary.consecutiveLowPassDays,
      discardedCount: current.discardedCount,
      downshiftReasonRef: summary.downshiftRecommended
        ? controlledRef(input.downshiftReasonRef, "downshiftReasonRef")
        : undefined,
      downshifted: summary.downshiftRecommended,
      frequency: summary.recommendedFrequency as Frequency,
      id: randomUUID(),
      metadata: {
        healthSummaryRef: controlledRef(input.healthSummaryRef, "healthSummaryRef"),
        ownerAlertDraft: ownerAlertDraft
          ? {
              alertRef: ownerAlertDraft.alertRef,
              auditLogId: ownerAlertAuditLogId,
              auditRef: `controlled://audit-log/${ownerAlertAuditLogId}`
            }
          : undefined,
        summaryRef: summary.summaryRef
      },
      orgId: input.orgId,
      sevenDayPassRateBps: summary.sevenDayPassRateBps,
      tenantId: input.tenantId
    },
    ownerAlertAudit: ownerAlertDraft
      ? ownerAlertAuditFor(input, ownerAlertAuditLogId!, ownerAlertDraft)
      : undefined,
    summary
  };
}

export function sanitizeDistillDailyRuntimeInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("distill runtime payload must be an object");
  const input = value as Record<string, unknown>;
  for (const key of Object.keys(input))
    if (!runtimeInputKeyPattern.test(key))
      throw new Error(`unsupported distill runtime payload key: ${key}`);
  return input;
}

export function toPrismaDistillRun(run: any) {
  const sourceWindowStart = new Date(run.sourceWindowStart);
  const sourceWindowEnd = new Date(run.sourceWindowEnd);
  return {
    ...run,
    completedAt: sourceWindowEnd,
    frequency: prismaFrequencyByRuntime[run.frequency as Frequency],
    sourceWindowEnd,
    sourceWindowStart,
    startedAt: sourceWindowStart,
    status: "COMPLETED"
  };
}

export function toPrismaConfirmationItem(item: any) {
  return {
    ...item,
    diffPayload: {},
    kind: prismaKindByRuntime[item.kind as keyof typeof prismaKindByRuntime],
    status: "PENDING"
  };
}

export function toPrismaHealthDaily(health: any, date: string) {
  return {
    ...toPrismaHealthDailyUpdate(health),
    businessDate: dateAtUtc(date),
    id: health.id,
    orgId: health.orgId,
    tenantId: health.tenantId
  };
}

export function toPrismaHealthDailyUpdate(health: any) {
  const { id, orgId, tenantId, ...data } = health;
  void id;
  void orgId;
  void tenantId;
  return {
    ...data,
    downshiftReasonRef: health.downshiftReasonRef ?? null,
    frequency: prismaFrequencyByRuntime[health.frequency as Frequency]
  };
}

export function healthDailyScope(health: any, date: string) {
  return {
    orgId_tenantId_businessDate: {
      businessDate: dateAtUtc(date),
      orgId: health.orgId,
      tenantId: health.tenantId
    }
  };
}

export function businessDate(value: unknown) {
  const text = stringValue(value, "businessDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(text))) {
    throw new Error("businessDate must be YYYY-MM-DD");
  }
  return text;
}

export function dateAtUtc(value: string) {
  return new Date(`${businessDate(value)}T00:00:00.000Z`);
}

export function uuidText(value: unknown, name: string) {
  const text = stringValue(value, name);
  if (!uuidPattern.test(text)) throw new Error(`${name} must be a UUID`);
  return text;
}

export function stringValue(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${name} is required`);
  return value.trim();
}

function confirmationItemFor(input: any, distillRunId: string, candidate: any) {
  const source = input.candidates.find(
    (item: any) => item.candidateRef === candidate.candidateRef
  );
  if (!source) throw new Error("accepted candidate source is missing");
  return {
    candidatePayload: {
      candidateRef: controlledRef(candidate.candidateRef, "candidateRef"),
      payloadRefs: readPayloadRefs(source.payloadRefs),
      sourceRef: controlledRef(candidate.sourceRef, "sourceRef")
    },
    distillRunId,
    id: source.confirmationItemId
      ? uuidText(source.confirmationItemId, "confirmationItemId")
      : randomUUID(),
    kind: candidate.kind as keyof typeof prismaKindByRuntime,
    metadata: {
      confidenceBps: candidate.confidenceBps,
      distillRunId,
      formalWrite: false
    },
    orgId: input.orgId,
    sourceRef: candidate.sourceRef,
    status: "pending",
    tenantId: input.tenantId
  };
}

function createOwnerAlertDraft(input: any, auditLogId: string) {
  return createDistillOwnerAlertDraft({
    alertRef: controlledRef(input.ownerAlertRef, "ownerAlertRef"),
    auditRequirementRef: `controlled://audit-log/${auditLogId}`,
    downshiftReasonRef: controlledRef(input.downshiftReasonRef, "downshiftReasonRef"),
    healthSummaryRef: controlledRef(input.healthSummaryRef, "healthSummaryRef"),
    recommendedFrequency: "weekly",
    tenantRef: `controlled://tenant/${uuidText(input.tenantId, "tenantId")}`
  });
}

function ownerAlertAuditFor(input: any, auditLogId: string, draft: any) {
  return {
    action: "distill_owner_alert_draft",
    actorUserId: uuidText(input.actorUserId, "actorUserId"),
    content: {
      after: draft,
      before: {
        frequency: input.currentFrequency,
        healthSummaryRef: input.healthSummaryRef
      }
    },
    eventType: "distill.owner_alert_draft",
    id: auditLogId,
    module: "distill",
    objectId: input.businessDate,
    objectType: "distill_health_daily",
    orgId: input.orgId,
    tenantId: input.tenantId,
    traceId: `distill:${input.businessDate}`
  };
}

function currentDay(input: any) {
  const day = input.dailyCounts.find(
    (entry: any) => entry.businessDate === input.businessDate
  );
  if (!day) throw new Error("dailyCounts must include businessDate");
  return day;
}

function readPayloadRefs(value: Record<string, string> | undefined) {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, ref]) => [key, controlledRef(ref, key)])
  );
}

function timestampText(value: unknown, name: string) {
  const text = stringValue(value, name);
  if (!Number.isFinite(Date.parse(text))) throw new Error(`${name} must be a date`);
  return new Date(text).toISOString();
}

export function controlledRef(value: unknown, name: string) {
  const text = stringValue(value, name);
  if (!controlledRefPattern.test(text)) throw new Error(`${name} must be controlled`);
  return text;
}
