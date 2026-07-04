import * as nest from "@nestjs/common";

import { AuthzError, type AccessContext } from "../../../packages/authz/src/index.ts";
import { ApiAccessContextGuard } from "./access-context.ts";
import {
  GroupOverviewApiError,
  parseGroupOverviewQuery
} from "./group-overview.contracts.ts";
import { GroupOverviewService } from "./group-overview.service.ts";

type RequestWithContext = { accessContext?: AccessContext };

@nest.Controller("group-overview")
@nest.UseGuards(ApiAccessContextGuard)
export class GroupOverviewController {
  constructor(private readonly service: GroupOverviewService) {}

  @nest.Get()
  async getOverview(
    @nest.Req() request: RequestWithContext,
    @nest.Query() query: Record<string, unknown>
  ) {
    try {
      return await this.service.getOverview(
        requireAccessContext(request),
        parseGroupOverviewQuery(query)
      );
    } catch (error) {
      throw toHttp(error);
    }
  }
}

function requireAccessContext(request: RequestWithContext): AccessContext {
  if (!request.accessContext)
    throw new GroupOverviewApiError(403, "access context is required");
  return request.accessContext;
}

function toHttp(error: unknown): Error {
  if (error instanceof GroupOverviewApiError) {
    if (error.statusCode === 400) return new nest.BadRequestException(error.message);
    return error.statusCode === 503
      ? new nest.ServiceUnavailableException(error.response ?? error.message)
      : new nest.ForbiddenException(error.message);
  }
  if (error instanceof AuthzError) return new nest.ForbiddenException(error.message);
  return error instanceof Error
    ? error
    : new nest.ForbiddenException("group overview access denied");
}
