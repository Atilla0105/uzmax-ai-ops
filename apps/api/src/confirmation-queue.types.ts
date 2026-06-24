import type { AccessContext } from "../../../packages/authz/src/index.ts";

export type ConfirmationItemKind =
  | "conflict_candidate"
  | "eval_candidate"
  | "knowledge_candidate"
  | "profile_candidate";

export type ConfirmationItemStatus =
  | "approved"
  | "blocked"
  | "discarded"
  | "edited"
  | "pending";

export type ConfirmationDecisionAction = "approve" | "block" | "discard" | "edit";

export type ConfirmationQueueItem = Record<
  "createdAt" | "id" | "orgId" | "sourceRef" | "tenantId",
  string
> & {
  auditLogId?: string;
  candidatePayload: Record<string, unknown>;
  confidenceBps?: number;
  diffPayload?: Record<string, unknown>;
  kind: ConfirmationItemKind;
  metadata?: Record<string, unknown>;
  reviewedAt?: string;
  reviewedByUserId?: string;
  status: ConfirmationItemStatus;
  targetKind?: string;
  targetRef?: string;
};

export type ConfirmationQueueListFilters = {
  kind?: ConfirmationItemKind;
  status?: ConfirmationItemStatus;
};

export type ConfirmationDecisionInput = {
  action: ConfirmationDecisionAction;
  editedPayload?: Record<string, unknown>;
  editedPayloadRef?: string;
  itemId: string;
  reasonRef?: string;
};

export type ApiRequestWithContext = { accessContext?: AccessContext };

export class ConfirmationQueueApiError extends Error {
  constructor(
    readonly statusCode: 400 | 403 | 404,
    message: string
  ) {
    super(message);
    this.name = "ConfirmationQueueApiError";
  }
}
