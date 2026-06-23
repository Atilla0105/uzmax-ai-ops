import { useEffect, useState } from "react";

import {
  createOrderImportApiClient,
  type OrderImportApiClient,
  type OrderImportCsvTextSubmitInput
} from "./orderImportApiClient";

type M4VisibleSmokeConfig = {
  enabled?: boolean;
  now?: string;
  queryRef?: string;
  submit?: OrderImportCsvTextSubmitInput;
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
      reasonCode?: string;
      runtimeWarningCode?: string;
      snapshotStatus: string;
      sourceRef: string;
      statusRef?: string;
    };

type ReadyRuntimeState = Extract<RuntimeState, { mode: "ready" }>;
type ImportJob = Awaited<ReturnType<OrderImportApiClient["listImportJobs"]>>[number];
type ImportRowError = Awaited<
  ReturnType<OrderImportApiClient["listImportRowErrors"]>
>[number];
type SnapshotResult = Awaited<ReturnType<OrderImportApiClient["searchSnapshot"]>>;
type HandoffSnapshotResult = SnapshotResult & {
  reasonCode: string;
  runtimeWarning?: { code?: string };
};

const submittedSmokeJobs = new Map<string, Promise<string>>();

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
  }, [
    smokeConfig?.enabled,
    smokeConfig?.now,
    smokeConfig?.queryRef,
    smokeConfig?.submit
  ]);

  if (state.mode === "local") return null;

  return (
    <section className="m4-query-shell" data-testid="m4-order-runtime-state">
      <div className="m4-section-heading">
        <h3>Runtime smoke</h3>
        <span>{runtimeHeadingStatus(state)}</span>
      </div>
      <RuntimeStateDetail state={state} />
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
  let submittedImportJobId: string | undefined;
  if (smokeConfig.submit) {
    submittedImportJobId = await submitSmokeJobOnce(client, smokeConfig.submit);
  }
  const jobs = await client.listImportJobs();
  const job = submittedImportJobId
    ? jobs.find((item) => item.id === submittedImportJobId)
    : jobs[0];
  if (!job) throw new Error("order import smoke job missing");
  const [errors, snapshot] = await Promise.all([
    client.listImportRowErrors(job.id),
    client.searchSnapshot({
      now: smokeConfig.now,
      queryRef: smokeConfig.queryRef ?? "controlled://order/m4-38-ref-a"
    })
  ]);
  return runtimeStateFromResponse({ errors, job, snapshot });
}

function smokeSubmitKey(submit: OrderImportCsvTextSubmitInput) {
  return `${submit.importJobId}:${submit.sourceRef}`;
}

async function submitSmokeJobOnce(
  client: OrderImportApiClient,
  submit: OrderImportCsvTextSubmitInput
) {
  const submitKey = smokeSubmitKey(submit);
  const existingSubmit = submittedSmokeJobs.get(submitKey);
  if (existingSubmit) return existingSubmit;
  const nextSubmit = client
    .submitImportCsvTextJob(submit)
    .then((submitResult) => submitResult.importJobId);
  submittedSmokeJobs.set(submitKey, nextSubmit);
  return nextSubmit;
}

function RuntimeStateDetail({
  state
}: {
  state: Exclude<RuntimeState, { mode: "local" }>;
}) {
  if (state.mode !== "ready") {
    return (
      <div className="m4-snapshot-detail">
        <span>{state.mode === "error" ? state.message : "loading"}</span>
      </div>
    );
  }
  return <ReadyRuntimeStateDetail state={state} />;
}

function ReadyRuntimeStateDetail({ state }: { state: ReadyRuntimeState }) {
  return (
    <div className="m4-snapshot-detail">
      <span>{state.sourceRef}</span>
      <span>{state.errorCode}</span>
      <strong>{state.snapshotStatus}</strong>
      {state.reasonCode ? <span>Reason code: {state.reasonCode}</span> : null}
      {state.runtimeWarningCode ? (
        <span>Runtime warning: {state.runtimeWarningCode}</span>
      ) : null}
      {state.statusRef ? <span>Status ref: {state.statusRef}</span> : null}
      <span>Handoff: {state.handoff}</span>
    </div>
  );
}

function runtimeHeadingStatus(state: Exclude<RuntimeState, { mode: "local" }>) {
  return state.mode === "ready" ? state.snapshotStatus : state.mode;
}

function runtimeStateFromResponse({
  errors,
  job,
  snapshot
}: {
  errors: ImportRowError[];
  job: ImportJob;
  snapshot: SnapshotResult;
}): ReadyRuntimeState {
  const errorCode = errors[0]?.errorCode ?? "no_row_error";
  if (snapshot.status !== "snapshot_ready") {
    return handoffRuntimeState({
      errorCode,
      job,
      snapshot: snapshot as HandoffSnapshotResult
    });
  }
  return {
    errorCode,
    handoff: snapshot.handoff.required ? "required" : "not required",
    mode: "ready",
    snapshotStatus: snapshot.status,
    sourceRef: job.sourceRef,
    statusRef: optionalString(snapshot.customerVisible.orderStatusRef)
  };
}

function handoffRuntimeState({
  errorCode,
  job,
  snapshot
}: {
  errorCode: string;
  job: ImportJob;
  snapshot: HandoffSnapshotResult;
}): ReadyRuntimeState {
  const runtimeWarningCode = snapshot.runtimeWarning?.code;
  if (!runtimeWarningCode) {
    throw new Error("order import smoke runtime warning missing");
  }
  return {
    errorCode,
    handoff: "required",
    mode: "ready",
    reasonCode: snapshot.reasonCode,
    runtimeWarningCode,
    snapshotStatus: snapshot.status,
    sourceRef: job.sourceRef
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "runtime smoke failed";
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
