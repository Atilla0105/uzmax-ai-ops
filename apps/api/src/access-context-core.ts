import {
  type AccessContext,
  assertPermission,
  AuthzError,
  type AuthzRepository,
  resolveAccessContext
} from "../../../packages/authz/src/index.ts";
import {
  createRlsTransactionContext,
  type RlsTransactionContext
} from "../../../packages/db/src/index.ts";

export type ApiIdentity = {
  userId: string;
};

export type ApiRequest = {
  accessContext?: AccessContext;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

export type ApiAuditEvent = {
  actorUserId?: string;
  eventType: "access_context.denied" | "tenant_switch.allowed" | "tenant_switch.denied";
  membershipVersion?: number;
  occurredAt: string;
  orgId?: string;
  reason?: string;
  tenantId?: string;
};

export type ComponentReadinessStatus = "configured" | "contract" | "not_configured";

export type IdentityVerifier = {
  verifyBearerToken(token: string): Promise<ApiIdentity>;
};

export type AuditSink = {
  record(event: ApiAuditEvent): Promise<void>;
};

export class InMemoryAuditSink implements AuditSink {
  readonly events: ApiAuditEvent[] = [];

  async record(event: ApiAuditEvent): Promise<void> {
    this.events.push(event);
  }

  readinessStatus(): ComponentReadinessStatus {
    return "contract";
  }
}

export class ApiAccessError extends Error {
  constructor(
    readonly statusCode: 400 | 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "ApiAccessError";
  }
}

export class ApiAccessContextCore {
  constructor(
    private readonly identityVerifier: IdentityVerifier,
    private readonly authzRepository: AuthzRepository,
    private readonly auditSink: AuditSink
  ) {}

  health() {
    return { service: "api", status: "ok" } as const;
  }

  readiness() {
    const checks = {
      accessContext: "contract",
      audit: readComponentStatus(this.auditSink, "contract"),
      authz: readComponentStatus(this.authzRepository, "contract"),
      database: "contract",
      identity: readComponentStatus(this.identityVerifier, "contract")
    } as const;

    return {
      checks,
      service: "api",
      status: Object.values(checks).includes("not_configured") ? "not_ready" : "ready"
    } as const;
  }

  async loadContextForRequest(
    request: ApiRequest,
    selectedTenantId = readTenantId(request)
  ): Promise<AccessContext> {
    delete request.accessContext;
    const token = readBearerToken(request.headers.authorization);
    const identity = await this.identityVerifier.verifyBearerToken(token);
    const accessContext = await this.resolveContextOrDeny(identity, selectedTenantId);
    request.accessContext = accessContext;
    return accessContext;
  }

  async switchTenant(
    request: ApiRequest,
    targetTenantId: string
  ): Promise<{
    accessContext: AccessContext;
    rls: RlsTransactionContext;
  }> {
    delete request.accessContext;
    const token = readBearerToken(request.headers.authorization);
    const identity = await this.identityVerifier.verifyBearerToken(token);

    try {
      const accessContext = await resolveAccessContext(this.authzRepository, {
        selectedTenantId: requireTenantId(targetTenantId),
        userId: identity.userId
      });
      assertPermission(accessContext, "tenant:switch");
      request.accessContext = accessContext;
      await this.recordTenantSwitch("tenant_switch.allowed", accessContext);
      return {
        accessContext,
        rls: createRlsTransactionContext({
          orgId: accessContext.orgId,
          tenantId: accessContext.selectedTenantId
        })
      };
    } catch (error) {
      await this.auditSink.record({
        actorUserId: identity.userId,
        eventType: "tenant_switch.denied",
        occurredAt: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "tenant switch denied",
        tenantId: targetTenantId
      });
      throw mapAuthzError(error);
    }
  }

  assertPermission(accessContext: AccessContext, permission: string): AccessContext {
    try {
      return assertPermission(accessContext, permission);
    } catch (error) {
      throw mapAuthzError(error);
    }
  }

  private async resolveContextOrDeny(
    identity: ApiIdentity,
    selectedTenantId: string
  ): Promise<AccessContext> {
    try {
      return await resolveAccessContext(this.authzRepository, {
        selectedTenantId: requireTenantId(selectedTenantId),
        userId: identity.userId
      });
    } catch (error) {
      await this.auditSink.record({
        actorUserId: identity.userId,
        eventType: "access_context.denied",
        occurredAt: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "access context denied",
        tenantId: selectedTenantId
      });
      throw mapAuthzError(error);
    }
  }

  private async recordTenantSwitch(
    eventType: "tenant_switch.allowed",
    accessContext: AccessContext
  ): Promise<void> {
    await this.auditSink.record({
      actorUserId: accessContext.userId,
      eventType,
      membershipVersion: accessContext.membershipVersion,
      occurredAt: new Date().toISOString(),
      orgId: accessContext.orgId,
      tenantId: accessContext.selectedTenantId
    });
  }
}

function readBearerToken(authorization: string | string[] | undefined): string {
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  const match = value?.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    throw new ApiAccessError(401, "authorization header must be Bearer");
  }

  return match[1];
}

function readTenantId(request: ApiRequest): string {
  const header = request.headers["x-tenant-id"];
  const query = request.query?.tenant_id;
  const value = Array.isArray(header) ? header[0] : header;
  const fallback = Array.isArray(query) ? query[0] : query;
  return requireTenantId(value ?? fallback ?? readTenantIdFromBody(request.body));
}

export function readTenantIdFromBody(body: unknown): string {
  if (!body || typeof body !== "object") {
    throw new ApiAccessError(400, "tenant_id is required");
  }

  const value = (body as { tenant_id?: unknown }).tenant_id;
  if (typeof value !== "string") {
    throw new ApiAccessError(400, "tenant_id is required");
  }

  return requireTenantId(value);
}

function requireTenantId(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new ApiAccessError(400, "tenant_id is required");
  }

  return trimmed;
}

function mapAuthzError(error: unknown): Error {
  if (error instanceof ApiAccessError) {
    return error;
  }

  if (error instanceof AuthzError) {
    return new ApiAccessError(403, error.message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new ApiAccessError(403, "access denied");
}

function readComponentStatus(
  component: unknown,
  fallback: ComponentReadinessStatus
): ComponentReadinessStatus {
  const candidate = component as { readinessStatus?: () => ComponentReadinessStatus };
  return candidate.readinessStatus?.() ?? fallback;
}
