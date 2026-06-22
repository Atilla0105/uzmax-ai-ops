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
import { CustomerAssetService } from "./customer-asset.service.ts";
import {
  CustomerAssetApiError,
  type ApiRequestWithContext,
  type CustomerAssetListFilters,
  type CustomerAssetRestoreInput
} from "./customer-asset.types.ts";

@Controller("customer-assets")
@UseGuards(ApiAccessContextGuard)
export class CustomerAssetController {
  constructor(private readonly service: CustomerAssetService) {}

  @Get("customers")
  listCustomers(
    @Req() request: ApiRequestWithContext,
    @Query() query: Record<string, string | string[] | undefined>
  ) {
    return this.handle(() =>
      this.service.listCustomers(requireAccessContext(request), {
        flag: readFlag(query.flag),
        tagKey: optionalText(readFirst(query.tagKey))
      })
    );
  }

  @Get("customers/:customerId")
  getCustomerDetail(
    @Req() request: ApiRequestWithContext,
    @Param("customerId") customerId: string
  ) {
    return this.handle(() =>
      this.service.getCustomerDetail(requireAccessContext(request), customerId)
    );
  }

  @Get("field-definitions")
  listFieldDefinitions(@Req() request: ApiRequestWithContext) {
    return this.handle(() =>
      this.service.listFieldDefinitions(requireAccessContext(request))
    );
  }

  @Get("tag-definitions")
  listTagDefinitions(@Req() request: ApiRequestWithContext) {
    return this.handle(() =>
      this.service.listTagDefinitions(requireAccessContext(request))
    );
  }

  @Post("customers/:customerId/restore")
  restoreCustomer(
    @Req() request: ApiRequestWithContext,
    @Param("customerId") customerId: string,
    @Body() body: unknown = {}
  ) {
    return this.handle(() =>
      this.service.restoreCustomerFlags(
        requireAccessContext(request),
        customerId,
        readRestoreBody(body)
      )
    );
  }

  private async handle<T>(action: () => Promise<T> | T): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toCustomerAssetHttpException(error);
    }
  }
}

function requireAccessContext(request: ApiRequestWithContext): AccessContext {
  if (!request.accessContext) {
    throw new CustomerAssetApiError(403, "access context is required");
  }
  return request.accessContext;
}

function readRestoreBody(body: unknown): CustomerAssetRestoreInput {
  const record = bodyRecord(body);
  return {
    reasonRef: requiredText(record.reasonRef, "reasonRef"),
    restoreBlacklisted: optionalBoolean(
      record.restoreBlacklisted,
      "restoreBlacklisted"
    ),
    restoreUnreachable: optionalBoolean(record.restoreUnreachable, "restoreUnreachable")
  };
}

function readFlag(
  value: string | string[] | undefined
): CustomerAssetListFilters["flag"] {
  const text = readFirst(value);
  if (text === undefined) return undefined;
  if (text === "blacklisted" || text === "unreachable") return text;
  throw new CustomerAssetApiError(400, "customer flag filter is invalid");
}

function bodyRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function optionalBoolean(value: unknown, name: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new CustomerAssetApiError(400, `${name} must be boolean`);
  }
  return value;
}

function optionalText(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined;
}

function requiredText(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new CustomerAssetApiError(400, `${name} is required`);
  }
  return value.trim();
}

function readFirst(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toCustomerAssetHttpException(error: unknown): Error {
  if (error instanceof CustomerAssetApiError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    if (error.statusCode === 404) return new NotFoundException(error.message);
    return new ForbiddenException(error.message);
  }
  if (error instanceof AuthzError) return new ForbiddenException(error.message);
  return error instanceof Error ? error : new ForbiddenException("customer denied");
}
