import { Injectable } from "@nestjs/common";

import {
  assertPermission,
  type AccessContext
} from "../../../packages/authz/src/index.ts";

import { InMemoryConfirmationQueueRepository } from "./confirmation-queue.repository.ts";
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
const UNSAFE_REF_PATTERN = /^(https?|data|blob|file):/i;
const FORBIDDEN_KEYS = new Set(
  "address body completion content customerplaintext orderid payment phone prompt raw secret telegrampayload".split(
    " "
  )
);

@Injectable()
export class ConfirmationQueueService {
  constructor(private readonly repository: InMemoryConfirmationQueueRepository) {}

  async listItems(accessContext: AccessContext, filters: ConfirmationQueueListFilters) {
    assertPermission(accessContext, "confirmation:read");
    return { items: this.repository.listItems(accessContext, filters) };
  }

  async getItemDetail(accessContext: AccessContext, itemId: string) {
    assertPermission(accessContext, "confirmation:read");
    return {
      item: this.requireItem(accessContext, itemId)
    };
  }

  async applyDecision(accessContext: AccessContext, input: ConfirmationDecisionInput) {
    assertPermission(accessContext, "confirmation:write");
    const item = this.requireItem(accessContext, input.itemId);
    validateDecision(item, input);

    const reviewedAt = input.now ?? new Date().toISOString();
    const auditDraft = createAuditDraft(accessContext, item, input, reviewedAt);
    const updated = this.repository.saveItem({
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

  private requireItem(accessContext: AccessContext, itemId: string) {
    const item = this.repository.getItem(accessContext, itemId);
    if (!item) throw new ConfirmationQueueApiError(404, "confirmation item not found");
    return item;
  }
}

export function parseConfirmationDecisionBody(
  itemId: string,
  body: unknown
): ConfirmationDecisionInput {
  const input = readRecord(body, "decision");
  rejectForbiddenKeys(input);
  rejectUnsafeRefs(input);
  const action = readDecisionAction(input.action);
  const editedPayload = optionalRecord(input, "editedPayload");
  const editedPayloadRef = optionalRef(input, "editedPayloadRef");
  if (action === "edit" && !editedPayload && !editedPayloadRef) {
    throw new ConfirmationQueueApiError(
      400,
      "edit decision requires editedPayload or editedPayloadRef"
    );
  }
  return {
    action,
    auditRef: optionalRef(input, "auditRef"),
    editedPayload,
    editedPayloadRef,
    itemId,
    now: optionalDateText(input, "now"),
    reasonRef: optionalRef(input, "reasonRef")
  };
}

function validateDecision(
  item: ConfirmationQueueItem,
  input: ConfirmationDecisionInput
) {
  if (item.status !== "pending") {
    throw new ConfirmationQueueApiError(400, "confirmation item is not pending");
  }
  if (input.action === "edit" && !input.editedPayload && !input.editedPayloadRef) {
    throw new ConfirmationQueueApiError(
      400,
      "edit decision requires editedPayload or editedPayloadRef"
    );
  }
  if (
    item.kind === "conflict_candidate" &&
    (input.action === "approve" || input.action === "edit") &&
    !hasSideBySideDiffPayload(item.diffPayload)
  ) {
    throw new ConfirmationQueueApiError(
      400,
      "conflict candidate requires side-by-side diff payload"
    );
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
    auditRef:
      input.auditRef ??
      `controlled://confirmation-queue/audit/${item.id}/${input.action}`,
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

function optionalDateText(
  source: Record<string, unknown>,
  key: string
): string | undefined {
  if (source[key] === undefined) return undefined;
  const text = readText(source[key], key);
  if (!Number.isFinite(Date.parse(text))) {
    throw new ConfirmationQueueApiError(400, `${key} must be a date`);
  }
  return text;
}

function optionalRecord(
  source: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined {
  if (source[key] === undefined) return undefined;
  const record = readRecord(source[key], key);
  if (Object.keys(record).length === 0) {
    throw new ConfirmationQueueApiError(400, `${key} must not be empty`);
  }
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
  throw new ConfirmationQueueApiError(400, "confirmation decision action is invalid");
}

function readRecord(value: unknown, name: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new ConfirmationQueueApiError(400, `${name} must be an object`);
  }
  rejectForbiddenKeys(value, name);
  return value;
}

function readRef(value: unknown, name: string): string {
  const text = readText(value, name);
  if (BASE64_INLINE_REF_PATTERN.test(text) || !REF_PATTERN.test(text)) {
    throw new ConfirmationQueueApiError(400, `${name} must be a controlled ref`);
  }
  return text;
}

function readText(value: unknown, name: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ConfirmationQueueApiError(400, `${name} is required`);
  return text;
}

function rejectForbiddenKeys(value: unknown, path = "input") {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw new ConfirmationQueueApiError(
        400,
        `${childPath} is a forbidden raw payload key`
      );
    }
    rejectForbiddenKeys(child, childPath);
  }
}

function rejectUnsafeRefs(value: unknown, path = "input") {
  if (typeof value === "string") {
    if (UNSAFE_REF_PATTERN.test(value) || BASE64_INLINE_REF_PATTERN.test(value)) {
      throw new ConfirmationQueueApiError(400, `${path} must be a controlled ref`);
    }
    return;
  }
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectUnsafeRefs(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    rejectUnsafeRefs(child, `${path}.${key}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
