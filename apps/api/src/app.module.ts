import {
  Body,
  Controller,
  Injectable,
  Module,
  Post,
  ServiceUnavailableException
} from "@nestjs/common";

import * as api from "./access-context.ts";
import type {
  AuditLogPrismaClientPort,
  PrismaAuditLogCreateData,
  PrismaAuditSink,
  toPrismaAuditLogCreateData
} from "./audit-log.prisma-sink.ts";
import {
  AI_MEMBER_RUNTIME_REPOSITORY,
  AiMemberRuntimeController,
  createAiMemberRuntimeRepositoryProviderFromEnv,
  type AiMemberRuntimeRepositoryPort
} from "./ai-member-runtime.ts";
import {
  LOGS_ANALYTICS_RUNTIME_REPOSITORY,
  LogsAnalyticsRuntimeController,
  createLogsAnalyticsRuntimeRepositoryProviderFromEnv,
  type LogsAnalyticsRuntimeRepositoryPort
} from "./logs-analytics-runtime.ts";
import {
  TEMPLATE_COPY_RUNTIME_REPOSITORY,
  TemplateCopyRuntimeController,
  createTemplateCopyRuntimeRepositoryProviderFromEnv,
  type TemplateCopyRuntimeRepositoryPort
} from "./template-copy-runtime.ts";
import {
  ConversationTicketController,
  ConversationTicketService,
  InMemoryConversationTicketRepository
} from "./conversation-ticket.ts";
import { ConfirmationQueueController } from "./confirmation-queue.controller.ts";
import {
  CONFIRMATION_FORMAL_WRITE_PIPELINE,
  createConfirmationFormalWritePipelineProviderFromEnv,
  type ConfirmationFormalWritePipelinePort
} from "./confirmation-queue.formal-write.ts";
import {
  CONFIRMATION_QUEUE_REPOSITORY,
  InMemoryConfirmationQueueRepository,
  type ConfirmationQueueRepositoryPort
} from "./confirmation-queue.repository.ts";
import { createConfirmationQueueRepositoryProviderFromEnv } from "./confirmation-queue.runtime.ts";
import { ConfirmationQueueService } from "./confirmation-queue.service.ts";
import {
  CUSTOMER_ASSET_REPOSITORY,
  InMemoryCustomerAssetRepository
} from "./customer-asset.repository.ts";
import { CustomerAssetController } from "./customer-asset.controller.ts";
import {
  createCustomerAssetAuditSinkProvider,
  createCustomerAssetRepositoryProvider,
  createCustomerAssetRlsBatchTransactionRunner,
  customerAssetRuntimeModes,
  RlsCustomerAssetPersistenceGateway,
  RlsPrismaAuditSink,
  type CustomerAssetRuntimePrismaClientPort,
  type CustomerAssetRlsTransactionRunner
} from "./customer-asset.runtime.ts";
import type {
  CustomerAssetPrismaClientPort,
  PrismaCustomerAssetPersistenceGateway
} from "./customer-asset.prisma-gateway.ts";
import type {
  CustomerAssetPersistenceGateway,
  CustomerAssetPersistenceScope,
  PersistenceCustomerAssetRepository
} from "./customer-asset.persistence.ts";
import { CustomerAssetService } from "./customer-asset.service.ts";
import {
  ORDER_IMPORT_PRISMA_CLIENT,
  ORDER_IMPORT_RLS_TRANSACTION_RUNNER,
  ORDER_IMPORT_REPOSITORY,
  InMemoryOrderImportRepository,
  OrderImportController,
  OrderImportService,
  PrismaOrderImportPersistenceGateway,
  PersistenceOrderImportRepository,
  RlsOrderImportPersistenceGateway,
  createOrderImportRepositoryProvider,
  createOrderImportRlsBatchTransactionRunner,
  orderImportRepositoryRuntimeModes,
  type OrderImportRlsBatchPrismaClientPort,
  type OrderImportPrismaClientPort,
  type OrderImportRepositoryProviderInput,
  type OrderImportRepositoryRuntimeMode,
  type OrderImportRlsTransactionRunner,
  type OrderImportPersistenceGateway,
  type OrderImportPersistenceScope
} from "./order-import.ts";
import { createOrderImportRepositoryProviderFromEnv } from "./order-import.runtime.ts";
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
type OrderImportRepositoryContractAnchor = {
  defaultRuntimeMode: (typeof orderImportRepositoryRuntimeModes)["inMemory"];
  gateway: OrderImportPersistenceGateway;
  persistenceAdapter: typeof PersistenceOrderImportRepository;
  prismaClient: OrderImportPrismaClientPort;
  prismaClientToken: typeof ORDER_IMPORT_PRISMA_CLIENT;
  prismaGateway: typeof PrismaOrderImportPersistenceGateway;
  rlsPrismaGateway: typeof RlsOrderImportPersistenceGateway;
  rlsBatchPrismaClient: OrderImportRlsBatchPrismaClientPort;
  rlsBatchRunnerFactory: typeof createOrderImportRlsBatchTransactionRunner;
  rlsTransactionRunner: OrderImportRlsTransactionRunner;
  rlsTransactionRunnerToken: typeof ORDER_IMPORT_RLS_TRANSACTION_RUNNER;
  runtimeMode: OrderImportRepositoryRuntimeMode;
  runtimeModes: typeof orderImportRepositoryRuntimeModes;
  runtimeProvider: typeof createOrderImportRepositoryProvider;
  runtimeProviderInput: OrderImportRepositoryProviderInput;
  scope: OrderImportPersistenceScope;
};
type CustomerAssetPersistenceContractAnchor = {
  auditSinkProvider: typeof createCustomerAssetAuditSinkProvider;
  gateway: CustomerAssetPersistenceGateway;
  persistenceAdapter: typeof PersistenceCustomerAssetRepository;
  prismaClient: CustomerAssetPrismaClientPort;
  prismaGateway: typeof PrismaCustomerAssetPersistenceGateway;
  rlsAuditSink: typeof RlsPrismaAuditSink;
  rlsGateway: typeof RlsCustomerAssetPersistenceGateway;
  rlsPrismaClient: CustomerAssetRuntimePrismaClientPort;
  rlsRunner: CustomerAssetRlsTransactionRunner;
  rlsRunnerFactory: typeof createCustomerAssetRlsBatchTransactionRunner;
  runtimeModes: typeof customerAssetRuntimeModes;
  runtimeProvider: typeof createCustomerAssetRepositoryProvider;
  scope: CustomerAssetPersistenceScope;
};
type ApiAuditPersistenceContractAnchor = {
  createData: typeof toPrismaAuditLogCreateData;
  createDataShape: PrismaAuditLogCreateData;
  prismaClient: AuditLogPrismaClientPort;
  prismaSink: typeof PrismaAuditSink;
};
type AiMemberRuntimeContractAnchor = {
  controller: typeof AiMemberRuntimeController;
  repository: AiMemberRuntimeRepositoryPort;
  repositoryProvider: typeof createAiMemberRuntimeRepositoryProviderFromEnv;
  repositoryToken: typeof AI_MEMBER_RUNTIME_REPOSITORY;
};
type LogsAnalyticsRuntimeContractAnchor = {
  controller: typeof LogsAnalyticsRuntimeController;
  repository: LogsAnalyticsRuntimeRepositoryPort;
  repositoryProvider: typeof createLogsAnalyticsRuntimeRepositoryProviderFromEnv;
  repositoryToken: typeof LOGS_ANALYTICS_RUNTIME_REPOSITORY;
};
type TemplateCopyRuntimeContractAnchor = {
  controller: typeof TemplateCopyRuntimeController;
  repository: TemplateCopyRuntimeRepositoryPort;
  repositoryProvider: typeof createTemplateCopyRuntimeRepositoryProviderFromEnv;
  repositoryToken: typeof TEMPLATE_COPY_RUNTIME_REPOSITORY;
};
const orderImportRepositoryContractAnchor: Pick<
  OrderImportRepositoryContractAnchor,
  | "defaultRuntimeMode"
  | "persistenceAdapter"
  | "prismaClientToken"
  | "prismaGateway"
  | "rlsBatchRunnerFactory"
  | "rlsPrismaGateway"
  | "rlsTransactionRunnerToken"
  | "runtimeModes"
  | "runtimeProvider"
> = {
  defaultRuntimeMode: orderImportRepositoryRuntimeModes.inMemory,
  persistenceAdapter: PersistenceOrderImportRepository,
  prismaClientToken: ORDER_IMPORT_PRISMA_CLIENT,
  prismaGateway: PrismaOrderImportPersistenceGateway,
  rlsBatchRunnerFactory: createOrderImportRlsBatchTransactionRunner,
  rlsPrismaGateway: RlsOrderImportPersistenceGateway,
  rlsTransactionRunnerToken: ORDER_IMPORT_RLS_TRANSACTION_RUNNER,
  runtimeModes: orderImportRepositoryRuntimeModes,
  runtimeProvider: createOrderImportRepositoryProvider
};
void orderImportRepositoryContractAnchor;
function customerAssetPersistenceContractAnchor(
  contract: CustomerAssetPersistenceContractAnchor
) {
  void contract;
}
const customerAssetRuntimeProviderContractAnchor: Pick<
  CustomerAssetPersistenceContractAnchor,
  | "auditSinkProvider"
  | "rlsAuditSink"
  | "rlsGateway"
  | "rlsRunnerFactory"
  | "runtimeModes"
  | "runtimeProvider"
> = {
  auditSinkProvider: createCustomerAssetAuditSinkProvider,
  rlsAuditSink: RlsPrismaAuditSink,
  rlsGateway: RlsCustomerAssetPersistenceGateway,
  rlsRunnerFactory: createCustomerAssetRlsBatchTransactionRunner,
  runtimeModes: customerAssetRuntimeModes,
  runtimeProvider: createCustomerAssetRepositoryProvider
};
void customerAssetPersistenceContractAnchor;
void customerAssetRuntimeProviderContractAnchor;
function apiAuditPersistenceContractAnchor(
  contract: ApiAuditPersistenceContractAnchor
) {
  void contract;
}
void apiAuditPersistenceContractAnchor;
function aiMemberRuntimeContractAnchor(contract: AiMemberRuntimeContractAnchor) {
  void contract;
}
void aiMemberRuntimeContractAnchor;
function logsAnalyticsRuntimeContractAnchor(
  contract: LogsAnalyticsRuntimeContractAnchor
) {
  void contract;
}
void logsAnalyticsRuntimeContractAnchor;
function templateCopyRuntimeContractAnchor(
  contract: TemplateCopyRuntimeContractAnchor
) {
  void contract;
}
void templateCopyRuntimeContractAnchor;

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
    AiMemberRuntimeController,
    ConfirmationQueueController,
    ConversationTicketController,
    CustomerAssetController,
    LogsAnalyticsRuntimeController,
    OrderImportController,
    TemplateCopyRuntimeController,
    TelegramBotWebhookController
  ],
  providers: [
    api.ApiAccessContextGuard,
    api.ApiAccessContextService,
    {
      inject: [CONFIRMATION_QUEUE_REPOSITORY, CONFIRMATION_FORMAL_WRITE_PIPELINE],
      provide: ConfirmationQueueService,
      useFactory: (
        repository: ConfirmationQueueRepositoryPort,
        formalWritePipeline: ConfirmationFormalWritePipelinePort
      ) => new ConfirmationQueueService(repository, formalWritePipeline)
    },
    ConversationTicketService,
    CustomerAssetService,
    OrderImportService,
    TelegramBotWebhookService,
    DisabledTelegramBotIngressQueue,
    InMemoryConfirmationQueueRepository,
    {
      inject: [InMemoryConfirmationQueueRepository],
      provide: CONFIRMATION_QUEUE_REPOSITORY,
      useFactory: (repository: InMemoryConfirmationQueueRepository) =>
        createConfirmationQueueRepositoryProviderFromEnv({
          inMemoryRepository: repository
        })
    },
    {
      provide: CONFIRMATION_FORMAL_WRITE_PIPELINE,
      useFactory: () => createConfirmationFormalWritePipelineProviderFromEnv()
    },
    {
      provide: AI_MEMBER_RUNTIME_REPOSITORY,
      useFactory: () => createAiMemberRuntimeRepositoryProviderFromEnv()
    },
    {
      provide: LOGS_ANALYTICS_RUNTIME_REPOSITORY,
      useFactory: () => createLogsAnalyticsRuntimeRepositoryProviderFromEnv()
    },
    {
      provide: TEMPLATE_COPY_RUNTIME_REPOSITORY,
      useFactory: () => createTemplateCopyRuntimeRepositoryProviderFromEnv()
    },
    InMemoryConversationTicketRepository,
    InMemoryCustomerAssetRepository,
    {
      provide: CUSTOMER_ASSET_REPOSITORY,
      useExisting: InMemoryCustomerAssetRepository
    },
    InMemoryOrderImportRepository,
    {
      inject: [InMemoryOrderImportRepository],
      provide: ORDER_IMPORT_REPOSITORY,
      useFactory: (repository: InMemoryOrderImportRepository) =>
        createOrderImportRepositoryProviderFromEnv({
          inMemoryRepository: repository
        })
    },
    { provide: api.API_AUDIT_SINK, useClass: api.InMemoryAuditSink },
    { provide: api.API_AUTHZ_REPOSITORY, useClass: api.DisabledAuthzRepository },
    {
      provide: api.API_IDENTITY_VERIFIER,
      useFactory: () => api.createIdentityVerifierFromEnv()
    }
  ]
})
export class AppModule {}
