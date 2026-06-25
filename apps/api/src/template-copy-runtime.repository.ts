import { randomUUID } from "node:crypto";

import type { AccessContext } from "../../../packages/authz/src/index.ts";
import { createRlsTransactionContext } from "../../../packages/db/src/index.ts";
import { createUzmaxPrismaClientFromEnv } from "../../../packages/db/src/prisma-runtime.ts";
import * as c from "./template-copy-runtime.contracts.ts";

const off = async () => {
  throw new c.TemplateCopyRuntimeError(503, "template copy runtime is not configured");
};

export function createTemplateCopyRuntimeRepositoryProviderFromEnv(
  options: {
    env?: c.RuntimeEnv;
    mode?: c.RuntimeMode;
    prismaClient?: c.PrismaPort;
    repository?: c.TemplateCopyRuntimeRepositoryPort;
    rlsTransactionRunner?: c.RlsTxRunner;
  } = {}
): c.TemplateCopyRuntimeRepositoryPort {
  const mode = options.mode ?? c.readRuntimeMode(options.env ?? process.env);
  if (mode === c.templateCopyRuntimeModes.disabled)
    return options.repository ?? { copyToTenant: off };
  if (mode !== c.templateCopyRuntimeModes.rlsPrismaGateway)
    throw new Error(`unsupported template copy runtime mode: ${mode}`);
  const prisma =
    options.prismaClient ??
    (createUzmaxPrismaClientFromEnv(options.env) as unknown as c.PrismaPort);
  return repo(options.rlsTransactionRunner ?? rlsRunner(prisma));
}

function repo(tx: c.RlsTxRunner): c.TemplateCopyRuntimeRepositoryPort {
  return {
    copyToTenant: async (ctx, input) => {
      const rls = c.scope(ctx);
      const previous = await previousVersion(tx, rls, input.targetKey);
      const now = new Date().toISOString();
      const configVersionId = randomUUID();
      const auditLogId = randomUUID();
      const payload = c.copiedPayload(input, now);
      const version = Number(previous?.version ?? 0) + 1;
      const [configRow] = await tx<readonly c.Row[]>({
        map: ([config]) => [c.row(config, "template copy config version row")],
        ops: (p) => [
          call(p.configVersion.create, {
            data: {
              createdAt: new Date(now),
              createdByUserId: ctx.userId,
              domain: "TEMPLATE_COPY",
              id: configVersionId,
              key: input.targetKey,
              orgId: ctx.orgId,
              payload,
              previousVersionId: previous?.id ?? null,
              reason: input.reasonRef,
              status: "DRAFT",
              tenantId: ctx.selectedTenantId,
              version
            }
          }),
          call(p.auditLog.create, {
            data: audit(ctx, input, auditLogId, configVersionId, previous, payload, now)
          })
        ],
        scope: rls
      });
      if (!configRow)
        throw new c.TemplateCopyRuntimeError(503, "template copy write failed");
      return result(configRow, input, auditLogId, payload);
    }
  };
}

function rlsRunner(prisma: c.PrismaPort): c.RlsTxRunner {
  return async (work) => {
    const context = createRlsTransactionContext(work.scope);
    const setup = [
      prisma.$executeRawUnsafe(context.roleSql),
      ...context.settings.map((setting) => c.setConfig(prisma, setting))
    ];
    const rows = await prisma.$transaction([...setup, ...work.ops(prisma)]);
    const payloadRows = rows.slice(setup.length);
    return work.map ? work.map(payloadRows) : (payloadRows as never);
  };
}

async function previousVersion(
  tx: c.RlsTxRunner,
  scope: ReturnType<typeof c.scope>,
  key: string
) {
  return tx<c.Row | undefined>({
    map: ([row]) => (row ? c.row(row, "previous template copy row") : undefined),
    ops: (p) => [
      call(p.configVersion.findFirst, {
        orderBy: { version: "desc" },
        where: { ...scope, domain: "TEMPLATE_COPY", key }
      })
    ],
    scope
  });
}

function audit(
  ctx: AccessContext,
  input: c.TemplateCopyInput,
  id: string,
  configVersionId: string,
  previous: c.Row | undefined,
  payload: c.Row,
  occurredAt: string
) {
  return {
    action: "copy_to_tenant",
    actorUserId: ctx.userId,
    afterVersionId: configVersionId,
    beforeVersionId: c.text(previous?.id),
    content: {
      after: {
        configVersionId,
        configVersionRef: versionRef(configVersionId),
        copiedPayload: payload,
        sourceTemplateRef: input.sourceTemplateRef,
        templateKind: input.templateKind
      },
      before: previous
        ? {
            configVersionId: previous.id,
            payload: previous.payload,
            version: previous.version
          }
        : null
    },
    eventType: "template_copy.copied",
    id,
    module: "template_copy_runtime",
    objectId: configVersionId,
    objectType: "config_version",
    occurredAt: new Date(occurredAt),
    orgId: ctx.orgId,
    tenantId: ctx.selectedTenantId,
    traceId: input.traceId ?? `template-copy:${input.targetKey}`
  };
}

function result(
  row: c.Row,
  input: c.TemplateCopyInput,
  auditLogId: string,
  payload: c.Row
) {
  return {
    auditLogId,
    auditRef: `controlled://audit-log/${auditLogId}`,
    configVersionId: row.id,
    configVersionRef: versionRef(row.id),
    copiedPayload: payload,
    status: "draft",
    targetKey: input.targetKey,
    templateKind: input.templateKind,
    tenantVersionRef: `controlled://tenant-template-copy/${row.id}`,
    version: row.version
  };
}

function versionRef(id: unknown) {
  return `controlled://config-version/template_copy/${id}`;
}

function call(fn: unknown, args: c.Row) {
  if (typeof fn !== "function")
    throw new c.TemplateCopyRuntimeError(503, "Prisma delegate is incomplete");
  return fn(args) as c.Operation;
}
