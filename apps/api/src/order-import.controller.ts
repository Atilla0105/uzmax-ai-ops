import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";

import { AuthzError, type AccessContext } from "../../../packages/authz/src/index.ts";
import { ApiAccessContextGuard } from "./access-context.ts";
import { OrderImportService } from "./order-import.service.ts";
import {
  OrderImportApiError,
  type ApiRequestWithContext,
  type OrderImportQueryKind
} from "./order-import.types.ts";

@Controller("order-import")
@UseGuards(ApiAccessContextGuard)
export class OrderImportController {
  constructor(private readonly service: OrderImportService) {}

  @Get("jobs")
  listImportJobs(@Req() request: ApiRequestWithContext) {
    return this.handle(() =>
      this.service.listImportJobs(requireAccessContext(request))
    );
  }

  @Post("jobs")
  submitImportCsvTextJob(
    @Req() request: ApiRequestWithContext,
    @Body() body: unknown = {}
  ) {
    return this.handle(() =>
      this.service.submitImportCsvTextJob(requireAccessContext(request), body)
    );
  }

  @Get("jobs/:jobId/errors")
  listImportRowErrors(
    @Req() request: ApiRequestWithContext,
    @Param("jobId") jobId: string
  ) {
    return this.handle(() =>
      this.service.listImportRowErrors(requireAccessContext(request), jobId)
    );
  }

  @Get("snapshots/search")
  searchSnapshot(
    @Req() request: ApiRequestWithContext,
    @Query() query: Record<string, string | string[] | undefined>
  ) {
    return this.handle(() =>
      this.service.searchSnapshot(requireAccessContext(request), {
        now: readFirst(query.now),
        queryKind: readQueryKind(query.queryKind),
        queryRef: requireText(readFirst(query.queryRef), "queryRef")
      })
    );
  }

  private async handle<T>(action: () => Promise<T> | T): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toOrderImportHttpException(error);
    }
  }
}

function requireAccessContext(request: ApiRequestWithContext): AccessContext {
  if (!request.accessContext) {
    throw new OrderImportApiError(403, "access context is required");
  }
  return request.accessContext;
}

function readQueryKind(value: string | string[] | undefined): OrderImportQueryKind {
  const queryKind = readFirst(value) ?? "order_ref";
  const allowed = [
    "batch_ref",
    "customer_ref",
    "external_ref",
    "order_ref",
    "search_ref"
  ];
  if (allowed.includes(queryKind)) return queryKind as OrderImportQueryKind;
  throw new OrderImportApiError(400, "order query kind is invalid");
}

function requireText(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new OrderImportApiError(400, `${name} is required`);
  return value.trim();
}

function readFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toOrderImportHttpException(error: unknown): Error {
  if (error instanceof OrderImportApiError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    if (error.statusCode === 404) return new NotFoundException(error.message);
    return new ForbiddenException(error.message);
  }
  if (error instanceof AuthzError) return new ForbiddenException(error.message);
  return error instanceof Error ? error : new ForbiddenException("order import denied");
}
