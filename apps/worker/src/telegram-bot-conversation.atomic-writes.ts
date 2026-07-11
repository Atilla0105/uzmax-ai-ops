import type {
  ClaimPreparedAnswerInput,
  ClaimPreparedAnswerResult,
  DedupeDraft,
  FinalizePreparedAnswerInput,
  HandoffPreparedAnswerInput,
  PreparationResult,
  RuntimePersistInput,
  RuntimeResult,
  TelegramBotConversationPersistenceGateway,
  TicketDraft,
  TicketEventDraft
} from "./telegram-bot-conversation.flow.ts";
import {
  conversationDisposition,
  finalizedIntentMutation,
  isUnownedOpen,
  preparationResult,
  runtimeResult
} from "./conversation-runtime.ts";
import {
  compoundWhere,
  conflict,
  contentOf,
  dedupeWhere,
  inboundMessageData,
  incrementUnread,
  lockActiveTickets,
  lockConversationByNaturalKey,
  lockConversationRow,
  lockIntent,
  markerPhase,
  markProcessed,
  naturalKey,
  outboundMessageData,
  persistCustomerIdentity,
  record,
  reserveDedupe,
  rows,
  runTelegramConversationTransaction,
  scope,
  text,
  ticketIdOf,
  updateIntent,
  type LockedState,
  type Scope,
  type TelegramConversationPrismaPort,
  type TelegramConversationTransaction
} from "./telegram-bot-conversation-persistence.ts";
export class PrismaTelegramBotConversationPersistenceGateway implements TelegramBotConversationPersistenceGateway {
  constructor(private readonly prisma: TelegramConversationPrismaPort) {}
  prepareAcceptedUpdate(input: RuntimePersistInput) {
    return runTelegramConversationTransaction(
      this.prisma,
      scope(input.dedupe),
      async (tx) => {
        if (!(await reserveDedupe(tx, input.dedupe)))
          return recoverAtomicDuplicate(tx, input);
        if (input.customerIdentity)
          await persistCustomerIdentity(tx, input.customerIdentity);
        return prepareAtomicUpdate(tx, input);
      }
    );
  }
  persistAcceptedUpdate(input: RuntimePersistInput): Promise<RuntimeResult> {
    return this.prepareAcceptedUpdate(input);
  }
  claimPreparedAnswer(input: ClaimPreparedAnswerInput) {
    return this.run(input, (tx) => claimPreparedAtomic(tx, input));
  }
  handoffPreparedAnswer(input: HandoffPreparedAnswerInput) {
    return this.run(input, (tx) => handoffPreparedAtomic(tx, input));
  }
  finalizePreparedAnswer(input: FinalizePreparedAnswerInput) {
    return this.run(input, (tx) => finalizePreparedAtomic(tx, input));
  }
  private run<T extends { dedupe: DedupeDraft }, R extends RuntimeResult>(
    input: T,
    action: (tx: TelegramConversationTransaction) => Promise<R>
  ): Promise<R> {
    return runTelegramConversationTransaction(this.prisma, scope(input.dedupe), action);
  }
}
async function prepareAtomicUpdate(
  tx: TelegramConversationTransaction,
  input: RuntimePersistInput
): Promise<PreparationResult> {
  const row = record(
    await tx.channelConversation.upsert({
      create: {
        ...input.conversation,
        lastMessageAt: new Date(input.conversation.lastMessageAt),
        status: input.runtimeBranch === "answer" ? "OPEN" : "PENDING_HANDOFF",
        unreadCount: 0
      },
      update: { lastMessageAt: new Date(input.conversation.lastMessageAt) },
      where: {
        orgId_tenantId_channelConnectionId_externalConversationRef: naturalKey(input)
      }
    })
  );
  const conversationId = text(row.id, "conversation id");
  const created = conversationId === input.conversation.id;
  const state = await lockState(
    tx,
    scope(input.dedupe),
    conversationId,
    created && input.runtimeBranch === "handoff"
  );
  await tx.channelMessage.create({
    data: inboundMessageData(input, conversationId)
  });
  if (input.runtimeBranch === "answer" && state.disposition === "bot") {
    await tx.channelMessage.create({
      data: outboundMessageData(input, conversationId)
    });
    return preparationResult(input, "answer_ready", conversationId, {
      outboundMessageId: input.outboundMessage.id
    });
  }
  if (input.runtimeBranch === "handoff" && state.disposition === "bot") {
    const ticketId = await applyAutomaticHandoff(
      tx,
      state,
      input.ticket,
      input.ticketEvent
    );
    await incrementUnread(tx, scope(input.dedupe), conversationId);
    await markProcessed(tx, input.dedupe);
    return preparationResult(input, "handoff", conversationId, { ticketId });
  }
  await incrementUnread(tx, scope(input.dedupe), conversationId);
  await markProcessed(tx, input.dedupe);
  return preparationResult(input, "stored_for_operator", conversationId, {
    ticketId: ticketIdOf(state)
  });
}
async function recoverAtomicDuplicate(
  tx: TelegramConversationTransaction,
  input: RuntimePersistInput
): Promise<PreparationResult> {
  const dedupe = record(
    await tx.telegramUpdateDedupe.findFirst({ where: dedupeWhere(input.dedupe) })
  );
  if (dedupe.processedAt) return preparationResult(input, "deduped", undefined);
  if (input.runtimeBranch !== "answer") throw conflict();
  const conversationId = await lockConversationByNaturalKey(tx, input);
  const state = await lockState(tx, scope(input.dedupe), conversationId);
  const marker = await lockIntent(
    tx,
    scope(input.dedupe),
    conversationId,
    input.outboundMessage.id
  );
  const phase = markerPhase(marker);
  const status = text(marker.deliveryStatus, "intent status");
  const terminalResult = async () => {
    if (status === "CANCELLED" && state.disposition === "bot") throw conflict();
    const firstTerminal = await markProcessed(tx, input.dedupe);
    if (firstTerminal && status === "CANCELLED")
      await incrementLateUnread(tx, state, scope(input.dedupe), conversationId);
    return preparationResult(input, "deduped", conversationId, {
      outboundMessageId: input.outboundMessage.id,
      ticketId: ticketIdOf(state)
    });
  };
  if (isTerminalRecovery(status, phase)) return terminalResult();
  if (status !== "QUEUED" || !["generating", "claimed"].includes(phase)) {
    throw conflict();
  }
  const uncertain = phase === "claimed";
  await updateIntent(tx, scope(input.dedupe), marker, {
    deliveryStatus: uncertain ? "QUEUED" : "CANCELLED",
    content: {
      ...contentOf(marker),
      ...(uncertain ? { deliveryUncertain: true } : {}),
      dispatchPhase: uncertain ? "uncertain" : "cancelled"
    }
  });
  const ticketId = await handoffIfBot(
    tx,
    state,
    input.recoveryTicket,
    input.recoveryTicketEvent
  );
  await incrementLateUnread(tx, state, scope(input.dedupe), conversationId);
  await markProcessed(tx, input.dedupe);
  return preparationResult(
    input,
    uncertain ? "delivery_uncertain" : "handoff_recovered",
    conversationId,
    { outboundMessageId: input.outboundMessage.id, ticketId }
  );
}
async function handoffPreparedAtomic(
  tx: TelegramConversationTransaction,
  input: HandoffPreparedAnswerInput
): Promise<RuntimeResult> {
  const { marker, state } = await lockPrepared(tx, input);
  if (!(await markProcessed(tx, input.dedupe)))
    return runtimeResult(input, "handoff", { ticketId: ticketIdOf(state) });
  if (text(marker.deliveryStatus, "intent status") === "QUEUED") {
    await updateIntent(tx, scope(input.dedupe), marker, {
      content: { ...contentOf(marker), dispatchPhase: "cancelled" },
      deliveryStatus: "CANCELLED"
    });
  }
  const ticketId = await handoffIfBot(tx, state, input.ticket, input.ticketEvent);
  await incrementLateUnread(tx, state, scope(input.dedupe), input.conversationId);
  return runtimeResult(input, "handoff", { ticketId });
}
async function claimPreparedAtomic(
  tx: TelegramConversationTransaction,
  input: ClaimPreparedAnswerInput
): Promise<ClaimPreparedAnswerResult> {
  const { marker, state } = await lockPrepared(tx, input);
  if (
    state.disposition !== "bot" ||
    text(marker.deliveryStatus, "intent status") === "CANCELLED"
  ) {
    const result = {
      ...runtimeResult(input, "handoff", { ticketId: ticketIdOf(state) }),
      claim: "suppressed" as const
    };
    if (!(await markProcessed(tx, input.dedupe))) return result;
    if (text(marker.deliveryStatus, "intent status") === "QUEUED") {
      await updateIntent(tx, scope(input.dedupe), marker, {
        content: { ...contentOf(marker), dispatchPhase: "cancelled" },
        deliveryStatus: "CANCELLED"
      });
    }
    await incrementLateUnread(tx, state, scope(input.dedupe), input.conversationId);
    return result;
  }
  if (
    text(marker.deliveryStatus, "intent status") !== "QUEUED" ||
    markerPhase(marker) !== "generating"
  ) {
    throw conflict();
  }
  let ticketId = ticketIdOf(state);
  if (input.followUp) {
    ticketId = await createOrReuseUnownedTicket(
      tx,
      state,
      input.followUp.ticket,
      input.followUp.ticketEvent
    );
  }
  await updateIntent(tx, scope(input.dedupe), marker, {
    content: {
      ...contentOf(marker),
      dispatchPhase: "claimed",
      text: input.answerText
    }
  });
  return { ...runtimeResult(input, "answer", { ticketId }), claim: "claimed" };
}
async function finalizePreparedAtomic(
  tx: TelegramConversationTransaction,
  input: FinalizePreparedAnswerInput
): Promise<RuntimeResult> {
  const { marker, state } = await lockPrepared(tx, input);
  const firstTerminal = await markProcessed(tx, input.dedupe);
  const phase = markerPhase(marker);
  const finalizationMode = () => {
    if (firstTerminal) return phase === "claimed" ? "fresh" : "invalid";
    return phase === "uncertain" && input.outcome !== "uncertain" ? "late" : "stale";
  };
  const mode = finalizationMode();
  if (mode === "stale")
    return runtimeResult(input, "handoff", { ticketId: ticketIdOf(state) });
  if (text(marker.deliveryStatus, "intent status") !== "QUEUED" || mode === "invalid") {
    throw conflict();
  }
  const sent = input.outcome === "sent";
  await updateIntent(
    tx,
    scope(input.dedupe),
    marker,
    finalizedIntentMutation(input, contentOf(marker))
  );
  const fresh = mode === "fresh";
  const ticketId =
    fresh && !sent
      ? await handoffIfBot(tx, state, input.ticket, input.ticketEvent)
      : ticketIdOf(state);
  if (fresh && !sent)
    await incrementLateUnread(tx, state, scope(input.dedupe), input.conversationId);
  return runtimeResult(input, sent ? "answer" : "handoff", { ticketId });
}
async function incrementLateUnread(
  tx: TelegramConversationTransaction,
  state: LockedState,
  scoped: Scope,
  conversationId: string
) {
  if (state.disposition !== "closed") {
    await incrementUnread(tx, scoped, conversationId);
  }
}
function isTerminalRecovery(status: string, phase: string) {
  return ["SENT", "FAILED", "CANCELLED"].includes(status) || phase === "uncertain";
}
async function lockPrepared(
  tx: TelegramConversationTransaction,
  input: ClaimPreparedAnswerInput | HandoffPreparedAnswerInput
) {
  const state = await lockState(tx, scope(input.dedupe), input.conversationId);
  const marker = await lockIntent(
    tx,
    scope(input.dedupe),
    input.conversationId,
    input.outboundMessageId
  );
  return { marker, state };
}
async function lockState(
  tx: TelegramConversationTransaction,
  scoped: Scope,
  conversationId: string,
  allowPendingWithoutTicket = false
): Promise<LockedState> {
  await lockConversationRow(tx, scoped, conversationId);
  await lockActiveTickets(tx, scoped, conversationId);
  const conversation = record(
    await tx.channelConversation.findFirst({ where: { ...scoped, id: conversationId } })
  );
  const tickets = rows(
    await tx.supportTicket.findMany({
      orderBy: { id: "asc" },
      where: { ...scoped, conversationId, status: { not: "CLOSED" } }
    })
  );
  return {
    conversation,
    disposition: conversationDisposition(
      conversation,
      tickets,
      allowPendingWithoutTicket
    ),
    tickets
  };
}
async function handoffIfBot(
  tx: TelegramConversationTransaction,
  state: LockedState,
  ticket: TicketDraft,
  event: TicketEventDraft
) {
  return state.disposition === "bot"
    ? applyAutomaticHandoff(tx, state, ticket, event)
    : ticketIdOf(state);
}
async function applyAutomaticHandoff(
  tx: TelegramConversationTransaction,
  state: LockedState,
  ticket: TicketDraft,
  event: TicketEventDraft
) {
  const conversationId = text(state.conversation.id, "conversation id");
  if (text(state.conversation.status, "conversation status") === "OPEN") {
    await tx.channelConversation.update({
      data: { status: "PENDING_HANDOFF" },
      where: compoundWhere(scope(ticket), conversationId)
    });
  }
  return createOrReuseUnownedTicket(tx, state, ticket, event);
}
async function createOrReuseUnownedTicket(
  tx: TelegramConversationTransaction,
  state: LockedState,
  ticket: TicketDraft,
  event: TicketEventDraft
) {
  const current = state.tickets[0];
  if (current) {
    if (!isUnownedOpen(current)) throw conflict();
    return text(current.id, "ticket id");
  }
  const conversationId = text(state.conversation.id, "conversation id");
  await tx.supportTicket.create({
    data: { ...ticket, conversationId, priority: 3, status: "OPEN" }
  });
  await tx.supportTicketEvent.create({
    data: {
      eventType: "CREATED",
      id: event.id,
      orgId: event.orgId,
      payload: { traceId: event.traceId },
      tenantId: event.tenantId,
      ticketId: ticket.id
    }
  });
  return ticket.id;
}
