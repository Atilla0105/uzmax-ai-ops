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
const governanceMigration = read(
  "packages/db/migrations/0002_audit_config_version_foundation.sql"
);
const authz = await importTypescriptModule("packages/authz/src/index.ts");
const db = await importTypescriptModule("packages/db/src/index.ts");
const ORG_UUID = "11111111-1111-4111-8111-111111111111";
const TENANT_UUID = "22222222-2222-4222-8222-222222222222";
const USER_UUID = "33333333-3333-4333-8333-333333333333";
const VERSION_ONE_UUID = "44444444-4444-4444-8444-444444444441";
const VERSION_TWO_UUID = "44444444-4444-4444-8444-444444444442";

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
    assert.doesNotMatch(
      migration,
      /create table if not exists (customer|conversation|order|knowledge)/i
    );
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

describe("M1-04 audit and config version foundation", () => {
  it("defines governance schema without adding business capability tables", () => {
    for (const model of ["AuditLog", "ConfigVersion"]) {
      assert.match(schema, new RegExp(`model ${model} \\{`));
    }

    assert.match(schema, /enum ConfigVersionDomain/);
    assert.match(schema, /enum ConfigVersionStatus/);
    assert.match(schema, /@@map\("audit_log"\)/);
    assert.match(schema, /@@map\("config_version"\)/);
    assert.doesNotMatch(
      governanceMigration,
      /create table if not exists (customer|conversation|message|order|kb_entry)/i
    );
  });

  it("keeps governance RLS scoped to selected org and tenant", () => {
    for (const table of ["audit_log", "config_version"]) {
      assert.match(
        governanceMigration,
        new RegExp(`alter table ${table} force row level security`)
      );
      assert.match(
        governanceMigration,
        new RegExp(`grant select, insert on table ${table} to uzmax_app_runtime`)
      );

      for (const action of ["select", "insert"]) {
        const policy = governancePolicyFor(table, action);
        assert.match(policy, /current_setting\('app\.org_id', true\)/);
        assert.match(policy, /current_setting\('app\.tenant_id', true\)/);
        assert.match(policy, /nullif\(current_setting\('app\.org_id', true\), ''\)/);
        assert.match(policy, /nullif\(current_setting\('app\.tenant_id', true\), ''\)/);
      }
    }

    assert.match(governanceMigration, /audit_log_content_before_after/);
    assert.match(governanceMigration, /config_version_previous_scope_fk/);
    assert.match(governanceMigration, /config_version_rollback_scope_fk/);
    assert.match(governanceMigration, /audit_log_before_version_scope_fk/);
    assert.match(governanceMigration, /audit_log_after_version_scope_fk/);
    assert.match(
      governanceMigration,
      /foreign key \(\s*previous_version_id,\s*org_id,\s*tenant_id,\s*config_domain,\s*config_key\s*\)/
    );
    assert.match(governanceMigration, /content \? 'before'/);
    assert.match(governanceMigration, /content \? 'after'/);
    assert.match(governanceMigration, /config_version_payload_object/);
  });

  it("exposes governance table names and pure contract builders", () => {
    assert.equal(db.governanceTableNames.auditLog, "audit_log");
    assert.equal(db.governanceTableNames.configVersion, "config_version");
    assert.equal(db.auditEventTypes.customerFlagsRestored, "customer.flags_restored");
    assert.equal(db.auditEventTypes.permissionGrantChanged, "permission_grant.changed");
    assert.equal(db.configVersionDomains.featureFlag, "feature_flag");

    const configVersion = db.createConfigVersionContract({
      createdAt: "2026-06-17T00:00:00.000Z",
      createdByUserId: USER_UUID,
      domain: "feature_flag",
      id: VERSION_TWO_UUID,
      key: "business-toggle",
      orgId: ORG_UUID,
      payload: { enabled: false },
      previousVersionId: VERSION_ONE_UUID,
      status: "draft",
      tenantId: TENANT_UUID,
      version: 2
    });
    assert.equal(configVersion.previousVersionId, VERSION_ONE_UUID);

    const audit = db.createAuditLogContract({
      action: "save",
      actorUserId: USER_UUID,
      afterVersionId: VERSION_TWO_UUID,
      beforeVersionId: VERSION_ONE_UUID,
      content: {
        after: { versionId: VERSION_TWO_UUID },
        before: { versionId: VERSION_ONE_UUID }
      },
      eventType: "config_version.saved",
      module: "config",
      objectId: VERSION_TWO_UUID,
      objectType: "config_version",
      occurredAt: "2026-06-17T00:00:00.000Z",
      orgId: ORG_UUID,
      tenantId: TENANT_UUID
    });
    assert.deepEqual(audit.content.before, { versionId: VERSION_ONE_UUID });
    assert.throws(
      () => db.createConfigVersionContract({ ...configVersion, id: "version-2" }),
      /config version id must be a UUID/
    );
    assert.throws(
      () =>
        db.createAuditLogContract({
          ...audit,
          content: { after: { versionId: VERSION_TWO_UUID }, before: [] }
        }),
      /audit before must be an object/
    );

    const customerRestore = db.createCustomerAssetRestoreAuditContract({
      actorUserId: USER_UUID,
      after: { isBlacklisted: false, isUnreachable: false },
      before: { isBlacklisted: true, isUnreachable: true },
      customerId: "55555555-5555-4555-8555-555555555555",
      orgId: ORG_UUID,
      reasonRef: "reason://customer/manual-review",
      restoredFlags: ["blacklisted", "unreachable"],
      tenantId: TENANT_UUID
    });
    assert.deepEqual(
      {
        action: customerRestore.action,
        eventType: customerRestore.eventType,
        module: customerRestore.module,
        objectType: customerRestore.objectType
      },
      {
        action: "customer_restore_flags",
        eventType: "customer.flags_restored",
        module: "customer_asset",
        objectType: "customer"
      }
    );
    assert.deepEqual(customerRestore.content.before, {
      isBlacklisted: true,
      isUnreachable: true
    });
    assert.deepEqual(customerRestore.content.after, {
      isBlacklisted: false,
      isUnreachable: false,
      reasonRef: "reason://customer/manual-review",
      restoredFlags: ["blacklisted", "unreachable"]
    });
    assert.throws(
      () =>
        db.createCustomerAssetRestoreAuditContract({
          ...customerRestore,
          restoredFlags: []
        }),
      /customer restored flags are required/
    );
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

function governancePolicyFor(table, action) {
  const policyName =
    table === "audit_log" ? "governance_audit_log" : `governance_${table}`;
  const suffix = action === "select" ? "using" : "with check";
  const pattern = new RegExp(
    `create policy ${policyName}_${action}_context[\\s\\S]*?\\n  \\);`
  );
  const match = governanceMigration.match(pattern);
  assert.ok(match, `missing ${action} policy for ${table}`);
  assert.match(match[0], new RegExp(suffix.replace(" ", "\\s+")));
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
