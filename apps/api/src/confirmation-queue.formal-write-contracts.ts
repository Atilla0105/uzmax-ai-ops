import { randomUUID } from "node:crypto";

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import {
  auditEventTypes,
  configVersionStatuses,
  createAuditLogContract,
  createConfigVersionContract,
  type AuditLogContract,
  type ConfigVersionContract
} from "../../../packages/db/src/index.ts";

import type {
  ConfirmationDecisionInput,
  ConfirmationQueueItem
} from "./confirmation-queue.types.ts";

export type FormalWriteContractInput = {
  accessContext: AccessContext;
  decision: ConfirmationDecisionInput;
  item: ConfirmationQueueItem;
};
export type ConfigTarget = {
  domain: "business_config" | "feature_flag" | "template_copy";
  key: string;
  payload: Record<string, unknown>;
  targetRef: string;
};
export type PreviousConfigVersion = { id: string; version: number };
export type FormalWriteContracts = {
  auditContract: AuditLogContract;
  auditLogId: string;
  configContract: ConfigVersionContract;
  metadata: Record<string, unknown>;
  writtenAt: string;
};

export const prismaDomainByContract = {
  business_config: "BUSINESS_CONFIG",
  feature_flag: "FEATURE_FLAG",
  template_copy: "TEMPLATE_COPY"
} as const;

const TARGET_REF_PATTERN =
  /^controlled:\/\/config-version\/(business_config|feature_flag|template_copy)\/([A-Za-z0-9][A-Za-z0-9_.:-]{0,120})$/i;
const CONTROLLED_REF_PATTERN = /^(controlled|manifest|storage):\/\/[^\s]+$/i;
const prismaStatusByContract = {
  active: "ACTIVE",
  archived: "ARCHIVED",
  draft: "DRAFT",
  rolled_back: "ROLLED_BACK"
} as const;

export function readConfigTarget(input: FormalWriteContractInput): ConfigTarget {
  if (input.item.targetKind !== "config_version") {
    throw new Error("formal write targetKind must be config_version");
  }
  const targetRef = readControlledText(input.item.targetRef, "formal write targetRef");
  const match = TARGET_REF_PATTERN.exec(targetRef);
  if (!match) {
    throw new Error("formal write targetRef must be a controlled config-version ref");
  }
  const domain = match[1]!.toLowerCase() as ConfigTarget["domain"];
  const key = match[2]!;
  return {
    domain,
    key,
    payload: {
      appliedRefs: appliedRefsFor(input),
      confirmationAction: input.decision.action,
      confirmationItemId: input.item.id,
      sourceRef: readControlledText(input.item.sourceRef, "sourceRef"),
      targetRef
    },
    targetRef
  };
}

export function createFormalWriteContracts(
  input: FormalWriteContractInput,
  target: ConfigTarget,
  previous: PreviousConfigVersion | undefined
): FormalWriteContracts {
  const writtenAt = new Date().toISOString();
  const auditLogId = randomUUID();
  const version = (previous?.version ?? 0) + 1;
  const configContract = createConfigVersionContract({
    activatedAt: writtenAt,
    createdAt: writtenAt,
    createdByUserId: input.accessContext.userId,
    domain: target.domain,
    id: randomUUID(),
    key: target.key,
    orgId: input.item.orgId,
    payload: target.payload,
    previousVersionId: previous?.id,
    reason: input.decision.reasonRef,
    status: configVersionStatuses.active,
    tenantId: input.item.tenantId,
    version
  });
  const metadata = formalWriteMetadata(input, target, configContract.id, auditLogId);
  return {
    auditContract: createAuditLogContract({
      action: "formal_write_config_version",
      actorUserId: input.accessContext.userId,
      afterVersionId: configContract.id,
      beforeVersionId: previous?.id,
      content: {
        after: {
          confirmerUserId: input.accessContext.userId,
          configVersionId: configContract.id,
          diffPayload: input.item.diffPayload ?? {},
          targetKind: "config_version",
          targetRef: target.targetRef,
          version
        },
        before: {
          confirmationItemId: input.item.id,
          confirmationStatus: input.item.status,
          previousVersionId: previous?.id ?? null,
          targetRef: input.item.targetRef ?? null
        }
      },
      eventType: auditEventTypes.configVersionSaved,
      module: "confirmation_queue",
      objectId: configContract.id,
      objectType: "config_version",
      occurredAt: writtenAt,
      orgId: input.item.orgId,
      tenantId: input.item.tenantId,
      traceId: `confirmation:${input.item.id}`
    }),
    auditLogId,
    configContract,
    metadata,
    writtenAt
  };
}

export function toPrismaConfigVersionCreateData(contract: ConfigVersionContract) {
  return {
    activatedAt: contract.activatedAt ? new Date(contract.activatedAt) : null,
    createdAt: new Date(contract.createdAt),
    createdByUserId: contract.createdByUserId,
    domain: prismaDomainByContract[contract.domain],
    id: contract.id,
    key: contract.key,
    orgId: contract.orgId,
    payload: contract.payload,
    previousVersionId: contract.previousVersionId ?? null,
    reason: contract.reason ?? null,
    rollbackOfVersionId: contract.rollbackOfVersionId ?? null,
    status: prismaStatusByContract[contract.status],
    tenantId: contract.tenantId,
    version: contract.version
  };
}

export function assertConflictDiffBeforeFormalWrite(item: ConfirmationQueueItem) {
  if (
    item.kind === "conflict_candidate" &&
    !hasSideBySideDiffPayload(item.diffPayload)
  ) {
    throw new Error("formal write requires side-by-side diff payload");
  }
}

export function readPreviousConfigVersion(value: unknown): PreviousConfigVersion {
  const row = recordValue(value);
  if (!row) throw new Error("previous config version row must be an object");
  const version = Number(row.version);
  if (!Number.isInteger(version) || version < 1) {
    throw new Error("previous config version number is invalid");
  }
  return { id: readControlledUuid(row.id, "previous config version id"), version };
}

function formalWriteMetadata(
  input: FormalWriteContractInput,
  target: ConfigTarget,
  configVersionId: string,
  auditLogId: string
) {
  const decision = recordValue(input.item.metadata?.decision) ?? {};
  return {
    ...(input.item.metadata ?? {}),
    decision: {
      ...decision,
      auditLogId,
      auditRef: `controlled://audit-log/${auditLogId}`,
      formalWrite: true,
      targetKind: "config_version",
      targetRef: target.targetRef
    },
    formalWrite: {
      auditLogId,
      configVersionId,
      confirmerUserId: input.accessContext.userId,
      status: "written",
      targetKind: "config_version",
      targetRef: target.targetRef
    }
  };
}

function appliedRefsFor(input: FormalWriteContractInput) {
  if (input.decision.action === "edit" && input.decision.editedPayloadRef) {
    return {
      editedPayloadRef: readControlledText(
        input.decision.editedPayloadRef,
        "editedPayloadRef"
      )
    };
  }
  if (input.decision.action === "edit" && input.decision.editedPayload) {
    return readRefRecord(input.decision.editedPayload, "editedPayload");
  }
  return readRefRecord(input.item.candidatePayload, "candidatePayload", {
    candidateRef: input.item.sourceRef
  });
}

function readRefRecord(
  record: Record<string, unknown>,
  name: string,
  fallback?: Record<string, unknown>
): Record<string, string> {
  const refs = Object.fromEntries(
    Object.entries(record)
      .filter(([key]) => key.endsWith("Ref"))
      .map(([key, value]) => [key, readControlledText(value, `${name}.${key}`)])
  );
  if (Object.keys(refs).length > 0) return refs;
  if (fallback) return readRefRecord(fallback, name);
  throw new Error(`${name} requires refs`);
}

function hasSideBySideDiffPayload(value: unknown): boolean {
  const diff = recordValue(value);
  return Boolean(
    diff &&
    ((recordValue(diff.left) && recordValue(diff.right)) ||
      (recordValue(diff.current) && recordValue(diff.candidate)) ||
      (recordValue(diff.before) && recordValue(diff.after)))
  );
}

function readControlledText(value: unknown, name: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!CONTROLLED_REF_PATTERN.test(text)) {
    throw new Error(`${name} must be a controlled ref`);
  }
  return text;
}

function readControlledUuid(value: unknown, name: string) {
  const text = typeof value === "string" ? value.trim() : "";
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(text)) {
    throw new Error(`${name} must be a UUID`);
  }
  return text;
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
