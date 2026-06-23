import { useEffect, useState } from "react";

import { createOrderImportApiClient } from "./orderImportApiClient";

type M4VisibleSmokeConfig = {
  enabled?: boolean;
  now?: string;
  queryRef?: string;
};

declare global {
  interface Window {
    __UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__?: M4VisibleSmokeConfig;
  }
}

type RuntimeState =
  | { mode: "local" | "loading" }
  | { message: string; mode: "error" }
  | {
      errorCode: string;
      handoff: string;
      mode: "ready";
      snapshotStatus: string;
      sourceRef: string;
      statusRef?: string;
    };

export function M4OrderImportVisibleSmokeState() {
  const smokeConfig = readSmokeConfig();
  const [state, setState] = useState<RuntimeState>(
    smokeConfig?.enabled ? { mode: "loading" } : { mode: "local" }
  );

  useEffect(() => {
    if (!smokeConfig?.enabled) return;
    let active = true;
    void loadRuntimeState(smokeConfig)
      .then((nextState) => {
        if (active) setState(nextState);
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ message: errorMessage(error), mode: "error" });
        }
      });
    return () => {
      active = false;
    };
  }, [smokeConfig?.enabled, smokeConfig?.now, smokeConfig?.queryRef]);

  if (state.mode === "local") return null;

  return (
    <section className="m4-query-shell" data-testid="m4-order-runtime-state">
      <div className="m4-section-heading">
        <h3>Runtime smoke</h3>
        <span>{state.mode === "ready" ? state.snapshotStatus : state.mode}</span>
      </div>
      {state.mode === "ready" ? (
        <div className="m4-snapshot-detail">
          <span>{state.sourceRef}</span>
          <span>{state.errorCode}</span>
          <strong>{state.snapshotStatus}</strong>
          <span>Status ref: {state.statusRef}</span>
          <span>Handoff: {state.handoff}</span>
        </div>
      ) : (
        <div className="m4-snapshot-detail">
          <span>{state.mode === "error" ? state.message : "loading"}</span>
        </div>
      )}
    </section>
  );
}

function readSmokeConfig() {
  return typeof window === "undefined"
    ? undefined
    : window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__;
}

async function loadRuntimeState(smokeConfig: M4VisibleSmokeConfig) {
  const client = createOrderImportApiClient({
    fetcher: (input, init) => fetch(input, init)
  });
  const jobs = await client.listImportJobs();
  const job = jobs[0];
  if (!job) throw new Error("order import smoke job missing");
  const errors = await client.listImportRowErrors(job.id);
  const snapshot = await client.searchSnapshot({
    now: smokeConfig.now,
    queryRef: smokeConfig.queryRef ?? "controlled://order/m4-38-ref-a"
  });
  if (snapshot.status !== "snapshot_ready") {
    throw new Error(`unexpected smoke snapshot status ${snapshot.status}`);
  }
  return {
    errorCode: errors[0]?.errorCode ?? "no_row_error",
    handoff: snapshot.handoff.required ? "required" : "not required",
    mode: "ready" as const,
    snapshotStatus: snapshot.status,
    sourceRef: job.sourceRef,
    statusRef: optionalString(snapshot.customerVisible.orderStatusRef)
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "runtime smoke failed";
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
