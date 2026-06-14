import { PrismaClient } from "@prisma/client";

const ORG_ID = "00000000-0000-4000-8000-000000000001";
const TENANT_A_ID = "10000000-0000-4000-8000-000000000001";
const TENANT_B_ID = "20000000-0000-4000-8000-000000000002";
const REQUESTS_PER_TENANT = 1000;
const DEFAULT_CONCURRENCY = 4;
const CONCURRENCY_ENV = "UZMAX_RLS_SPIKE_CONCURRENCY";
const PROGRESS_INTERVAL = 100;
const ROLE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_.-]*$/;

const expectedPayloads = {
  [TENANT_A_ID]: ["tenant-a-row-1", "tenant-a-row-2"],
  [TENANT_B_ID]: ["tenant-b-row-1", "tenant-b-row-2"]
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function createClient(url = requireEnv("UZMAX_RLS_DATABASE_URL")) {
  return new PrismaClient({
    datasources: {
      db: {
        url
      }
    },
    log: ["error"]
  });
}

function getConcurrency() {
  const rawValue = process.env[CONCURRENCY_ENV];
  if (!rawValue) return DEFAULT_CONCURRENCY;

  const value = Number.parseInt(rawValue, 10);
  if (!Number.isSafeInteger(value) || value < 1 || String(value) !== rawValue) {
    throw new Error(`${CONCURRENCY_ENV} must be a positive integer`);
  }

  return value;
}

async function queryTenantItems(prisma, tenantId) {
  const rows = await runTransaction(
    prisma,
    prisma.$queryRaw`
      with app_context as (
        select
          set_config('app.org_id', ${ORG_ID}, true) as org_context,
          set_config('app.tenant_id', ${tenantId}, true) as tenant_context
      )
      select payload
      from app_context
      cross join spk03.rls_items
      order by payload asc
    `
  );

  return rows.map((row) => row.payload);
}

async function queryWithoutContext(prisma) {
  return runTransaction(
    prisma,
    prisma.$queryRaw`
      select payload
      from spk03.rls_items
      order by payload asc
    `
  );
}

async function queryWithWrongContext(prisma) {
  return runTransaction(
    prisma,
    prisma.$queryRaw`
      with app_context as (
        select
          set_config('app.org_id', ${ORG_ID}, true) as org_context,
          set_config('app.tenant_id', ${TENANT_A_ID}, true) as tenant_context
      )
      select payload
      from app_context
      cross join spk03.rls_items
      where tenant_id = ${TENANT_B_ID}::uuid
      order by payload asc
    `
  );
}

async function runTransaction(prisma, operation) {
  const results = await prisma.$transaction([
    ...createSetLocalRoleOperations(prisma),
    operation
  ]);

  return results[results.length - 1];
}

function createSetLocalRoleOperations(prisma) {
  const role = process.env.UZMAX_RLS_SET_ROLE;
  if (!role) return [];
  if (!ROLE_IDENTIFIER.test(role)) {
    throw new Error(`Unsafe UZMAX_RLS_SET_ROLE value: ${role}`);
  }

  return [prisma.$executeRawUnsafe(`set local role "${role.replaceAll('"', '""')}"`)];
}

async function assertContextClears(prisma) {
  await queryTenantItems(prisma, TENANT_A_ID);
  const rows = await queryWithoutContext(prisma);
  assertRows("transaction context cleared", rows, []);
}

function assertRows(label, actual, expected) {
  const normalized = actual.map((row) => (typeof row === "string" ? row : row.payload));

  if (JSON.stringify(normalized) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} expected ${JSON.stringify(expected)} but got ${JSON.stringify(normalized)}`
    );
  }
}

async function runNegativeCases(prisma) {
  assertRows("missing context", await queryWithoutContext(prisma), []);
  assertRows("wrong tenant context", await queryWithWrongContext(prisma), []);
  await assertContextClears(prisma);
}

async function runBounded(tasks, concurrency, handler) {
  const results = new Array(tasks.length);
  let completed = 0;
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    async () => {
      while (nextIndex < tasks.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await handler(tasks[index], index);
        completed += 1;

        if (completed % PROGRESS_INTERVAL === 0 || completed === tasks.length) {
          console.log(
            JSON.stringify({
              status: "progress",
              completed,
              totalRequests: tasks.length,
              concurrency,
              checkedAt: new Date().toISOString()
            })
          );
        }
      }
    }
  );

  await Promise.all(workers);
  return results;
}

async function runConcurrentTenantChecks(prisma, concurrency) {
  const tenantRequests = [];

  for (let index = 0; index < REQUESTS_PER_TENANT; index += 1) {
    tenantRequests.push(TENANT_A_ID);
    tenantRequests.push(TENANT_B_ID);
  }

  const results = await runBounded(
    tenantRequests,
    concurrency,
    async (tenantId, index) => {
      const payloads = await queryTenantItems(prisma, tenantId);
      return { index, payloads, tenantId };
    }
  );

  const perTenant = {
    [TENANT_A_ID]: 0,
    [TENANT_B_ID]: 0
  };
  let crossTenantRows = 0;

  results.forEach(({ index, payloads, tenantId }) => {
    const unexpectedRows = payloads.filter(
      (payload) => !expectedPayloads[tenantId].includes(payload)
    );

    crossTenantRows += unexpectedRows.length;
    perTenant[tenantId] += 1;
    assertRows(
      `request ${index} tenant ${tenantId}`,
      payloads,
      expectedPayloads[tenantId]
    );
  });

  return {
    concurrency,
    crossTenantRows,
    perTenant,
    totalRequests: results.length
  };
}

async function main() {
  const prisma = createClient();
  try {
    await runNegativeCases(prisma);
    const checks = await runConcurrentTenantChecks(prisma, getConcurrency());
    console.log(
      JSON.stringify(
        {
          status: "passed",
          ...checks,
          requestsPerTenant: REQUESTS_PER_TENANT,
          checkedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
