import { PrismaClient } from "@prisma/client";

const ORG_ID = "00000000-0000-4000-8000-000000000001";
const TENANT_A_ID = "10000000-0000-4000-8000-000000000001";
const TENANT_B_ID = "20000000-0000-4000-8000-000000000002";
const REQUESTS_PER_TENANT = 1000;
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

async function queryTenantItems(prisma, tenantId) {
  return prisma.$transaction(async (tx) => {
    await setLocalRole(tx);
    await tx.$executeRaw`select set_config('app.org_id', ${ORG_ID}, true)`;
    await tx.$executeRaw`select set_config('app.tenant_id', ${tenantId}, true)`;

    const rows = await tx.$queryRaw`
      select payload
      from spk03.rls_items
      order by payload asc
    `;

    return rows.map((row) => row.payload);
  });
}

async function queryWithoutContext(prisma) {
  return prisma.$transaction(async (tx) => {
    await setLocalRole(tx);

    return tx.$queryRaw`
      select payload
      from spk03.rls_items
      order by payload asc
    `;
  });
}

async function queryWithWrongContext(prisma) {
  return prisma.$transaction(async (tx) => {
    await setLocalRole(tx);
    await tx.$executeRaw`select set_config('app.org_id', ${ORG_ID}, true)`;
    await tx.$executeRaw`select set_config('app.tenant_id', ${TENANT_A_ID}, true)`;

    const rows = await tx.$queryRaw`
      select payload
      from spk03.rls_items
      where tenant_id = ${TENANT_B_ID}::uuid
      order by payload asc
    `;

    return rows;
  });
}

async function setLocalRole(tx) {
  const role = process.env.UZMAX_RLS_SET_ROLE;
  if (!role) return;
  if (!ROLE_IDENTIFIER.test(role)) {
    throw new Error(`Unsafe UZMAX_RLS_SET_ROLE value: ${role}`);
  }

  await tx.$executeRawUnsafe(`set local role "${role.replaceAll('"', '""')}"`);
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

async function runConcurrentTenantChecks(prisma) {
  const tasks = [];

  for (let index = 0; index < REQUESTS_PER_TENANT; index += 1) {
    tasks.push(queryTenantItems(prisma, TENANT_A_ID));
    tasks.push(queryTenantItems(prisma, TENANT_B_ID));
  }

  const results = await Promise.all(tasks);

  results.forEach((payloads, index) => {
    const tenantId = index % 2 === 0 ? TENANT_A_ID : TENANT_B_ID;
    assertRows(
      `request ${index} tenant ${tenantId}`,
      payloads,
      expectedPayloads[tenantId]
    );
  });

  return results.length;
}

async function main() {
  const prisma = createClient();
  try {
    await runNegativeCases(prisma);
    const requestCount = await runConcurrentTenantChecks(prisma);
    console.log(
      JSON.stringify(
        {
          status: "passed",
          requestCount,
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
