import { createHash, randomUUID } from "node:crypto";
import type {
  TelegramBotConversationJobPayload,
  TelegramBotOutboundDeliveryStatus,
  TelegramBotOutboundSendPort,
  TelegramBotOutboundSendResult
} from "../../../packages/channels/src/index.ts";
import {
  createTelegramBotCustomerIdentityDraft,
  createTelegramBotInboundMessageContent,
  type TelegramBotCustomerIdentityDraft,
  type TelegramBotInboundAdmissionPolicy
} from "../../../packages/channels/src/telegram-bot-inbound-contract.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import type { TelegramBotAnswerRuntime } from "./telegram-bot-answer-runtime.ts";
import { createTelegramBotTicketFollowUp } from "./telegram-bot-ticket-follow-up.ts";
type MaybePromise<T> = T | Promise<T>;
type RuntimeIds = Partial<
  Record<"conversationId" | "messageId" | "outboundMessageId" | "ticketId", string>
>;
export type RuntimeResult = RuntimeIds &
  Record<"providerUpdateId" | "traceId", string> & {
    runtimeBranch?: "answer" | "handoff";
    status: "accepted" | "deduped" | "rejected";
  };
export type ConversationDraft = RlsTenantContext & {
  channelConnectionId: string;
  externalConversationRef: string;
  id: string;
  lastMessageAt: string;
  participantExternalRef: string;
};
export type MessageDraft = RlsTenantContext &
  Record<"channelConnectionId" | "conversationId" | "id" | "occurredAt", string> & {
    content: Record<string, unknown>;
    contentKind: TelegramBotConversationJobPayload["contentKind"];
    externalMessageRef?: string;
  };
export type OutboundMessageDraft = RlsTenantContext &
  Record<"channelConnectionId" | "conversationId" | "id" | "occurredAt", string> & {
    content: Record<string, unknown>;
    contentKind: "text";
    deliveryStatus: TelegramBotOutboundDeliveryStatus;
  };
export type TicketDraft = RlsTenantContext &
  Record<"conversationId" | "id" | "summary", string>;
export type TicketEventDraft = RlsTenantContext &
  Record<"id" | "ticketId" | "traceId", string>;
export type DedupeDraft = RlsTenantContext &
  Record<"channelConnectionId" | "providerUpdateId" | "updateKind", string>;
type BasePersistInput = {
  conversation: ConversationDraft;
  customerIdentity?: TelegramBotCustomerIdentityDraft;
  dedupe: DedupeDraft;
  message: MessageDraft;
  traceId: string;
};
export type HandoffPersistInput = BasePersistInput & {
  runtimeBranch: "handoff";
  ticket: TicketDraft;
  ticketEvent: TicketEventDraft;
};
export type AnswerPersistInput = BasePersistInput & {
  outboundMessage: OutboundMessageDraft;
  recoveryTicket: TicketDraft;
  recoveryTicketEvent: TicketEventDraft;
  runtimeBranch: "answer";
};
export type RuntimePersistInput = AnswerPersistInput | HandoffPersistInput;
export type PreparationDisposition =
  | "answer_ready"
  | "deduped"
  | "delivery_uncertain"
  | "handoff"
  | "handoff_recovered"
  | "stored_for_operator";
export type PreparationResult = RuntimeResult &
  Record<"disposition", PreparationDisposition>;
type PreparedAnswerInput = Record<
  "conversationId" | "outboundMessageId" | "traceId",
  string
> & { dedupe: DedupeDraft };
export type ClaimPreparedAnswerInput = PreparedAnswerInput & {
  answerText: string;
  followUp?: { ticket: TicketDraft; ticketEvent: TicketEventDraft };
};
export type ClaimPreparedAnswerResult = RuntimeResult &
  Record<"claim", "claimed" | "suppressed">;
export type HandoffPreparedAnswerInput = PreparedAnswerInput & {
  ticket: TicketDraft;
  ticketEvent: TicketEventDraft;
};
export type FinalizePreparedAnswerInput = HandoffPreparedAnswerInput & {
  outcome: "failed" | "sent" | "uncertain";
  sendResult?: TelegramBotOutboundSendResult;
};
export type TelegramBotConversationPersistenceGateway = {
  claimPreparedAnswer?(
    input: ClaimPreparedAnswerInput
  ): MaybePromise<ClaimPreparedAnswerResult>;
  finalizePreparedAnswer?(
    input: FinalizePreparedAnswerInput
  ): MaybePromise<RuntimeResult>;
  handoffPreparedAnswer?(
    input: HandoffPreparedAnswerInput
  ): MaybePromise<RuntimeResult>;
  persistAcceptedUpdate(input: RuntimePersistInput): MaybePromise<RuntimeResult>;
  prepareAcceptedUpdate?(input: RuntimePersistInput): MaybePromise<PreparationResult>;
};
export type TelegramBotConversationRuntimeOptions = {
  admissionPolicy?: TelegramBotInboundAdmissionPolicy;
  answerRuntime?: TelegramBotAnswerRuntime;
  sendPort?: TelegramBotOutboundSendPort;
};
export async function processAdmittedTelegramBotConversationJob(
  payload: TelegramBotConversationJobPayload,
  gateway: TelegramBotConversationPersistenceGateway,
  options: TelegramBotConversationRuntimeOptions
): Promise<RuntimeResult> {
  const drafts = createInboundDrafts(payload);
  const answerable = canAttemptAnswer(payload, options);
  if (!answerable) {
    const handoff = createHandoffPersistInput(
      drafts,
      payload,
      "requires_operator_review"
    );
    return gateway.prepareAcceptedUpdate
      ? gateway.prepareAcceptedUpdate(handoff)
      : gateway.persistAcceptedUpdate(handoff);
  }
  if (!hasDurableAnswerFence(gateway)) {
    return gateway.persistAcceptedUpdate(
      createHandoffPersistInput(drafts, payload, "answer_ownership_fence_unavailable")
    );
  }
  const preparation = createAnswerPersistInput(drafts, payload);
  const prepared = await gateway.prepareAcceptedUpdate(preparation);
  if (prepared.disposition !== "answer_ready") return prepared;
  return processPreparedAnswer(payload, preparation, prepared, gateway, options);
}
async function processPreparedAnswer(
  payload: TelegramBotConversationJobPayload,
  preparation: AnswerPersistInput,
  prepared: PreparationResult,
  gateway: RequiredAnswerFence,
  options: TelegramBotConversationRuntimeOptions & {
    answerRuntime: TelegramBotAnswerRuntime;
    sendPort: TelegramBotOutboundSendPort;
  }
): Promise<RuntimeResult> {
  const canonical = {
    ...preparation.conversation,
    id: requiredText(prepared.conversationId, "prepared conversation id")
  };
  let answer;
  try {
    answer = await options.answerRuntime.answer(answerRequest(payload));
  } catch {
    return gateway.handoffPreparedAnswer(
      preparedHandoff(preparation, canonical, payload, "answer_runtime_error")
    );
  }
  if (answer.status !== "answered") {
    return gateway.handoffPreparedAnswer(
      preparedHandoff(preparation, canonical, payload, answer.reasonCode)
    );
  }
  const answerText = requiredText(answer.answerText, "answer text").slice(0, 4096);
  const followUp = answer.followUp
    ? createTelegramBotTicketFollowUp({
        conversation: canonical,
        payload,
        reasonCode: answer.followUp.reasonCode
      })
    : undefined;
  const claim = await gateway.claimPreparedAnswer({
    answerText,
    conversationId: canonical.id,
    dedupe: preparation.dedupe,
    followUp,
    outboundMessageId: preparation.outboundMessage.id,
    traceId: payload.traceId
  });
  if (claim.claim === "suppressed") return claim;
  const failure = createTelegramBotTicketFollowUp({
    conversation: canonical,
    payload,
    reasonCode: "telegram_outbound_failed_or_uncertain"
  });
  const finalize = {
    conversationId: canonical.id,
    dedupe: preparation.dedupe,
    outboundMessageId: preparation.outboundMessage.id,
    ...failure,
    traceId: payload.traceId
  };
  try {
    const sendResult = await options.sendPort.sendMessage(
      sendRequest(payload, answerText)
    );
    return gateway.finalizePreparedAnswer({
      ...finalize,
      outcome:
        sendResult.status === "SENT"
          ? "sent"
          : sendResult.status === "FAILED"
            ? "failed"
            : "uncertain",
      sendResult
    });
  } catch {
    return gateway.finalizePreparedAnswer({
      ...finalize,
      outcome: "uncertain"
    });
  }
}
type RequiredAnswerFence = Required<TelegramBotConversationPersistenceGateway>;
function hasDurableAnswerFence(
  gateway: TelegramBotConversationPersistenceGateway
): gateway is RequiredAnswerFence {
  return Boolean(
    gateway.prepareAcceptedUpdate &&
    gateway.claimPreparedAnswer &&
    gateway.finalizePreparedAnswer &&
    gateway.handoffPreparedAnswer
  );
}
function createInboundDrafts(payload: TelegramBotConversationJobPayload) {
  const occurredAt = payload.occurredAt ?? payload.enqueuedAt;
  const conversationId = randomUUID();
  return {
    conversation: {
      channelConnectionId: payload.channelConnectionId,
      externalConversationRef:
        payload.chatExternalRef ?? `telegram:update:${payload.providerUpdateId}`,
      id: conversationId,
      lastMessageAt: occurredAt,
      orgId: payload.orgId,
      participantExternalRef: payload.participantExternalRef ?? "telegram:user:unknown",
      tenantId: payload.tenantId
    },
    customerIdentity: createTelegramBotCustomerIdentityDraft(payload),
    dedupe: {
      channelConnectionId: payload.channelConnectionId,
      orgId: payload.orgId,
      providerUpdateId: payload.providerUpdateId,
      tenantId: payload.tenantId,
      updateKind: payload.updateKind
    },
    message: {
      channelConnectionId: payload.channelConnectionId,
      content: createTelegramBotInboundMessageContent(payload),
      contentKind: payload.contentKind,
      conversationId,
      externalMessageRef: payload.messageExternalRef,
      id: randomUUID(),
      occurredAt,
      orgId: payload.orgId,
      tenantId: payload.tenantId
    }
  } satisfies Omit<BasePersistInput, "traceId">;
}
function createAnswerPersistInput(
  drafts: Omit<BasePersistInput, "traceId">,
  payload: TelegramBotConversationJobPayload
): AnswerPersistInput {
  const recovery = createTelegramBotTicketFollowUp({
    conversation: drafts.conversation,
    payload,
    reasonCode: "answer_retry_recovered"
  });
  return {
    ...drafts,
    outboundMessage: {
      channelConnectionId: payload.channelConnectionId,
      content: {
        dispatchPhase: "generating",
        runtimeOrigin: "telegram_bot_ai"
      },
      contentKind: "text",
      conversationId: drafts.conversation.id,
      deliveryStatus: "QUEUED",
      id: deterministicIntentId(payload),
      occurredAt: drafts.message.occurredAt,
      orgId: payload.orgId,
      tenantId: payload.tenantId
    },
    recoveryTicket: recovery.ticket,
    recoveryTicketEvent: recovery.ticketEvent,
    runtimeBranch: "answer",
    traceId: payload.traceId
  };
}
export function createHandoffPersistInput(
  drafts: Omit<BasePersistInput, "traceId">,
  payload: TelegramBotConversationJobPayload,
  reasonCode: string
): HandoffPersistInput {
  return {
    ...drafts,
    ...createTelegramBotTicketFollowUp({
      conversation: drafts.conversation,
      payload,
      reasonCode
    }),
    runtimeBranch: "handoff",
    traceId: payload.traceId
  };
}
function preparedHandoff(
  preparation: AnswerPersistInput,
  conversation: ConversationDraft,
  payload: TelegramBotConversationJobPayload,
  reasonCode: string
): HandoffPreparedAnswerInput {
  return {
    conversationId: conversation.id,
    dedupe: preparation.dedupe,
    outboundMessageId: preparation.outboundMessage.id,
    ...createTelegramBotTicketFollowUp({ conversation, payload, reasonCode }),
    traceId: payload.traceId
  };
}
function canAttemptAnswer(
  payload: TelegramBotConversationJobPayload,
  options: TelegramBotConversationRuntimeOptions
): options is TelegramBotConversationRuntimeOptions & {
  answerRuntime: TelegramBotAnswerRuntime;
  sendPort: TelegramBotOutboundSendPort;
} {
  return Boolean(
    payload.contentKind === "text" &&
    payload.text?.trim() &&
    payload.chatExternalRef?.trim() &&
    options.answerRuntime &&
    options.sendPort
  );
}
function answerRequest(payload: TelegramBotConversationJobPayload) {
  return {
    channelConnectionId: payload.channelConnectionId,
    chatExternalRef: payload.chatExternalRef,
    orgId: payload.orgId,
    providerUpdateId: payload.providerUpdateId,
    tenantId: payload.tenantId,
    text: requiredText(payload.text, "telegram bot text"),
    traceId: payload.traceId
  };
}
function sendRequest(payload: TelegramBotConversationJobPayload, answerText: string) {
  return {
    channelConnectionId: payload.channelConnectionId,
    chatExternalRef: requiredText(payload.chatExternalRef, "chatExternalRef"),
    idempotencyKey: `telegram-bot-answer__${payload.orgId}__${payload.tenantId}__${payload.channelConnectionId}__${payload.providerUpdateId}`,
    orgId: payload.orgId,
    replyToMessageExternalRef: payload.messageExternalRef,
    tenantId: payload.tenantId,
    text: answerText,
    traceId: payload.traceId
  };
}
function deterministicIntentId(payload: TelegramBotConversationJobPayload) {
  return hashedUuid(
    `uzmax:telegram-bot-ai-intent:v1${payload.orgId}${payload.tenantId}${payload.channelConnectionId}${payload.providerUpdateId}`
  );
}
export function deterministicCustomerIdentityUuid(
  kind: string,
  input: TelegramBotCustomerIdentityDraft
) {
  return hashedUuid(
    Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex"),
    `urn:uzmax:${kind}:${input.orgId}:${input.tenantId}:${input.provider}:${input.externalSubjectRef}`
  );
}
function hashedUuid(...chunks: (Buffer | string)[]) {
  const bytes = chunks
    .reduce((hash, chunk) => hash.update(chunk), createHash("sha1"))
    .digest()
    .subarray(0, 16);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const value = bytes.toString("hex");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}
function requiredText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} is required`);
  return value.trim();
}
