import { randomUUID } from "node:crypto";

import { Worker, type Job, type QueueOptions } from "bullmq";

import {
  createHumanHandoff,
  createTicketState
} from "../../../packages/capabilities/handoff/src/index.ts";
import type { RlsTenantContext } from "../../../packages/db/src/index.ts";
import {
  telegramBotConversationQueueDefaults,
  type TelegramBotConversationJobPayload,
  type TelegramBotOutboundDeliveryStatus,
  type TelegramBotOutboundSendPort,
  type TelegramBotOutboundSendResult
} from "../../../packages/channels/src/index.ts";
import type { TelegramBotAnswerRuntime } from "./telegram-bot-answer-runtime.ts";

type MaybePromise<T> = T | Promise<T>;
type RuntimeStatus = "accepted" | "deduped";
type RuntimeBranch = "answer" | "handoff";
type RuntimeIds = Partial<
  Record<"conversationId" | "messageId" | "outboundMessageId" | "ticketId", string>
>;
export type RuntimeResult = RuntimeIds &
  Record<"providerUpdateId" | "traceId", string> & {
    runtimeBranch?: RuntimeBranch;
    status: RuntimeStatus;
  };
type RuntimeDedupeResult = Record<"providerUpdateId" | "traceId", string> & {
  status: "deduped" | "reserved";
};

export type RuntimePersistInput = AnswerPersistInput | HandoffPersistInput;
type BasePersistInput = {
  conversation: ConversationDraft;
  dedupe: DedupeDraft;
  message: MessageDraft;
  runtimeBranch: RuntimeBranch;
  traceId: string;
};
type HandoffPersistInput = BasePersistInput & {
  runtimeBranch: "handoff";
  ticket: TicketDraft;
  ticketEvent: TicketEventDraft;
};
type AnswerPersistInput = BasePersistInput & {
  outboundMessage: OutboundMessageDraft;
  runtimeBranch: "answer";
};

type ConversationDraft = RlsTenantContext & {
  channelConnectionId: string;
  externalConversationRef: string;
  id: string;
  lastMessageAt: string;
  participantExternalRef: string;
};
type MessageDraft = RlsTenantContext & {
  channelConnectionId: string;
  content: Record<string, unknown>;
  contentKind: TelegramBotConversationJobPayload["contentKind"];
  conversationId: string;
  externalMessageRef?: string;
  id: string;
  occurredAt: string;
};
type OutboundMessageDraft = RlsTenantContext & {
  channelConnectionId: string;
  content: Record<string, unknown>;
  contentKind: "text";
  conversationId: string;
  deliveryStatus: TelegramBotOutboundDeliveryStatus;
  externalMessageRef?: string;
  id: string;
  occurredAt: string;
};
type TicketDraft = RlsTenantContext &
  Record<"conversationId" | "id" | "summary", string>;
type TicketEventDraft = RlsTenantContext &
  Record<"id" | "ticketId" | "traceId", string>;
export type DedupeDraft = RlsTenantContext &
  Record<"channelConnectionId" | "providerUpdateId" | "updateKind", string> & {
    reserved?: boolean;
  };

export type TelegramBotConversationPersistenceGateway = {
  persistAcceptedUpdate(input: RuntimePersistInput): MaybePromise<RuntimeResult>;
  reserveProviderUpdate?(
    input: DedupeDraft & { traceId: string }
  ): MaybePromise<RuntimeDedupeResult>;
};

export type TelegramBotConversationRuntimeOptions = {
  answerRuntime?: TelegramBotAnswerRuntime;
  sendPort?: TelegramBotOutboundSendPort;
};

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
  assertPayload(payload);
  const occurredAt = payload.occurredAt ?? payload.enqueuedAt;
  const conversationId = randomUUID();
  const messageId = randomUUID();
  const conversation = {
    channelConnectionId: payload.channelConnectionId,
    externalConversationRef:
      payload.chatExternalRef ?? `telegram:update:${payload.providerUpdateId}`,
    id: conversationId,
    lastMessageAt: occurredAt,
    orgId: payload.orgId,
    participantExternalRef: payload.participantExternalRef ?? "telegram:user:unknown",
    tenantId: payload.tenantId
  };
  const dedupe = {
    channelConnectionId: payload.channelConnectionId,
    orgId: payload.orgId,
    providerUpdateId: payload.providerUpdateId,
    tenantId: payload.tenantId,
    updateKind: payload.updateKind
  };
  const message = {
    channelConnectionId: payload.channelConnectionId,
    content: safeMessageContent(payload),
    contentKind: payload.contentKind,
    conversationId,
    externalMessageRef: payload.messageExternalRef,
    id: messageId,
    occurredAt,
    orgId: payload.orgId,
    tenantId: payload.tenantId
  };

  if (canAttemptAnswer(payload, options)) {
    if (!gateway.reserveProviderUpdate) {
      return gateway.persistAcceptedUpdate(
        createHandoffPersistInput({
          conversation,
          dedupe,
          message,
          payload,
          reasonCode: "answer_dedupe_reserve_unavailable"
        })
      );
    }

    const reserve = await gateway.reserveProviderUpdate({
      ...dedupe,
      traceId: payload.traceId
    });
    if (reserve.status === "deduped") {
      return {
        providerUpdateId: payload.providerUpdateId,
        runtimeBranch: "answer",
        status: "deduped",
        traceId: payload.traceId
      };
    }

    const reservedDedupe = { ...dedupe, reserved: true };
    try {
      const answer = await options.answerRuntime.answer({
        providerUpdateId: payload.providerUpdateId,
        text: requiredTextValue(payload.text, "telegram bot text"),
        traceId: payload.traceId
      });
      if (answer.status !== "answered") {
        return gateway.persistAcceptedUpdate(
          createHandoffPersistInput({
            conversation,
            dedupe: reservedDedupe,
            message,
            payload,
            reasonCode: answer.reasonCode
          })
        );
      }

      const answerTextValue = requiredTextValue(answer.answerText, "answer text").slice(
        0,
        4096
      );
      const sendResult = await options.sendPort.sendMessage({
        channelConnectionId: payload.channelConnectionId,
        chatExternalRef: requiredTextValue(payload.chatExternalRef, "chatExternalRef"),
        idempotencyKey: createAnswerIdempotencyKey(payload),
        orgId: payload.orgId,
        replyToMessageExternalRef: payload.messageExternalRef,
        tenantId: payload.tenantId,
        text: answerTextValue,
        traceId: payload.traceId
      });

      return gateway.persistAcceptedUpdate({
        conversation,
        dedupe: reservedDedupe,
        message,
        outboundMessage: {
          channelConnectionId: payload.channelConnectionId,
          content: safeOutboundMessageContent(answerTextValue, sendResult),
          contentKind: "text",
          conversationId,
          deliveryStatus: sendResult.status,
          externalMessageRef: sendResult.providerMessageRef,
          id: randomUUID(),
          occurredAt: sendResult.sentAt,
          orgId: payload.orgId,
          tenantId: payload.tenantId
        },
        runtimeBranch: "answer",
        traceId: payload.traceId
      });
    } catch {
      return gateway.persistAcceptedUpdate(
        createHandoffPersistInput({
          conversation,
          dedupe: reservedDedupe,
          message,
          payload,
          reasonCode: "answer_runtime_error"
        })
      );
    }
  }

  return gateway.persistAcceptedUpdate(
    createHandoffPersistInput({
      conversation,
      dedupe,
      message,
      payload,
      reasonCode: "requires_operator_review"
    })
  );
}

export function createTelegramBotConversationBullmqProcessor(
  gateway: TelegramBotConversationPersistenceGateway
) {
  return (job: RuntimeJob) => {
    if (job.name !== telegramBotConversationQueueDefaults.jobName) {
      throw new Error("telegram bot conversation job name is unsupported");
    }
    return processTelegramBotConversationJob(job.data, gateway);
  };
}

export function createTelegramBotConversationBullmqWorker(options: {
  connection: QueueOptions["connection"];
  gateway: TelegramBotConversationPersistenceGateway;
  prefix?: string;
  queueName?: string;
}) {
  return new Worker(
    options.queueName ?? telegramBotConversationQueueDefaults.queueName,
    createTelegramBotConversationBullmqProcessor(options.gateway),
    { connection: options.connection, prefix: options.prefix }
  );
}

function createHandoffPersistInput(input: {
  conversation: ConversationDraft;
  dedupe: DedupeDraft;
  message: MessageDraft;
  payload: TelegramBotConversationJobPayload;
  reasonCode: string;
}): HandoffPersistInput {
  const ticketId = randomUUID();
  const systemUserId = "00000000-0000-4000-8000-000000000005";
  const handoff = createHumanHandoff({
    conversation: {
      ...input.conversation,
      status: "open",
      unreadCount: 1
    },
    reason: `telegram_bot_${input.payload.contentKind}_${safeReasonCode(
      input.reasonCode
    )}`,
    requestedByUserId: systemUserId,
    slaPolicyRef: "m8-01-bot-runtime-answer-loop-v0"
  });
  const ticket = createTicketState({
    conversationId: input.conversation.id,
    events: [],
    id: ticketId,
    orgId: input.payload.orgId,
    priority: handoff.ticketDraft.priority,
    sla: handoff.ticketDraft.sla,
    status: "open",
    suggestedAction: handoff.ticketDraft.suggestedAction,
    summary: handoff.ticketDraft.summary,
    tenantId: input.payload.tenantId
  });

  return {
    conversation: input.conversation,
    dedupe: input.dedupe,
    message: input.message,
    runtimeBranch: "handoff",
    ticket: {
      conversationId: input.conversation.id,
      id: ticket.id,
      orgId: input.payload.orgId,
      summary: ticket.summary,
      tenantId: input.payload.tenantId
    },
    ticketEvent: {
      id: randomUUID(),
      orgId: input.payload.orgId,
      tenantId: input.payload.tenantId,
      ticketId: ticket.id,
      traceId: input.payload.traceId
    },
    traceId: input.payload.traceId
  };
}

function canAttemptAnswer(
  payload: TelegramBotConversationJobPayload,
  options: TelegramBotConversationRuntimeOptions
): options is {
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

function createAnswerIdempotencyKey(payload: TelegramBotConversationJobPayload) {
  return `telegram-bot-answer__${payload.orgId}__${payload.tenantId}__${payload.channelConnectionId}__${payload.providerUpdateId}`;
}

function safeOutboundMessageContent(
  answerTextValue: string,
  sendResult: TelegramBotOutboundSendResult
) {
  return removeUndefined({
    providerMessageRef: sendResult.providerMessageRef,
    text: answerTextValue
  });
}

function safeMessageContent(payload: TelegramBotConversationJobPayload) {
  return {
    contentKind: payload.contentKind,
    provider: payload.provider,
    providerUpdateId: payload.providerUpdateId,
    textLength: payload.text?.length ?? 0,
    traceId: payload.traceId
  };
}

function requiredTextValue(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

function safeReasonCode(value: unknown): string {
  const text = typeof value === "string" ? value : "unknown";
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_:.-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 96) || "unknown"
  );
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function assertPayload(payload: TelegramBotConversationJobPayload) {
  const requiredKeys = ["channelConnectionId", "orgId", "providerUpdateId", "tenantId"];
  for (const key of requiredKeys) {
    if (typeof payload[key as keyof TelegramBotConversationJobPayload] !== "string") {
      throw new Error(`${key} is required`);
    }
  }
  if (payload.contentKind === "unsupported") {
    throw new Error("unsupported telegram bot updates are not conversation jobs");
  }
}
