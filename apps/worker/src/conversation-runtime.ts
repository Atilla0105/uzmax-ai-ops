import { Worker, type Job, type QueueOptions } from "bullmq";
import {
  telegramBotConversationQueueDefaults,
  type TelegramBotConversationJobPayload
} from "../../../packages/channels/src/index.ts";
import {
  assertTelegramBotInboundPayload,
  isTelegramBotInboundAllowed
} from "../../../packages/channels/src/telegram-bot-inbound-contract.ts";
import {
  processAdmittedTelegramBotConversationJob,
  type DedupeDraft,
  type FinalizePreparedAnswerInput,
  type PreparationResult,
  type RuntimePersistInput,
  type RuntimeResult,
  type TelegramBotConversationPersistenceGateway,
  type TelegramBotConversationRuntimeOptions
} from "./telegram-bot-conversation.flow.ts";
type ConversationRow = Record<string, unknown>;
type ConversationDisposition = "bot" | "closed" | "operator";
type DispositionResolver = (
  ticket: ConversationRow | undefined,
  allowPendingWithoutTicket: boolean
) => ConversationDisposition | undefined;
export type * from "./telegram-bot-conversation.flow.ts";
type RuntimeJob = Job<
  TelegramBotConversationJobPayload,
  RuntimeResult,
  typeof telegramBotConversationQueueDefaults.jobName
>;
export async function processTelegramBotConversationJob(
  payload: TelegramBotConversationJobPayload,
  gateway: TelegramBotConversationPersistenceGateway,
  options: TelegramBotConversationRuntimeOptions = {}
): Promise<RuntimeResult> {
  assertTelegramBotInboundPayload(payload);
  if (!isTelegramBotInboundAllowed(payload, options.admissionPolicy)) {
    return {
      providerUpdateId: payload.providerUpdateId,
      status: "rejected",
      traceId: payload.traceId
    };
  }
  return processAdmittedTelegramBotConversationJob(payload, gateway, options);
}

export function createTelegramBotConversationBullmqProcessor(
  gateway: TelegramBotConversationPersistenceGateway,
  options: TelegramBotConversationRuntimeOptions
) {
  if (!options?.admissionPolicy) {
    throw new Error("telegram bot inbound admission policy is required");
  }
  return (job: RuntimeJob) => {
    if (job.name !== telegramBotConversationQueueDefaults.jobName) {
      throw new Error("telegram bot conversation job name is unsupported");
    }
    return processTelegramBotConversationJob(job.data, gateway, options);
  };
}

export function createTelegramBotConversationBullmqWorker(options: {
  connection: QueueOptions["connection"];
  gateway: TelegramBotConversationPersistenceGateway;
  prefix?: string;
  queueName?: string;
  runtimeOptions: TelegramBotConversationRuntimeOptions;
}) {
  return new Worker(
    options.queueName ?? telegramBotConversationQueueDefaults.queueName,
    createTelegramBotConversationBullmqProcessor(
      options.gateway,
      options.runtimeOptions
    ),
    { connection: options.connection, prefix: options.prefix }
  );
}

export function preparationResult(
  input: RuntimePersistInput,
  disposition: PreparationResult["disposition"],
  conversationId?: string,
  ids: { outboundMessageId?: string; ticketId?: string } = {}
): PreparationResult {
  return {
    ...runtimeResult(input, disposition === "answer_ready" ? "answer" : "handoff", ids),
    ...(conversationId ? { conversationId } : {}),
    disposition,
    status: disposition === "deduped" ? "deduped" : "accepted"
  };
}

export function runtimeResult(
  input: { dedupe: DedupeDraft; traceId: string },
  runtimeBranch: "answer" | "handoff",
  ids: { outboundMessageId?: string; ticketId?: string } = {}
): RuntimeResult {
  return {
    ...ids,
    providerUpdateId: input.dedupe.providerUpdateId,
    runtimeBranch,
    status: "accepted",
    traceId: input.traceId
  };
}

export function isUnownedOpen(ticket: ConversationRow | undefined) {
  return matchesOwnership(ticket, ["OPEN"], false, false);
}

function isAssignedOnly(ticket: ConversationRow | undefined) {
  return matchesOwnership(ticket, ["CLAIMED", "REOPENED"], true, false);
}

function isFullyOwned(ticket: ConversationRow | undefined) {
  return matchesOwnership(ticket, ["LOCKED", "ESCALATED"], true, true);
}

function matchesOwnership(
  ticket: ConversationRow | undefined,
  statuses: string[],
  assigned: boolean,
  locked: boolean
) {
  return Boolean(
    ticket &&
    statuses.includes(String(ticket.status)) &&
    Boolean(ticket.assignedUserId) === assigned &&
    Boolean(ticket.lockedByUserId) === locked
  );
}

const dispositionByStatus: Record<string, DispositionResolver> = {
  CLOSED: (ticket) => (!ticket ? "closed" : undefined),
  HANDOFF: (ticket) =>
    ticket && (isAssignedOnly(ticket) || isFullyOwned(ticket)) ? "operator" : undefined,
  OPEN: (ticket) =>
    !ticket || isUnownedOpen(ticket)
      ? "bot"
      : isAssignedOnly(ticket)
        ? "operator"
        : undefined,
  PENDING_HANDOFF: (ticket, allowPendingWithoutTicket) =>
    !ticket && allowPendingWithoutTicket
      ? "bot"
      : isUnownedOpen(ticket) || isAssignedOnly(ticket)
        ? "operator"
        : undefined
};

export function conversationDisposition(
  conversation: ConversationRow,
  tickets: ConversationRow[],
  allowPendingWithoutTicket = false
): ConversationDisposition {
  if (tickets.length > 1) throw ownershipConflict();
  const status = requiredRowText(conversation.status, "conversation status");
  const disposition = dispositionByStatus[status]?.(
    tickets[0],
    allowPendingWithoutTicket
  );
  if (!disposition) throw ownershipConflict();
  return disposition;
}

export function finalizedIntentMutation(
  input: FinalizePreparedAnswerInput,
  previousContent: Record<string, unknown>
) {
  const outcome = finalOutcome[input.outcome];
  const provider = input.sendResult;
  const content = { ...previousContent };
  delete content.deliveryUncertain;
  return {
    content: {
      ...content,
      ...(provider && {
        dryRun: provider.dryRun,
        providerMessageRef: provider.providerMessageRef,
        requestId: provider.requestId
      }),
      ...outcome.content
    },
    deliveryStatus: outcome.deliveryStatus,
    ...(provider && {
      externalMessageRef: provider.providerMessageRef,
      occurredAt: new Date(provider.sentAt)
    })
  };
}

const finalOutcome = {
  failed: { content: { dispatchPhase: "terminal" }, deliveryStatus: "FAILED" },
  sent: { content: { dispatchPhase: "terminal" }, deliveryStatus: "SENT" },
  uncertain: {
    content: { deliveryUncertain: true, dispatchPhase: "uncertain" },
    deliveryStatus: "QUEUED"
  }
} as const;

function requiredRowText(value: unknown, label: string) {
  if (typeof value !== "string" || !value) throw new Error(`${label} is invalid`);
  return value;
}

function ownershipConflict() {
  return new Error("conversation ownership conflict");
}
