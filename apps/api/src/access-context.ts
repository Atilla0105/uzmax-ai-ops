import {
  BadRequestException,
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
  Inject,
  Injectable,
  Post,
  Req,
  ServiceUnavailableException,
  SetMetadata,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  AccessContext,
  AuthzRepository
} from "../../../packages/authz/src/index.ts";
import {
  ApiAccessContextCore,
  ApiAccessError,
  type ApiRequest,
  type AuditSink,
  type IdentityVerifier,
  readTenantIdFromBody
} from "./access-context-core.ts";

export { InMemoryAuditSink } from "./access-context-core.ts";

export const API_AUDIT_SINK = "API_AUDIT_SINK";
export const API_AUTHZ_REPOSITORY = "API_AUTHZ_REPOSITORY";
export const API_IDENTITY_VERIFIER = "API_IDENTITY_VERIFIER";
const REQUIRED_PERMISSION_METADATA = "uzmax:required-permission";

function RequirePermission(permission: string) {
  return SetMetadata(REQUIRED_PERMISSION_METADATA, permission);
}

@Injectable()
class DisabledIdentityVerifier implements IdentityVerifier {
  async verifyBearerToken(): Promise<{ userId: string }> {
    throw new ApiAccessError(401, "identity verifier is not configured");
  }

  readinessStatus() {
    return "not_configured" as const;
  }
}

@Injectable()
class SupabaseIdentityVerifier implements IdentityVerifier {
  constructor(private readonly supabase: SupabaseClient) {}

  async verifyBearerToken(token: string): Promise<{ userId: string }> {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user?.id) {
      throw new ApiAccessError(401, "supabase token is invalid");
    }

    return { userId: data.user.id };
  }

  readinessStatus() {
    return "configured" as const;
  }
}

@Injectable()
export class DisabledAuthzRepository implements AuthzRepository {
  async loadAccessContextFacts(): Promise<never> {
    throw new ApiAccessError(403, "authz repository is not configured");
  }

  readinessStatus() {
    return "not_configured" as const;
  }
}

@Injectable()
export class ApiAccessContextService {
  private readonly core: ApiAccessContextCore;

  constructor(
    @Inject(API_IDENTITY_VERIFIER)
    identityVerifier: IdentityVerifier,
    @Inject(API_AUTHZ_REPOSITORY)
    authzRepository: AuthzRepository,
    @Inject(API_AUDIT_SINK)
    auditSink: AuditSink
  ) {
    this.core = new ApiAccessContextCore(identityVerifier, authzRepository, auditSink);
  }

  health() {
    return this.core.health();
  }

  readiness() {
    return this.core.readiness();
  }

  async loadContextForRequest(request: ApiRequest): Promise<AccessContext> {
    return this.mapErrors(() => this.core.loadContextForRequest(request));
  }

  async switchTenant(request: ApiRequest, targetTenantId: string) {
    return this.mapErrors(() => this.core.switchTenant(request, targetTenantId));
  }

  assertPermission(accessContext: AccessContext, permission: string): AccessContext {
    try {
      return this.core.assertPermission(accessContext, permission);
    } catch (error) {
      throw toHttpException(error);
    }
  }

  private async mapErrors<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toHttpException(error);
    }
  }
}

@Injectable()
export class ApiAccessContextGuard implements CanActivate {
  constructor(
    private readonly accessContextService: ApiAccessContextService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<ApiRequest>();
    const accessContext =
      await this.accessContextService.loadContextForRequest(request);
    const requiredPermission = this.reflector.get<string>(
      REQUIRED_PERMISSION_METADATA,
      context.getHandler()
    );

    if (requiredPermission) {
      this.accessContextService.assertPermission(accessContext, requiredPermission);
    }

    return true;
  }
}

@Controller()
export class ApiHealthController {
  constructor(private readonly accessContextService: ApiAccessContextService) {}

  @Get("healthz")
  health() {
    return this.accessContextService.health();
  }

  @Get("readyz")
  readiness() {
    const readiness = this.accessContextService.readiness();
    if (readiness.status !== "ready") {
      throw new ServiceUnavailableException(readiness);
    }

    return readiness;
  }
}

@Controller()
export class ApiAccessContextController {
  constructor(private readonly accessContextService: ApiAccessContextService) {}

  @Get("me/access-context")
  @RequirePermission("tenant:read")
  @UseGuards(ApiAccessContextGuard)
  me(@Req() request: ApiRequest) {
    return { accessContext: request.accessContext };
  }

  @Post("tenant/switch")
  async switchTenant(@Req() request: ApiRequest, @Body() body: unknown) {
    const targetTenantId = readTenantIdFromBody(body);
    return this.accessContextService.switchTenant(request, targetTenantId);
  }
}

export function createIdentityVerifierFromEnv(
  env: NodeJS.ProcessEnv = process.env
): IdentityVerifier {
  if (!env.UZMAX_SUPABASE_URL || !env.UZMAX_SUPABASE_PUBLISHABLE_KEY) {
    return new DisabledIdentityVerifier();
  }

  return new SupabaseIdentityVerifier(
    createClient(env.UZMAX_SUPABASE_URL, env.UZMAX_SUPABASE_PUBLISHABLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  );
}

function toHttpException(error: unknown): Error {
  if (error instanceof ApiAccessError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    if (error.statusCode === 401) return new UnauthorizedException(error.message);
    return new ForbiddenException(error.message);
  }

  return error instanceof Error ? error : new ForbiddenException("access denied");
}
