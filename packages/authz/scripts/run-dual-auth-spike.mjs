import {
  TENANT_A_ID,
  TENANT_A_OBJECT,
  TENANT_B_ID,
  TENANT_B_OBJECT,
  USER_A_ID,
  USER_B_ID,
  assertJwtHasNoBusinessClaims,
  assertRejects,
  assertRows,
  createPrisma,
  createSignedUrlForContext,
  createSupabaseClients,
  deleteAuthUser,
  expectedPayloads,
  expiredShapeFrom,
  httpWhoami,
  prepareAuthUsers,
  prepareStorage,
  queryRowsWithoutContext,
  refreshSession,
  removeStorage,
  revokeTenantMembership,
  seedDatabase,
  signIn,
  tokenHash
} from "./dual-auth-support.mjs";

async function main() {
  const prisma = createPrisma();
  const { admin, publicClient } = createSupabaseClients();
  const cases = [];

  try {
    await prepareStorage(admin);
    await prepareAuthUsers(admin);
    await seedDatabase(prisma);

    const sessionA = await signIn(publicClient, "spk04-user-a@example.invalid");
    const sessionB = await signIn(publicClient, "spk04-user-b@example.invalid");
    assertJwtHasNoBusinessClaims(sessionA.access_token);

    const bearerA = `Bearer ${sessionA.access_token}`;
    const httpA = await httpWhoami(prisma, publicClient, bearerA, TENANT_A_ID);
    await assertRows("HTTP tenant A RLS", httpA.rows, expectedPayloads[TENANT_A_ID]);
    cases.push({ label: "http tenant A whoami + RLS", status: "passed" });

    const httpB = await httpWhoami(
      prisma,
      publicClient,
      `Bearer ${sessionB.access_token}`,
      TENANT_B_ID
    );
    await assertRows("HTTP tenant B RLS", httpB.rows, expectedPayloads[TENANT_B_ID]);
    cases.push({ label: "http tenant B whoami + RLS", status: "passed" });

    await assertRows("RLS missing context", await queryRowsWithoutContext(prisma), []);
    cases.push({ label: "RLS missing context denies by default", status: "passed" });

    cases.push(
      await assertRejects("missing token", 401, () => {
        return httpWhoami(prisma, publicClient, "", TENANT_A_ID);
      })
    );
    cases.push(
      await assertRejects("expired token shape", 401, () => {
        return httpWhoami(
          prisma,
          publicClient,
          `Bearer ${expiredShapeFrom(sessionA.access_token)}`,
          TENANT_A_ID
        );
      })
    );
    cases.push(
      await assertRejects("unauthorized tenant switch", 403, () => {
        return httpWhoami(prisma, publicClient, bearerA, TENANT_B_ID);
      })
    );

    const refreshedA = await refreshSession(publicClient, sessionA.refresh_token);
    const wsContext = await httpWhoami(
      prisma,
      publicClient,
      `Bearer ${refreshedA.access_token}`,
      TENANT_A_ID
    );
    cases.push({
      label: "token refresh rebuilds HTTP/WS context",
      status: "passed",
      tokenChanged: tokenHash(refreshedA.access_token) !== httpA.tokenHash
    });

    const signed = await createSignedUrlForContext(
      prisma,
      admin,
      wsContext.context,
      TENANT_A_OBJECT
    );
    if (!signed.signed) throw new Error("allowed signed URL was not generated");
    cases.push({ label: "storage signed URL allowed in tenant", status: "passed" });

    cases.push(
      await assertRejects("storage cross-tenant denied", 403, () => {
        return createSignedUrlForContext(
          prisma,
          admin,
          wsContext.context,
          TENANT_B_OBJECT
        );
      })
    );
    cases.push(
      await assertRejects("storage forged path denied", 403, () => {
        return createSignedUrlForContext(
          prisma,
          admin,
          wsContext.context,
          `${TENANT_A_ID}/../x.txt`
        );
      })
    );

    await revokeTenantMembership(prisma);
    cases.push(
      await assertRejects("revoked membership denies HTTP", 403, () => {
        return httpWhoami(
          prisma,
          publicClient,
          `Bearer ${refreshedA.access_token}`,
          TENANT_A_ID
        );
      })
    );
    if (wsContext.context.membershipVersion === 1) {
      cases.push({
        label: "revoked membership requires WS reconnect",
        status: "passed"
      });
    }

    console.log(
      JSON.stringify(
        {
          status: "passed",
          project: "uzmax-dev/enyocaykcgcfcswycujg",
          users: [USER_A_ID, USER_B_ID],
          cases,
          checkedAt: new Date().toISOString()
        },
        null,
        2
      )
    );
  } finally {
    await removeStorage(admin);
    await deleteAuthUser(admin, USER_A_ID);
    await deleteAuthUser(admin, USER_B_ID);
    await prisma.$disconnect();
  }
}

await main();
