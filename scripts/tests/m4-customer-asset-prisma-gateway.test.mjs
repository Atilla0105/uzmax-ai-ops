import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_A = "22222222-2222-4222-8222-222222222222";
const CUSTOMER_A = "55555555-5555-4555-8555-555555555555";
const FIELD_A = "88888888-8888-4888-8888-888888888888";
const TAG_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const gatewaySource = read("apps/api/src/customer-asset.prisma-gateway.ts");
const appModule = read("apps/api/src/app.module.ts");
const schema = read("packages/db/prisma/schema.prisma");
const spec = read("docs/specs/M4-18-customer-asset-prisma-gateway.md");
const evidence = read("docs/evidence/M4/M4-18-customer-asset-prisma-gateway.md");
const m4Index = read("docs/evidence/M4/README.md");
const api = await importTypescriptSource(
  "apps/api/src/customer-asset.prisma-gateway.ts"
);

describe("M4-18 customer asset Prisma gateway", () => {
  it("calls the scoped customer list delegate without creating a client", async () => {
    const calls = [];
    const gateway = new api.module.PrismaCustomerAssetPersistenceGateway(
      prismaStub({
        customer: {
          async findMany(args) {
            calls.push({ args, delegate: "customer.findMany" });
            return [customerRow()];
          }
        }
      })
    );

    const rows = await gateway.listCustomers(scope());

    assert.deepEqual(calls, [
      {
        args: {
          orderBy: { updatedAt: "desc" },
          take: 100,
          where: scope()
        },
        delegate: "customer.findMany"
      }
    ]);
    assert.equal(rows[0].id, CUSTOMER_A);
  });

  it("maps detail delegates with tenant scope and bounded ordering", async () => {
    const calls = [];
    const gateway = new api.module.PrismaCustomerAssetPersistenceGateway(
      prismaStub({
        customer: {
          async findFirst(args) {
            calls.push({ args, delegate: "customer.findFirst" });
            return customerRow();
          }
        },
        customerFieldValue: captureFindMany(calls, "customerFieldValue.findMany"),
        customerIdentity: captureFindMany(calls, "customerIdentity.findMany"),
        customFieldDefinition: captureFindMany(calls, "customFieldDefinition.findMany"),
        tagAssignment: captureFindMany(calls, "tagAssignment.findMany"),
        tagDefinition: captureFindMany(calls, "tagDefinition.findMany")
      })
    );

    await gateway.getCustomer(scope(), CUSTOMER_A);
    await gateway.listFieldDefinitions(scope());
    await gateway.listFieldValues(scope(), CUSTOMER_A);
    await gateway.listIdentities(scope(), CUSTOMER_A);
    await gateway.listTagDefinitions(scope());
    await gateway.listTagAssignments(scope(), CUSTOMER_A);

    assert.deepEqual(calls, [
      {
        args: { where: { ...scope(), id: CUSTOMER_A } },
        delegate: "customer.findFirst"
      },
      {
        args: { orderBy: { fieldKey: "asc" }, where: scope() },
        delegate: "customFieldDefinition.findMany"
      },
      {
        args: {
          orderBy: { updatedAt: "desc" },
          where: { ...scope(), customerId: CUSTOMER_A }
        },
        delegate: "customerFieldValue.findMany"
      },
      {
        args: {
          orderBy: { lastSeenAt: "desc" },
          where: { ...scope(), customerId: CUSTOMER_A }
        },
        delegate: "customerIdentity.findMany"
      },
      {
        args: {
          orderBy: { tagKey: "asc" },
          where: { ...scope(), targetKind: "CUSTOMER" }
        },
        delegate: "tagDefinition.findMany"
      },
      {
        args: {
          orderBy: { assignedAt: "desc" },
          where: { ...scope(), customerId: CUSTOMER_A }
        },
        delegate: "tagAssignment.findMany"
      }
    ]);
  });

  it("updates customer restore flags through the scoped compound key only", async () => {
    const calls = [];
    const gateway = new api.module.PrismaCustomerAssetPersistenceGateway(
      prismaStub({
        customer: {
          async update(args) {
            calls.push({ args, delegate: "customer.update" });
            return { ...customerRow(), ...args.data };
          }
        }
      })
    );

    const saved = await gateway.saveCustomer(scope(), {
      ...customerRow(),
      blacklistedAt: undefined,
      isBlacklisted: false,
      isUnreachable: false,
      unreachableAt: undefined
    });

    assert.deepEqual(calls, [
      {
        args: {
          data: {
            blacklistedAt: null,
            isBlacklisted: false,
            isUnreachable: false,
            unreachableAt: null
          },
          where: {
            id_orgId_tenantId: {
              id: CUSTOMER_A,
              orgId: ORG_ID,
              tenantId: TENANT_A
            }
          }
        },
        delegate: "customer.update"
      }
    ]);
    assert.equal(saved.isBlacklisted, false);
    assert.equal(saved.isUnreachable, false);
  });

  it("records a contract-only Prisma gateway without runtime DB wiring", () => {
    for (const model of [
      "Customer",
      "CustomerIdentity",
      "CustomFieldDefinition",
      "CustomerFieldValue",
      "TagDefinition",
      "TagAssignment"
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
    }
    assert.match(gatewaySource, /type CustomerAssetPrismaClientPort/);
    assert.match(gatewaySource, /class PrismaCustomerAssetPersistenceGateway/);
    assert.match(appModule, /PrismaCustomerAssetPersistenceGateway/);
    assert.doesNotMatch(
      appModule,
      /useClass: PrismaCustomerAssetPersistenceGateway|useExisting: PrismaCustomerAssetPersistenceGateway/
    );
    assert.match(spec, /Prisma delegate gateway contract/);
    assert.match(evidence, /no raw customer\/order data/);
    assert.match(m4Index, /M4-18 customer asset Prisma gateway/);
    assert.doesNotMatch(
      `${gatewaySource}\n${appModule}`,
      /@prisma\/client|new PrismaClient|process\.env|fetch\(|https?:\/\//i
    );
  });
});

function scope() {
  return { orgId: ORG_ID, tenantId: TENANT_A };
}

function customerRow() {
  return {
    id: CUSTOMER_A,
    isBlacklisted: true,
    isUnreachable: true,
    metadata: { relatedRefs: { orderSnapshotRefs: ["order-snapshot://a"] } },
    orgId: ORG_ID,
    status: "active",
    tenantId: TENANT_A,
    unresolvedIssueCount: 1
  };
}

function captureFindMany(calls, delegate) {
  return {
    async findMany(args) {
      calls.push({ args, delegate });
      return [];
    }
  };
}

function prismaStub(overrides = {}) {
  return {
    customer: {
      findFirst: async () => null,
      findMany: async () => [],
      update: async () => customerRow(),
      ...(overrides.customer ?? {})
    },
    customerFieldValue: {
      findMany: async () => [{ customerId: CUSTOMER_A, fieldDefinitionId: FIELD_A }],
      ...(overrides.customerFieldValue ?? {})
    },
    customerIdentity: {
      findMany: async () => [{ customerId: CUSTOMER_A }],
      ...(overrides.customerIdentity ?? {})
    },
    customFieldDefinition: {
      findMany: async () => [{ id: FIELD_A }],
      ...(overrides.customFieldDefinition ?? {})
    },
    tagAssignment: {
      findMany: async () => [{ customerId: CUSTOMER_A, tagDefinitionId: TAG_A }],
      ...(overrides.tagAssignment ?? {})
    },
    tagDefinition: {
      findMany: async () => [{ id: TAG_A, targetKind: "CUSTOMER" }],
      ...(overrides.tagDefinition ?? {})
    }
  };
}

async function importTypescriptSource(relativePath) {
  const moduleUrl = asModuleUrl(
    ts.transpileModule(read(relativePath), {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2023
      },
      fileName: relativePath
    }).outputText
  );
  return { module: await import(moduleUrl), moduleUrl };
}

function asModuleUrl(sourceText) {
  return `data:text/javascript;base64,${Buffer.from(sourceText).toString("base64")}`;
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
