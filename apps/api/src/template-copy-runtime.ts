import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Inject,
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
  TEMPLATE_COPY_RUNTIME_REPOSITORY,
  TemplateCopyRuntimeError,
  copyInput,
  type RuntimeRequest,
  type TemplateCopyRuntimeRepositoryPort
} from "./template-copy-runtime.contracts.ts";

export {
  TEMPLATE_COPY_RUNTIME_REPOSITORY,
  type TemplateCopyRuntimeRepositoryPort
} from "./template-copy-runtime.contracts.ts";
export { createTemplateCopyRuntimeRepositoryProviderFromEnv } from "./template-copy-runtime.repository.ts";

@Controller("template-copy")
@UseGuards(ApiAccessContextGuard)
export class TemplateCopyRuntimeController {
  constructor(
    @Inject(TEMPLATE_COPY_RUNTIME_REPOSITORY)
    private readonly repository: TemplateCopyRuntimeRepositoryPort
  ) {}

  @Post("copies")
  copyToTenant(@Req() request: RuntimeRequest, @Body() body: unknown = {}) {
    return this.handle(() => {
      const access = requestAccessContext(request);
      assertPermission(access, "template:write");
      return this.repository.copyToTenant(access, copyInput(body));
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
    throw new TemplateCopyRuntimeError(503, "access context is required");
  return request.accessContext;
}

function http(error: unknown): Error {
  if (error instanceof TemplateCopyRuntimeError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    return new ServiceUnavailableException(error.message);
  }
  if (error instanceof AuthzError) return new ForbiddenException(error.message);
  return error instanceof Error
    ? error
    : new ForbiddenException("template copy access denied");
}
