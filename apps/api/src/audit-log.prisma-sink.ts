import {
  createAuditLogContract,
  type AuditLogContract
} from "../../../packages/db/src/index.ts";

import type { ApiAuditEvent, AuditSink } from "./access-context-core.ts";

type AuditLogCreateDelegate = {
  create(args: { data: PrismaAuditLogCreateData }): Promise<unknown>;
};

export type AuditLogPrismaClientPort = {
  auditLog: AuditLogCreateDelegate;
};

export type PrismaAuditLogCreateData = {
  action: string;
  actorUserId: string;
  afterVersionId: string | null;
  beforeVersionId: string | null;
  content: AuditLogContract["content"];
  eventType: string;
  module: string;
  objectId: string | null;
  objectType: string;
  occurredAt: Date;
  orgId: string;
  tenantId: string;
  traceId: string | null;
};

export class PrismaAuditSink implements AuditSink {
  constructor(private readonly prisma: AuditLogPrismaClientPort) {}

  async record(event: ApiAuditEvent) {
    await this.prisma.auditLog.create({
      data: toPrismaAuditLogCreateData(event)
    });
  }
}

export function toPrismaAuditLogCreateData(
  event: ApiAuditEvent
): PrismaAuditLogCreateData {
  const contract = createAuditLogContract(event as AuditLogContract);
  return {
    action: contract.action,
    actorUserId: contract.actorUserId,
    afterVersionId: contract.afterVersionId ?? null,
    beforeVersionId: contract.beforeVersionId ?? null,
    content: contract.content,
    eventType: contract.eventType,
    module: contract.module,
    objectId: contract.objectId ?? null,
    objectType: contract.objectType,
    occurredAt: dateValue(contract.occurredAt),
    orgId: contract.orgId,
    tenantId: contract.tenantId,
    traceId: contract.traceId ?? null
  };
}

function dateValue(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("audit occurredAt is invalid");
  }
  return date;
}
