import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards
} from "@nestjs/common";

import {
  assertPermission,
  AuthzError,
  type AccessContext
} from "../../../packages/authz/src/index.ts";
import { ApiAccessContextGuard } from "./access-context.ts";
import {
  LOGS_ANALYTICS_RUNTIME_REPOSITORY,
  LogsAnalyticsRuntimeError,
  exportDraftInput,
  listFilters,
  type LogsAnalyticsRuntimeRepositoryPort,
  type RuntimeRequest
} from "./logs-analytics-runtime.contracts.ts";

export {
  LOGS_ANALYTICS_RUNTIME_REPOSITORY,
  type LogsAnalyticsRuntimeRepositoryPort
} from "./logs-analytics-runtime.contracts.ts";
export { createLogsAnalyticsRuntimeRepositoryProviderFromEnv } from "./logs-analytics-runtime.repository.ts";

@Controller("logs-analytics")
@UseGuards(ApiAccessContextGuard)
export class LogsAnalyticsRuntimeController {
  constructor(
    @Inject(LOGS_ANALYTICS_RUNTIME_REPOSITORY)
    private readonly repository: LogsAnalyticsRuntimeRepositoryPort
  ) {}

  @Get("login-logs")
  loginLogs(@Req() request: RuntimeRequest, @Query() query: Record<string, unknown>) {
    return this.read(request, (ctx) =>
      this.repository.listLoginLogs(ctx, listFilters(query))
    );
  }

  @Get("presence-logs")
  presenceLogs(
    @Req() request: RuntimeRequest,
    @Query() query: Record<string, unknown>
  ) {
    return this.read(request, (ctx) =>
      this.repository.listPresenceLogs(ctx, listFilters(query))
    );
  }

  @Get("operation-logs")
  operationLogs(
    @Req() request: RuntimeRequest,
    @Query() query: Record<string, unknown>
  ) {
    return this.read(request, (ctx) =>
      this.repository.listOperationLogs(ctx, listFilters(query))
    );
  }

  @Get("board")
  board(@Req() request: RuntimeRequest) {
    return this.read(request, (ctx) => this.repository.getBoard(ctx));
  }

  @Post("export-jobs")
  exportJob(@Req() request: RuntimeRequest, @Body() body: unknown = {}) {
    return this.handle(() => {
      const access = requestAccessContext(request);
      assertPermission(access, "logs:export");
      return this.repository.createExportDraft(access, exportDraftInput(body));
    });
  }

  private read<T>(request: RuntimeRequest, action: (ctx: AccessContext) => T) {
    return this.handle(() => {
      const access = requestAccessContext(request);
      assertPermission(access, "logs:read");
      return action(access);
    });
  }

  private async handle<T>(action: () => Promise<T> | T): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw http(error);
    }
  }
}

function requestAccessContext(request: RuntimeRequest): AccessContext {
  if (!request.accessContext)
    throw new LogsAnalyticsRuntimeError(503, "access context is required");
  return request.accessContext;
}

function http(error: unknown): Error {
  if (error instanceof LogsAnalyticsRuntimeError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    return new ServiceUnavailableException(error.message);
  }
  if (error instanceof AuthzError) return new ForbiddenException(error.message);
  return error instanceof Error
    ? error
    : new ForbiddenException("logs analytics access denied");
}
