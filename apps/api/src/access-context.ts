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
  AccessContextFacts,
  AuthzRepository,
  MembershipStatus,
  PermissionGrant,
  TenantMembership
} from "../../../packages/authz/src/index.ts";
import {
  createUzmaxPrismaClientFromEnv,
  type UzmaxPrismaRuntimeEnv
} from "../../../packages/db/src/prisma-runtime.ts";
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
type ApiAuthzRepositoryRuntimeEnv = UzmaxPrismaRuntimeEnv &
  Partial<Record<"UZMAX_API_AUTHZ_REPOSITORY_MODE", string>>;
type ApiAuthzRepositoryRuntimeMode = "disabled" | "rls_prisma_gateway";
type PrismaAuthzRow = Record<string, unknown>;
type PrismaAuthzDelegate = {
  findMany(args: Record<string, unknown>): Promise<PrismaAuthzRow[]>;
};
type PrismaAuthzClientPort = {
  permissionGrant: PrismaAuthzDelegate;
  tenantMember: PrismaAuthzDelegate;
  $transaction(
    operations: readonly Promise<PrismaAuthzRow[]>[]
  ): Promise<[PrismaAuthzRow[], PrismaAuthzRow[]]>;
};

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
export class RlsPrismaAuthzRepository implements AuthzRepository {
  constructor(private readonly prisma: PrismaAuthzClientPort) {}

  async loadAccessContextFacts(request: {
    selectedTenantId: string;
    userId: string;
  }): Promise<AccessContextFacts> {
    const [memberships, grants] = await this.prisma.$transaction([
      this.prisma.tenantMember.findMany({
        orderBy: [{ orgId: "asc" }, { tenantId: "asc" }],
        select: {
          cacheVersion: true,
          orgId: true,
          role: true,
          status: true,
          tenantId: true,
          userId: true
        },
        where: { userId: request.userId }
      }),
      this.prisma.permissionGrant.findMany({
        orderBy: [{ permission: "asc" }],
        select: {
          orgId: true,
          permission: true,
          tenantId: true,
          userId: true
        },
        where: {
          tenantId: request.selectedTenantId,
          tenantMember: { status: "ACTIVE" },
          userId: request.userId
        }
      })
    ]);

    return {
      permissionGrants: grants.map(toPermissionGrant),
      tenantMemberships: memberships.map(toTenantMembership)
    };
  }

  readinessStatus() {
    return "configured" as const;
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

export function createAuthzRepositoryProviderFromEnv(
  options: {
    env?: ApiAuthzRepositoryRuntimeEnv;
    mode?: ApiAuthzRepositoryRuntimeMode;
    prismaClient?: PrismaAuthzClientPort;
    repository?: AuthzRepository;
  } = {}
): AuthzRepository {
  const env = options.env ?? process.env;
  const mode = options.mode ?? readApiAuthzRepositoryRuntimeMode(env);

  if (mode === "disabled") return options.repository ?? new DisabledAuthzRepository();

  const prisma =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(env) as unknown as PrismaAuthzClientPort);
  return new RlsPrismaAuthzRepository(prisma);
}

function toHttpException(error: unknown): Error {
  if (error instanceof ApiAccessError) {
    if (error.statusCode === 400) return new BadRequestException(error.message);
    if (error.statusCode === 401) return new UnauthorizedException(error.message);
    return new ForbiddenException(error.message);
  }

  return error instanceof Error ? error : new ForbiddenException("access denied");
}

function readApiAuthzRepositoryRuntimeMode(
  env: ApiAuthzRepositoryRuntimeEnv = process.env
): ApiAuthzRepositoryRuntimeMode {
  const mode = env.UZMAX_API_AUTHZ_REPOSITORY_MODE?.trim() || "disabled";
  if (mode === "prisma_gateway")
    throw new Error("API authz repository env must use RLS Prisma gateway");
  if (mode === "disabled" || mode === "rls_prisma_gateway") return mode;
  throw new Error(`unsupported API authz repository mode: ${mode}`);
}

function toTenantMembership(row: PrismaAuthzRow): TenantMembership {
  return {
    cacheVersion: Number(row.cacheVersion),
    orgId: String(row.orgId),
    role: String(row.role),
    status: authzMembershipStatus(row.status),
    tenantId: String(row.tenantId),
    userId: String(row.userId)
  };
}

function toPermissionGrant(row: PrismaAuthzRow): PermissionGrant {
  return {
    orgId: String(row.orgId),
    permission: String(row.permission),
    tenantId: String(row.tenantId),
    userId: String(row.userId)
  };
}

function authzMembershipStatus(value: unknown): MembershipStatus {
  return String(value).toLowerCase() === "active" ? "active" : "revoked";
}
