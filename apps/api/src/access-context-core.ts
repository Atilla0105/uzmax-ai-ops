import {
  type AccessContext,
  assertPermission,
  AuthzError,
  type AuthzRepository,
  resolveAccessContext
} from "../../../packages/authz/src/index.ts";
import {
  auditEventTypes,
  configVersionStatuses,
  createConfigVersionAuditContract,
  createPermissionGrantAuditContract,
  createRlsTransactionContext,
  createScopedConfigVersionContract,
  createTenantSwitchAuditContract,
  type AuditLogContract,
  type ConfigVersionDraftInput,
  type ConfigVersionAuditInput
} from "../../../packages/db/src/index.ts";

export type ApiRequest = {
  accessContext?: AccessContext;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

export type ApiAuditEvent =
  | AuditLogContract
  | {
      actorUserId?: string;
      eventType: typeof auditEventTypes.accessContextDenied;
      occurredAt: string;
      reason?: string;
      tenantId?: string;
    };

export type ApiPermissionChangeInput = {
  after: Record<string, unknown>;
  before: Record<string, unknown>;
  permission: string;
  targetUserId: string;
  tenantId?: string;
  traceId?: string;
};

export type ApiConfigVersionSaveInput = ConfigVersionDraftInput & {
  tenantId?: string;
  traceId?: string;
};

export type ApiConfigVersionRollbackInput = ApiConfigVersionSaveInput & {
  rollbackOfVersionId: string;
};

export type ComponentReadinessStatus = "configured" | "contract" | "not_configured";

export type IdentityVerifier = {
  verifyBearerToken(token: string): Promise<{ userId: string }>;
};

export type AuditSink = { record(event: ApiAuditEvent): Promise<void> };

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

  async switchTenant(request: ApiRequest, targetTenantId: string) {
    delete request.accessContext;
    const token = readBearerToken(request.headers.authorization);
    const identity = await this.identityVerifier.verifyBearerToken(token);
    let accessContext: AccessContext | undefined;

    try {
      accessContext = await resolveAccessContext(this.authzRepository, {
        selectedTenantId: requireTenantId(targetTenantId),
        userId: identity.userId
      });
      assertPermission(accessContext, "tenant:switch");
      request.accessContext = accessContext;
      await this.recordTenantSwitch(accessContext);
      return {
        accessContext,
        rls: createRlsTransactionContext({
          orgId: accessContext.orgId,
          tenantId: accessContext.selectedTenantId
        })
      };
    } catch (error) {
      await this.recordTenantSwitchDenied(
        identity.userId,
        request,
        targetTenantId,
        error,
        accessContext
      );
      throw mapAuthzError(error);
    }
  }

  async recordPermissionChange(
    request: ApiRequest,
    input: ApiPermissionChangeInput
  ): Promise<{ accessContext: AccessContext; auditEvent: AuditLogContract }> {
    const accessContext = await this.loadContextWithPermission(
      request,
      input.tenantId ?? readTenantId(request),
      "permission:write"
    );
    const auditEvent = createPermissionGrantAuditContract({
      after: input.after,
      actorUserId: accessContext.userId,
      before: input.before,
      orgId: accessContext.orgId,
      permission: input.permission,
      targetUserId: input.targetUserId,
      tenantId: accessContext.selectedTenantId,
      ...(input.traceId ? { traceId: input.traceId } : {})
    });
    await this.auditSink.record(auditEvent);
    return { accessContext, auditEvent };
  }

  async recordConfigVersionSave(request: ApiRequest, input: ApiConfigVersionSaveInput) {
    return this.recordConfigVersion(
      request,
      input,
      "config:write",
      auditEventTypes.configVersionSaved,
      "save",
      input.previousVersionId
    );
  }

  async recordConfigVersionRollback(
    request: ApiRequest,
    input: ApiConfigVersionRollbackInput
  ) {
    return this.recordConfigVersion(
      request,
      { ...input, status: configVersionStatuses.active },
      "config:rollback",
      auditEventTypes.configVersionRollbackRequested,
      "rollback_requested",
      input.rollbackOfVersionId
    );
  }

  assertPermission(accessContext: AccessContext, permission: string): AccessContext {
    try {
      return assertPermission(accessContext, permission);
    } catch (error) {
      throw mapAuthzError(error);
    }
  }

  private async loadContextWithPermission(
    request: ApiRequest,
    tenantId: string,
    permission: string
  ): Promise<AccessContext> {
    const accessContext = await this.loadContextForRequest(request, tenantId);
    return this.assertPermission(accessContext, permission);
  }

  private async recordConfigVersion(
    request: ApiRequest,
    input: ApiConfigVersionSaveInput | ApiConfigVersionRollbackInput,
    permission: string,
    eventType: ConfigVersionAuditInput["eventType"],
    action: "rollback_requested" | "save",
    beforeVersionId: string | undefined
  ) {
    const accessContext = await this.loadContextWithPermission(
      request,
      input.tenantId ?? readTenantId(request),
      permission
    );
    const configVersion = createScopedConfigVersionContract({
      ...input,
      createdByUserId: accessContext.userId,
      orgId: accessContext.orgId,
      tenantId: accessContext.selectedTenantId
    });
    const auditEvent = createConfigVersionAuditContract({
      action,
      actorUserId: accessContext.userId,
      beforeVersionId,
      configVersion,
      eventType,
      orgId: accessContext.orgId,
      tenantId: accessContext.selectedTenantId,
      ...(input.traceId ? { traceId: input.traceId } : {})
    });
    await this.auditSink.record(auditEvent);
    return { accessContext, auditEvent, configVersion };
  }

  private async resolveContextOrDeny(
    identity: { userId: string },
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
        eventType: auditEventTypes.accessContextDenied,
        occurredAt: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "access context denied",
        tenantId: selectedTenantId
      });
      throw mapAuthzError(error);
    }
  }

  private async recordTenantSwitch(accessContext: AccessContext) {
    await this.auditSink.record(
      createTenantSwitchAuditContract({
        actorUserId: accessContext.userId,
        membershipVersion: accessContext.membershipVersion,
        orgId: accessContext.orgId,
        tenantId: accessContext.selectedTenantId
      })
    );
  }

  private async recordTenantSwitchDenied(
    actorUserId: string,
    request: ApiRequest,
    targetTenantId: string,
    error: unknown,
    accessContext?: AccessContext
  ) {
    const auditContext =
      accessContext ??
      (await this.resolveTenantSwitchAuditContext(actorUserId, request));
    if (!auditContext) {
      await this.auditSink.record({
        actorUserId,
        eventType: auditEventTypes.accessContextDenied,
        occurredAt: new Date().toISOString(),
        reason: error instanceof Error ? error.message : "tenant switch denied",
        tenantId: targetTenantId
      });
      return;
    }
    await this.auditSink.record(
      createTenantSwitchAuditContract({
        actorUserId,
        orgId: auditContext.orgId,
        reason: error instanceof Error ? error.message : "tenant switch denied",
        targetTenantId,
        tenantId: auditContext.selectedTenantId
      })
    );
  }

  private async resolveTenantSwitchAuditContext(
    actorUserId: string,
    request: ApiRequest
  ) {
    try {
      return await resolveAccessContext(this.authzRepository, {
        selectedTenantId: readTenantId(request),
        userId: actorUserId
      });
    } catch {
      return undefined;
    }
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
