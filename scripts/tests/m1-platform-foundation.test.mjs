import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import ts from "typescript";

const repoRoot = process.cwd();
const schema = read("packages/db/prisma/schema.prisma");
const migration = read(
  "packages/db/migrations/0001_platform_schema_authz_foundation.sql"
);
const authz = await importTypescriptModule("packages/authz/src/index.ts");
const db = await importTypescriptModule("packages/db/src/index.ts");

describe("M1-01 platform schema and RLS contract", () => {
  it("defines only the platform foundation tables in Prisma schema", () => {
    for (const model of [
      "Org",
      "Tenant",
      "OrgMember",
      "TenantMember",
      "PermissionGrant"
    ]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
    }

    assert.match(schema, /@@map\("org"\)/);
    assert.match(schema, /@@map\("tenant"\)/);
    assert.match(schema, /@@map\("org_member"\)/);
    assert.match(schema, /@@map\("tenant_member"\)/);
    assert.match(schema, /@@map\("permission_grant"\)/);
    assert.doesNotMatch(schema, /model (Customer|Conversation|Order|Knowledge)/);
  });

  it("keeps platform RLS fail-closed on missing tenant context", () => {
    const tables = ["org", "tenant", "org_member", "tenant_member", "permission_grant"];

    assert.match(migration, /create role uzmax_app_runtime nobypassrls/);
    for (const table of tables) {
      assert.match(
        migration,
        new RegExp(`alter table ${table} force row level security`)
      );
      assert.match(
        migration,
        new RegExp(`grant select on table ${table} to uzmax_app_runtime`)
      );

      const policy = policyFor(table);
      assert.match(policy, /nullif\(current_setting\('app\.org_id', true\), ''\)/);
      assert.match(policy, /nullif\(current_setting\('app\.tenant_id', true\), ''\)/);
    }

    assert.match(policyFor("org"), /from tenant context_tenant/);
    assert.match(policyFor("org_member"), /from tenant context_tenant/);
  });

  it("exposes stable table names and safe runtime role SQL helpers", () => {
    assert.equal(db.platformTableNames.permissionGrant, "permission_grant");
    assert.deepEqual(db.rlsContextKeys, {
      orgId: "app.org_id",
      tenantId: "app.tenant_id"
    });
    assert.equal(db.createSetLocalRoleSql(), 'set local role "uzmax_app_runtime"');
    assert.equal(db.hasCompleteRlsTenantContext({ orgId: " ", tenantId: "x" }), false);
    assert.throws(() => db.createSetLocalRoleSql("bad role"), /Unsafe/);
  });
});

describe("M1-01 authz AccessContext resolver", () => {
  it("builds selected tenant context from active tenant membership and grants", () => {
    const context = authz.buildAccessContext(
      { selectedTenantId: "tenant-b", userId: "user-1" },
      {
        permissionGrants: [
          grant("tenant-b", "asset:read"),
          grant("tenant-b", "asset:read"),
          grant("tenant-b", "conversation:read")
        ],
        tenantMemberships: [
          membership("tenant-c", "active", "org-2"),
          membership("tenant-b", "active"),
          membership("tenant-a", "active"),
          membership("tenant-z", "revoked")
        ]
      }
    );

    assert.deepEqual(context, {
      membershipVersion: 3,
      orgId: "org-1",
      permissions: ["asset:read", "conversation:read"],
      selectedTenantId: "tenant-b",
      tenantIds: ["tenant-a", "tenant-b"],
      userId: "user-1"
    });
  });

  it("rejects revoked, missing, or mismatched tenant facts", () => {
    assert.throws(
      () =>
        authz.buildAccessContext(
          { selectedTenantId: "tenant-z", userId: "user-1" },
          {
            permissionGrants: [],
            tenantMemberships: [membership("tenant-z", "revoked")]
          }
        ),
      /tenant membership is not active/
    );

    assert.throws(
      () =>
        authz.buildAccessContext(
          { selectedTenantId: "tenant-a", userId: "user-1" },
          {
            permissionGrants: [grant("tenant-b", "asset:read")],
            tenantMemberships: [membership("tenant-a", "active")]
          }
        ),
      /permission grants must match selected tenant membership/
    );
  });

  it("loads access context facts through a single repository snapshot", async () => {
    let calls = 0;
    const context = await authz.resolveAccessContext(
      {
        async loadAccessContextFacts(request) {
          calls += 1;
          assert.deepEqual(request, { selectedTenantId: "tenant-a", userId: "user-1" });
          return {
            permissionGrants: [grant("tenant-a", "asset:read")],
            tenantMemberships: [membership("tenant-a", "active")]
          };
        }
      },
      { selectedTenantId: "tenant-a", userId: "user-1" }
    );

    assert.equal(calls, 1);
    assert.deepEqual(context.permissions, ["asset:read"]);
  });

  it("does not add raw seed samples to M1 evidence", () => {
    const files = listFiles(repoRoot);
    assert.deepEqual(
      files.filter((file) => {
        return (
          /\.(?:csv|jsonl)$/i.test(file) || /(?:^|\/)(?:raw|export)[^/]*$/i.test(file)
        );
      }),
      []
    );
  });
});

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function policyFor(table) {
  const pattern = new RegExp(
    `create policy platform_${table}_select_context[\\s\\S]*?\\n  \\);`
  );
  const match = migration.match(pattern);
  assert.ok(match, `missing select policy for ${table}`);
  return match[0];
}

async function importTypescriptModule(relativePath) {
  const source = read(relativePath);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023
    },
    fileName: relativePath
  });
  const encoded = Buffer.from(outputText, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

function membership(tenantId, status, orgId = "org-1") {
  return {
    cacheVersion: tenantId === "tenant-b" ? 3 : 1,
    orgId,
    role: "member",
    status,
    tenantId,
    userId: "user-1"
  };
}

function grant(tenantId, permission) {
  return {
    orgId: "org-1",
    permission,
    tenantId,
    userId: "user-1"
  };
}

function listFiles(root, current = "") {
  return readdirSync(path.join(root, current), { withFileTypes: true }).flatMap(
    (entry) => {
      if ([".git", "dist", "node_modules", "test-results"].includes(entry.name)) {
        return [];
      }

      const relativePath = path.posix.join(current, entry.name);
      if (entry.isDirectory()) return listFiles(root, relativePath);
      return relativePath;
    }
  );
}
