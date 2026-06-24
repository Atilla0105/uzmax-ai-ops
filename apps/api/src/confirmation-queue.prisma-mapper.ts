import type { ConfirmationQueueItem } from "./confirmation-queue.types.ts";

export const confirmationQueuePrismaKindByApi = {
  conflict_candidate: "CONFLICT_CANDIDATE",
  eval_candidate: "EVAL_CANDIDATE",
  knowledge_candidate: "KNOWLEDGE_CANDIDATE",
  profile_candidate: "PROFILE_CANDIDATE"
} as const;

export const confirmationQueuePrismaStatusByApi = {
  approved: "APPROVED",
  blocked: "BLOCKED",
  discarded: "DISCARDED",
  edited: "EDITED",
  pending: "PENDING"
} as const;

export function toPrismaCreateData(item: ConfirmationQueueItem) {
  return cleanRecord({
    candidatePayload: item.candidatePayload,
    createdAt: new Date(item.createdAt),
    diffPayload: item.diffPayload ?? {},
    id: item.id,
    kind: confirmationQueuePrismaKindByApi[item.kind],
    metadata: metadataForPrisma(item),
    orgId: item.orgId,
    reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : undefined,
    reviewedByUserId: item.reviewedByUserId,
    sourceRef: item.sourceRef,
    status: confirmationQueuePrismaStatusByApi[item.status],
    targetKind: item.targetKind,
    targetRef: item.targetRef,
    tenantId: item.tenantId
  });
}

export function toPrismaUpdateData(item: ConfirmationQueueItem) {
  return cleanRecord({
    candidatePayload: item.candidatePayload,
    diffPayload: item.diffPayload ?? {},
    kind: confirmationQueuePrismaKindByApi[item.kind],
    metadata: metadataForPrisma(item),
    reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : null,
    reviewedByUserId: item.reviewedByUserId ?? null,
    sourceRef: item.sourceRef,
    status: confirmationQueuePrismaStatusByApi[item.status],
    targetKind: item.targetKind ?? null,
    targetRef: item.targetRef ?? null
  });
}

export function mapConfirmationItemRow(row: unknown): ConfirmationQueueItem {
  const record = recordValue(row, "row");
  const metadata = optionalRecordValue(record.metadata) ?? {};
  return cleanRecord({
    candidatePayload: recordValue(record.candidatePayload, "candidatePayload"),
    confidenceBps: optionalInteger(metadata.confidenceBps),
    createdAt: dateText(record.createdAt, "createdAt"),
    diffPayload: optionalRecordValue(record.diffPayload) ?? {},
    id: stringValue(record.id, "id"),
    kind: apiKind(record.kind),
    metadata,
    orgId: stringValue(record.orgId, "orgId"),
    reviewedAt:
      record.reviewedAt == null ? undefined : dateText(record.reviewedAt, "reviewedAt"),
    reviewedByUserId: optionalString(record.reviewedByUserId),
    sourceRef: stringValue(record.sourceRef, "sourceRef"),
    status: apiStatus(record.status),
    targetKind: optionalString(record.targetKind),
    targetRef: optionalString(record.targetRef),
    tenantId: stringValue(record.tenantId, "tenantId")
  }) as ConfirmationQueueItem;
}

function metadataForPrisma(item: ConfirmationQueueItem) {
  return cleanRecord({
    ...(item.metadata ?? {}),
    confidenceBps: item.confidenceBps
  });
}

function apiKind(value: unknown): ConfirmationQueueItem["kind"] {
  const kind = stringValue(value, "kind").toLowerCase();
  if (kind in confirmationQueuePrismaKindByApi) {
    return kind as ConfirmationQueueItem["kind"];
  }
  throw new Error("confirmation item kind is invalid");
}

function apiStatus(value: unknown): ConfirmationQueueItem["status"] {
  const status = stringValue(value, "status").toLowerCase();
  if (status in confirmationQueuePrismaStatusByApi) {
    return status as ConfirmationQueueItem["status"];
  }
  throw new Error("confirmation item status is invalid");
}

function stringValue(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`confirmation item ${name} is required`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return value == null ? undefined : stringValue(value, "optional text");
}

function optionalInteger(value: unknown): number | undefined {
  return Number.isInteger(value) ? (value as number) : undefined;
}

function dateText(value: unknown, name: string): string {
  if (value instanceof Date) return value.toISOString();
  const text = stringValue(value, name);
  if (!Number.isFinite(Date.parse(text))) {
    throw new Error(`confirmation item ${name} must be a date`);
  }
  return new Date(text).toISOString();
}

function recordValue(value: unknown, name: string): Record<string, unknown> {
  const record = optionalRecordValue(value);
  if (!record) throw new Error(`confirmation item ${name} must be an object`);
  return record;
}

function optionalRecordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function cleanRecord<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  ) as T;
}
