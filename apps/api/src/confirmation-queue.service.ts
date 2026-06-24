import { Injectable } from "@nestjs/common";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";

import type { ConfirmationQueueRepositoryPort } from "./confirmation-queue.repository.ts";
import {
  ConfirmationQueueApiError,
  type ConfirmationDecisionAction,
  type ConfirmationDecisionInput,
  type ConfirmationItemStatus,
  type ConfirmationQueueItem,
  type ConfirmationQueueListFilters
} from "./confirmation-queue.types.ts";

const REF_PATTERN = /^(controlled|manifest|storage):\/\/[^\s]+$/i;
const BASE64_INLINE_REF_PATTERN = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const FORBIDDEN_KEYS = new Set(
  "address blob body completion content customerplaintext data file http https orderid payment phone prompt raw secret telegrampayload".split(
    " "
  )
);

@Injectable()
export class ConfirmationQueueService {
  constructor(private readonly repository: ConfirmationQueueRepositoryPort) {}

  async listItems(accessContext: AccessContext, filters: ConfirmationQueueListFilters) {
    assertPermission(accessContext, "confirmation:read");
    return { items: await this.repository.listItems(accessContext, filters) };
  }

  async getItemDetail(accessContext: AccessContext, itemId: string) {
    assertPermission(accessContext, "confirmation:read");
    return { item: await this.requireItem(accessContext, itemId) };
  }

  async applyDecision(accessContext: AccessContext, input: ConfirmationDecisionInput) {
    assertPermission(accessContext, "confirmation:write");
    const item = await this.requireItem(accessContext, input.itemId);
    validateDecision(item, input);

    const reviewedAt = new Date().toISOString();
    const auditDraft = createAuditDraft(accessContext, item, input, reviewedAt);
    const updated = await this.repository.saveItem({
      ...item,
      metadata: {
        ...(item.metadata ?? {}),
        decision: {
          action: input.action,
          auditRef: auditDraft.auditRef,
          formalWrite: false,
          reasonRef: input.reasonRef
        },
        editedPayload: input.editedPayload,
        editedPayloadRef: input.editedPayloadRef
      },
      reviewedAt,
      reviewedByUserId: accessContext.userId,
      status: statusForDecision(input.action)
    });

    return {
      auditDraft,
      formalWrite: false,
      item: updated
    };
  }

  private async requireItem(accessContext: AccessContext, itemId: string) {
    const item = await this.repository.getItem(accessContext, itemId);
    if (!item) throw new ConfirmationQueueApiError(404, "confirmation item not found");
    return item;
  }
}

export function parseConfirmationDecisionBody(
  itemId: string,
  body: unknown
): ConfirmationDecisionInput {
  const input = readRecord(body, "decision");
  assertSafePayload(input);
  const action = readDecisionAction(input.action);
  const editedPayload = optionalRecord(input, "editedPayload");
  const editedPayloadRef = optionalRef(input, "editedPayloadRef");
  if (action === "edit" && !editedPayload && !editedPayloadRef) {
    throw badRequest("edit decision requires editedPayload or editedPayloadRef");
  }
  return {
    action,
    editedPayload,
    editedPayloadRef,
    itemId,
    reasonRef: optionalRef(input, "reasonRef")
  };
}

function validateDecision(
  item: ConfirmationQueueItem,
  input: ConfirmationDecisionInput
) {
  if (item.status !== "pending") {
    throw badRequest("confirmation item is not pending");
  }
  if (input.action === "edit" && !input.editedPayload && !input.editedPayloadRef) {
    throw badRequest("edit decision requires editedPayload or editedPayloadRef");
  }
  if (input.editedPayload) assertEditedPayload(input.editedPayload, "editedPayload");
  if (
    item.kind === "conflict_candidate" &&
    (input.action === "approve" || input.action === "edit") &&
    !hasSideBySideDiffPayload(item.diffPayload)
  ) {
    throw badRequest("conflict candidate requires side-by-side diff payload");
  }
}

function createAuditDraft(
  accessContext: AccessContext,
  item: ConfirmationQueueItem,
  input: ConfirmationDecisionInput,
  reviewedAt: string
) {
  return {
    action: input.action,
    auditRef: `controlled://confirmation-queue/audit/${item.id}/${input.action}`,
    editedPayloadRef: input.editedPayloadRef,
    formalWrite: false,
    itemId: item.id,
    orgId: item.orgId,
    reasonRef: input.reasonRef,
    reviewedAt,
    reviewerUserId: accessContext.userId,
    tenantId: item.tenantId
  };
}

function statusForDecision(action: ConfirmationDecisionAction): ConfirmationItemStatus {
  if (action === "approve") return "approved";
  if (action === "edit") return "edited";
  if (action === "discard") return "discarded";
  return "blocked";
}

function hasSideBySideDiffPayload(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    (isRecord(value.left) && isRecord(value.right)) ||
    (isRecord(value.current) && isRecord(value.candidate)) ||
    (isRecord(value.before) && isRecord(value.after))
  );
}

function optionalRecord(
  source: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined {
  if (source[key] === undefined) return undefined;
  const record = readRecord(source[key], key);
  if (Object.keys(record).length === 0) {
    throw badRequest(`${key} must not be empty`);
  }
  assertEditedPayload(record, key);
  return record;
}

function optionalRef(source: Record<string, unknown>, key: string): string | undefined {
  return source[key] === undefined ? undefined : readRef(source[key], key);
}

function readDecisionAction(value: unknown): ConfirmationDecisionAction {
  const action = readText(value, "action");
  if (["approve", "block", "discard", "edit"].includes(action)) {
    return action as ConfirmationDecisionAction;
  }
  throw badRequest("confirmation decision action is invalid");
}

function readRecord(value: unknown, name: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw badRequest(`${name} must be an object`);
  }
  return value;
}

function readRef(value: unknown, name: string): string {
  const text = readText(value, name);
  if (BASE64_INLINE_REF_PATTERN.test(text) || !REF_PATTERN.test(text)) {
    throw badRequest(`${name} must be a controlled ref`);
  }
  return text;
}

function readText(value: unknown, name: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw badRequest(`${name} is required`);
  return text;
}

function assertSafePayload(value: unknown, path = "decision") {
  if (typeof value === "string") {
    if (
      /^(https?|data|blob|file):/i.test(value) ||
      BASE64_INLINE_REF_PATTERN.test(value)
    ) {
      throw badRequest(`${path} must be a controlled ref`);
    }
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafePayload(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw badRequest(`${childPath} is a forbidden raw payload key`);
    }
    assertSafePayload(child, childPath);
  }
}

function assertEditedPayload(record: Record<string, unknown>, path: string) {
  for (const [key, child] of Object.entries(record)) {
    const childPath = `${path}.${key}`;
    if (!key.endsWith("Ref")) {
      throw badRequest(`${childPath} must be a controlled ref field`);
    }
    readRef(child, childPath);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function badRequest(message: string) {
  return new ConfirmationQueueApiError(400, message);
}
