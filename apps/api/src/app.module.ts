import {
  Body,
  Controller,
  Injectable,
  Module,
  Post,
  ServiceUnavailableException
} from "@nestjs/common";

import * as api from "./access-context.ts";
import {
  ConversationTicketController,
  ConversationTicketService,
  InMemoryConversationTicketRepository
} from "./conversation-ticket.ts";
import type {
  DisabledTelegramBotIngressQueue as ContractDisabledTelegramBotIngressQueue,
  InMemoryTelegramBotIngressQueue,
  TELEGRAM_BOT_INGRESS_QUEUE,
  TELEGRAM_BOT_SECRET_HEADER,
  TELEGRAM_BOT_WEBHOOK_SECRET,
  TelegramBotIngressQueuePort,
  TelegramBotQueueResult,
  TelegramBotQueueStatus,
  TelegramBotWebhookCore,
  TelegramBotWebhookError,
  TelegramBotWebhookInput,
  TelegramBotWebhookService as ContractTelegramBotWebhookService
} from "./telegram-bot.ts";

type TelegramBotContractAnchor = {
  core: TelegramBotWebhookCore;
  disabledQueue: ContractDisabledTelegramBotIngressQueue;
  error: TelegramBotWebhookError;
  input: TelegramBotWebhookInput;
  memoryQueue: InMemoryTelegramBotIngressQueue;
  queuePort: TelegramBotIngressQueuePort;
  queueResult: TelegramBotQueueResult;
  queueStatus: TelegramBotQueueStatus;
  queueToken: typeof TELEGRAM_BOT_INGRESS_QUEUE;
  secretHeader: typeof TELEGRAM_BOT_SECRET_HEADER;
  secretToken: typeof TELEGRAM_BOT_WEBHOOK_SECRET;
  service: ContractTelegramBotWebhookService;
};

type TelegramBotWebhookBody = TelegramBotContractAnchor["input"]["body"];

@Injectable()
class DisabledTelegramBotIngressQueue {
  async enqueue(): Promise<never> {
    throw new ServiceUnavailableException(
      "telegram bot ingress queue is not configured"
    );
  }
}

@Injectable()
class TelegramBotWebhookService {
  constructor(private readonly queue: DisabledTelegramBotIngressQueue) {}

  async handleWebhook() {
    return this.queue.enqueue();
  }
}

@Controller("telegram/bot")
class TelegramBotWebhookController {
  constructor(private readonly webhookService: TelegramBotWebhookService) {}

  @Post("webhook")
  webhook(@Body() body: TelegramBotWebhookBody) {
    void body;
    return this.webhookService.handleWebhook();
  }
}

@Module({
  controllers: [
    api.ApiAccessContextController,
    api.ApiHealthController,
    ConversationTicketController,
    TelegramBotWebhookController
  ],
  providers: [
    api.ApiAccessContextGuard,
    api.ApiAccessContextService,
    ConversationTicketService,
    TelegramBotWebhookService,
    DisabledTelegramBotIngressQueue,
    InMemoryConversationTicketRepository,
    { provide: api.API_AUDIT_SINK, useClass: api.InMemoryAuditSink },
    { provide: api.API_AUTHZ_REPOSITORY, useClass: api.DisabledAuthzRepository },
    {
      provide: api.API_IDENTITY_VERIFIER,
      useFactory: () => api.createIdentityVerifierFromEnv()
    }
  ]
})
export class AppModule {}
