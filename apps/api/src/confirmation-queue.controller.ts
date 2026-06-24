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
import {
  ConfirmationQueueService,
  parseConfirmationDecisionBody
} from "./confirmation-queue.service.ts";
import {
  ConfirmationQueueApiError,
  type ApiRequestWithContext,
  type ConfirmationItemKind,
  type ConfirmationItemStatus,
  type ConfirmationQueueListFilters
} from "./confirmation-queue.types.ts";

@Controller("confirmation-queue")
@UseGuards(ApiAccessContextGuard)
export class ConfirmationQueueController {
  constructor(private readonly service: ConfirmationQueueService) {}

  @Get("items")
  listItems(
    @Req() request: ApiRequestWithContext,
    @Query() query: Record<string, string | string[] | undefined>
  ) {
    return this.handle(() =>
      this.service.listItems(requireAccessContext(request), parseListFilters(query))
    );
  }

  @Get("items/:itemId")
  getItemDetail(
    @Req() request: ApiRequestWithContext,
    @Param("itemId") itemId: string
  ) {
    return this.handle(() =>
      this.service.getItemDetail(requireAccessContext(request), itemId)
    );
  }

  @Post("items/:itemId/decisions")
  applyDecision(
    @Req() request: ApiRequestWithContext,
    @Param("itemId") itemId: string,
    @Body() body: unknown = {}
  ) {
    return this.handle(() =>
      this.service.applyDecision(
        requireAccessContext(request),
        parseConfirmationDecisionBody(itemId, body)
      )
    );
  }

  private async handle<T>(action: () => Promise<T> | T): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toConfirmationQueueHttpException(error);
    }
  }
}

function parseListFilters(
  query: Record<string, string | string[] | undefined>
): ConfirmationQueueListFilters {
  return {
    kind: readKind(query.kind),
    status: readStatus(query.status)
  };
}

function readKind(
  value: string | string[] | undefined
): ConfirmationItemKind | undefined {
  const kind = readFirst(value);
  if (!kind) return undefined;
  const allowed = [
    "conflict_candidate",
    "eval_candidate",
    "knowledge_candidate",
    "profile_candidate"
  ];
  if (allowed.includes(kind)) return kind as ConfirmationItemKind;
  throw new ConfirmationQueueApiError(400, "confirmation item kind is invalid");
}

function readStatus(
  value: string | string[] | undefined
): ConfirmationItemStatus | undefined {
  const status = readFirst(value);
  if (!status) return "pending";
  if (status === "all") return undefined;
  const allowed = ["approved", "blocked", "discarded", "edited", "pending"];
  if (allowed.includes(status)) return status as ConfirmationItemStatus;
  throw new ConfirmationQueueApiError(400, "confirmation item status is invalid");
}

function requireAccessContext(request: ApiRequestWithContext): AccessContext {
  if (!request.accessContext) {
    throw new ConfirmationQueueApiError(403, "access context is required");
  }
  return request.accessContext;
}

function readFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toConfirmationQueueHttpException(error: unknown): Error {
  if (error instanceof ConfirmationQueueApiError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    if (error.statusCode === 404) return new NotFoundException(error.message);
    return new ForbiddenException(error.message);
  }
  if (error instanceof AuthzError) return new ForbiddenException(error.message);
  return error instanceof Error
    ? error
    : new ForbiddenException("confirmation queue access denied");
}
