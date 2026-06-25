import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
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
  AI_MEMBER_RUNTIME_REPOSITORY,
  AiMemberRuntimeError,
  actionInput,
  capability,
  toggleInput,
  uuid,
  type AiMemberRuntimeRepositoryPort,
  type Row,
  type RuntimeRequest
} from "./ai-member-runtime.contracts.ts";

export {
  AI_MEMBER_RUNTIME_REPOSITORY,
  type AiMemberRuntimeRepositoryPort
} from "./ai-member-runtime.contracts.ts";
export { createAiMemberRuntimeRepositoryProviderFromEnv } from "./ai-member-runtime.repository.ts";

@Controller("ai-members")
@UseGuards(ApiAccessContextGuard)
export class AiMemberRuntimeController {
  constructor(
    @Inject(AI_MEMBER_RUNTIME_REPOSITORY)
    private readonly repository: AiMemberRuntimeRepositoryPort
  ) {}

  @Get(":memberId/runtime-control")
  getRuntimeState(@Req() request: RuntimeRequest, @Param("memberId") memberId: string) {
    return this.handle(() => {
      const access = requestAccessContext(request);
      assertPermission(access, "ai_member:read");
      return this.repository.getRuntimeState(access, uuid(memberId, "memberId"));
    });
  }

  @Post(":memberId/runtime-control/emergency-stop")
  emergencyStop(
    @Req() request: RuntimeRequest,
    @Param("memberId") memberId: string,
    @Body() body: unknown = {}
  ) {
    return this.write(request, memberId, (access, id) =>
      this.repository.emergencyStop(access, id, actionInput(body))
    );
  }

  @Post(":memberId/runtime-control/recover")
  recoverOnline(
    @Req() request: RuntimeRequest,
    @Param("memberId") memberId: string,
    @Body() body: unknown = {}
  ) {
    return this.write(request, memberId, (access, id) =>
      this.repository.recoverOnline(access, id, actionInput(body))
    );
  }

  @Post(":memberId/runtime-control/capabilities/:capabilityKey")
  toggleCapability(
    @Req() request: RuntimeRequest,
    @Param("memberId") memberId: string,
    @Param("capabilityKey") capabilityKey: string,
    @Body() body: unknown = {}
  ) {
    return this.write(request, memberId, (access, id) =>
      this.repository.toggleCapability(
        access,
        id,
        capability(capabilityKey),
        toggleInput(body)
      )
    );
  }

  private write(
    request: RuntimeRequest,
    memberId: string,
    action: (ctx: AccessContext, memberId: string) => Promise<Row>
  ) {
    return this.handle(() => {
      const access = requestAccessContext(request);
      assertPermission(access, "ai_member:write");
      return action(access, uuid(memberId, "memberId"));
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
    throw new AiMemberRuntimeError(503, "access context is required");
  return request.accessContext;
}

function http(error: unknown): Error {
  if (error instanceof AiMemberRuntimeError) return runtimeHttpError(error);
  if (error instanceof AuthzError) return new ForbiddenException(error.message);
  return error instanceof Error
    ? error
    : new ForbiddenException("AI member runtime access denied");
}

function runtimeHttpError(error: AiMemberRuntimeError) {
  if (error.statusCode === 400) return new BadRequestException(error.message);
  if (error.statusCode === 404) return new NotFoundException(error.message);
  return new ServiceUnavailableException(error.message);
}
