import { useEffect, useState } from "react";

import { createCustomerAssetApiClient } from "./customerAssetApiClient";

type CustomerAssetRuntimeRestoreResult = Awaited<
  ReturnType<ReturnType<typeof createCustomerAssetApiClient>["restoreCustomer"]>
>;
type CustomerAssetRuntimeSmoke = {
  autoRestore?: boolean;
  customerId: string;
  enabled: boolean;
  restorePromise?: Promise<CustomerAssetRuntimeRestoreResult>;
  restoreReasonRef: string;
};

type RuntimeLoadingState = { status: "idle" | "loading" };
type RuntimeErrorState = { message: string; status: "error" };
type RuntimeReadyState = RuntimeData & { status: "ready" };
type RuntimeState = RuntimeLoadingState | RuntimeErrorState | RuntimeReadyState;
type RuntimeData = Awaited<ReturnType<typeof loadCustomerAssetRuntimeState>>;
type RelatedRefKey = "orderSnapshotRefs" | "quoteRecordRefs" | "ticketRefs";

const restoreAuditEventType = "customer.flags_restored";

declare global {
  interface Window {
    __UZMAX_M4_CUSTOMER_ASSET_RUNTIME_SMOKE__?: CustomerAssetRuntimeSmoke;
  }
}

export function M4CustomerAssetRuntimeState() {
  const smoke = readRuntimeSmoke();
  const [runtimeState, setRuntimeState] = useState<RuntimeState>({ status: "idle" });

  useEffect(() => {
    if (!smoke?.enabled) return;
    let cancelled = false;
    setRuntimeState({ status: "loading" });
    void loadCustomerAssetRuntimeState(smoke)
      .then((state) => {
        if (!cancelled) setRuntimeState(state);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "runtime failed";
          setRuntimeState({ message, status: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [smoke]);

  if (!smoke?.enabled) return null;
  return (
    <section className="m4-primary-path" data-testid="m4-customer-runtime-state">
      <span>Customer asset runtime DB/RLS smoke</span>
      <M4CustomerAssetRuntimeView runtimeState={runtimeState} />
    </section>
  );
}

function M4CustomerAssetRuntimeView({ runtimeState }: { runtimeState: RuntimeState }) {
  if (runtimeState.status === "error") {
    return (
      <>
        <strong>Runtime readback failed</strong>
        <small>{runtimeState.message}</small>
      </>
    );
  }

  if (runtimeState.status === "ready") {
    return <M4CustomerAssetRuntimeReadyState runtimeState={runtimeState} />;
  }

  return (
    <>
      <strong>Loading runtime readback</strong>
      <small>smoke-only injected API client path</small>
    </>
  );
}

function M4CustomerAssetRuntimeReadyState({
  runtimeState
}: {
  runtimeState: RuntimeReadyState;
}) {
  const { customerDetail: detail, restoreResult: restore } = runtimeState;
  const fieldValue = detail.fields[0]?.value as { controlledValueRef?: string };
  return (
    <>
      <strong>{detail.customer.displayLabelRef}</strong>
      <small>
        {runtimeState.customers.length} list row /{" "}
        {detail.identities[0]?.externalSubjectRef} /{" "}
        {runtimeState.fieldDefinitions[0]?.fieldKey} /{" "}
        {runtimeState.tagDefinitions[0]?.tagKey}
      </small>
      <small>
        {relatedRef(detail.relatedRefs, "orderSnapshotRefs")} /{" "}
        {relatedRef(detail.relatedRefs, "quoteRecordRefs")} /{" "}
        {relatedRef(detail.relatedRefs, "ticketRefs")}
      </small>
      <small>
        {fieldValue.controlledValueRef} / {detail.tags[0]?.definition.label}
      </small>
      {restore ? (
        <small>
          {restoreAuditEventType}: {restore.auditDraft.eventType} /{" "}
          {restore.auditDraft.action} / {restore.auditDraft.restoredFlags.join(",")} /{" "}
          {restore.auditDraft.reasonRef}
        </small>
      ) : null}
    </>
  );
}

function relatedRef(source: object, key: RelatedRefKey) {
  const value = (source as Partial<Record<RelatedRefKey, readonly string[]>>)[key];
  return Array.isArray(value) ? value[0] : undefined;
}

async function loadCustomerAssetRuntimeState(smoke: CustomerAssetRuntimeSmoke) {
  const client = createCustomerAssetApiClient({
    fetcher: (input, init) => fetch(input, init)
  });
  const [customers, customerDetail, fieldDefinitions, tagDefinitions] =
    await Promise.all([
      client.listCustomers({ tagKey: "m4-43-needs-review" }),
      client.getCustomerDetail(smoke.customerId),
      client.listFieldDefinitions(),
      client.listTagDefinitions()
    ]);
  const restoreResult = smoke.autoRestore
    ? await restoreCustomerOnce(smoke, client)
    : undefined;
  const nextDetail = smoke.autoRestore
    ? await client.getCustomerDetail(smoke.customerId)
    : customerDetail;
  return {
    customerDetail: nextDetail,
    customers,
    fieldDefinitions,
    restoreResult,
    status: "ready" as const,
    tagDefinitions
  };
}

function restoreCustomerOnce(
  smoke: CustomerAssetRuntimeSmoke,
  client: ReturnType<typeof createCustomerAssetApiClient>
) {
  smoke.restorePromise ??= client.restoreCustomer(smoke.customerId, {
    reasonRef: smoke.restoreReasonRef,
    restoreBlacklisted: true,
    restoreUnreachable: true
  });
  return smoke.restorePromise;
}

function readRuntimeSmoke(): CustomerAssetRuntimeSmoke | undefined {
  if (typeof window === "undefined") return undefined;
  const value = window.__UZMAX_M4_CUSTOMER_ASSET_RUNTIME_SMOKE__;
  return value?.enabled ? value : undefined;
}
