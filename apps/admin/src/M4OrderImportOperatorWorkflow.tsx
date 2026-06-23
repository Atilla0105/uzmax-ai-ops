import { useState } from "react";

import {
  createOrderImportApiClient,
  type OrderImportApiClient
} from "./orderImportApiClient";
import {
  submitVisibleSmokeJobOnce,
  type M4VisibleSmokeConfig
} from "./orderImportVisibleSmokeSubmit";

type WorkflowState =
  | { mode: "local" }
  | { mode: "submitting" }
  | { message: string; mode: "error" }
  | {
      errorCode: string;
      handoff: string;
      mode: "submitted";
      persistedRows: string;
      snapshotStatus: string;
      sourceRef: string;
      statusRef?: string;
      warningCode?: string;
    };

type ImportJob = Awaited<ReturnType<OrderImportApiClient["listImportJobs"]>>[number];
type ImportRowError = Awaited<
  ReturnType<OrderImportApiClient["listImportRowErrors"]>
>[number];
type SnapshotResult = Awaited<ReturnType<OrderImportApiClient["searchSnapshot"]>>;

const localStorageObject = {
  bucketId: "m4-order-import-smokes",
  mediaType: "text/csv or text/tab-separated-values",
  objectPath: "tenant-a/imports/orders.csv",
  route: "POST /order-import/storage-jobs"
} as const;

export function M4OrderImportOperatorWorkflow() {
  const smokeConfig = readSmokeConfig();
  const [state, setState] = useState<WorkflowState>({ mode: "local" });
  const storageSubmit = smokeConfig?.storageSubmit;
  const canSubmit = Boolean(smokeConfig?.enabled && storageSubmit);

  async function submitOperatorWorkflow() {
    if (!smokeConfig?.enabled || !storageSubmit) return;
    setState({ mode: "submitting" });
    try {
      setState(await loadSubmittedWorkflowState(smokeConfig));
    } catch (error) {
      setState({ message: errorMessage(error), mode: "error" });
    }
  }

  return (
    <section
      className="m4-query-shell m4-operator-workflow"
      data-testid="m4-order-import-operator-workflow"
    >
      <div className="m4-section-heading">
        <h3>Operator import workflow</h3>
        <span>{workflowStatus(state, canSubmit)}</span>
      </div>

      <div className="m4-operator-grid">
        <dl className="m4-ref-list" data-testid="m4-operator-storage-metadata">
          <Ref label="Route" value={localStorageObject.route} />
          <Ref
            label="Bucket"
            value={storageSubmit?.bucketId ?? localStorageObject.bucketId}
          />
          <Ref
            label="Object path"
            value={storageSubmit?.objectPath ?? localStorageObject.objectPath}
          />
          <Ref
            label="Accepted format"
            value={storageSubmit?.mediaType ?? localStorageObject.mediaType}
          />
        </dl>

        <div className="m4-operator-submit" data-testid="m4-operator-submit">
          <strong>Storage metadata only</strong>
          <span>No inline file body, source ref, external API, or customer data.</span>
          <button type="button" disabled={!canSubmit} onClick={submitOperatorWorkflow}>
            Submit storage metadata
          </button>
        </div>
      </div>

      <WorkflowStateDetail state={state} />
    </section>
  );
}

function WorkflowStateDetail({ state }: { state: WorkflowState }) {
  if (state.mode === "local") {
    return (
      <div className="m4-snapshot-detail" data-testid="m4-operator-result">
        <span>Metadata ready</span>
        <strong>runtime required</strong>
        <span>Fresh readback waits for API/RLS smoke</span>
        <span>Stale and missing states must hand off</span>
        <span>Status ref hidden unless fresh</span>
        <span>CSV/TSV sample refs only</span>
      </div>
    );
  }

  if (state.mode !== "submitted") {
    return (
      <div className="m4-snapshot-detail" data-testid="m4-operator-result">
        <span>{state.mode}</span>
        <strong>{state.mode === "error" ? state.message : "submitting"}</strong>
      </div>
    );
  }

  return (
    <div className="m4-snapshot-detail" data-testid="m4-operator-result">
      <span>{state.sourceRef}</span>
      <span>{state.errorCode}</span>
      <strong>{state.snapshotStatus}</strong>
      <span>{state.persistedRows}</span>
      {state.warningCode ? <span>Warning: {state.warningCode}</span> : null}
      {state.statusRef ? <span>Status ref: {state.statusRef}</span> : null}
      <span>Handoff: {state.handoff}</span>
    </div>
  );
}

async function loadSubmittedWorkflowState(smokeConfig: M4VisibleSmokeConfig) {
  const client = createOrderImportApiClient({
    fetcher: (input, init) => fetch(input, init)
  });
  const submittedImportJobId = await submitVisibleSmokeJobOnce(client, smokeConfig);
  if (!submittedImportJobId) throw new Error("storage metadata submit is required");
  const jobs = await client.listImportJobs();
  const job = jobs.find((item) => item.id === submittedImportJobId);
  if (!job) throw new Error("submitted import job missing");
  const [errors, snapshot] = await Promise.all([
    client.listImportRowErrors(job.id),
    client.searchSnapshot({
      now: smokeConfig.now,
      queryRef: smokeConfig.queryRef ?? "controlled://order/m4-42-ref-a"
    })
  ]);
  return workflowStateFromResponses({ errors, job, snapshot });
}

function workflowStateFromResponses({
  errors,
  job,
  snapshot
}: {
  errors: ImportRowError[];
  job: ImportJob;
  snapshot: SnapshotResult;
}): WorkflowState {
  const errorCode = errors[0]?.errorCode ?? "no_row_error";
  const persistedRows = `${job.successfulRows} successful / ${job.failedRows} failed`;
  if (snapshot.status !== "snapshot_ready") {
    return {
      errorCode,
      handoff: "required",
      mode: "submitted",
      persistedRows,
      snapshotStatus: snapshot.status,
      sourceRef: job.sourceRef,
      warningCode: snapshot.runtimeWarning?.code ?? snapshot.reasonCode
    };
  }
  return {
    errorCode,
    handoff: snapshot.handoff.required ? "required" : "not required",
    mode: "submitted",
    persistedRows,
    snapshotStatus: snapshot.status,
    sourceRef: job.sourceRef,
    statusRef: optionalString(snapshot.customerVisible.orderStatusRef)
  };
}

function workflowStatus(state: WorkflowState, canSubmit: boolean) {
  if (state.mode === "local") return canSubmit ? "ready" : "metadata prepared";
  return state.mode;
}

function readSmokeConfig() {
  return typeof window === "undefined"
    ? undefined
    : window.__UZMAX_M4_ORDER_IMPORT_VISIBLE_SMOKE__;
}

function Ref({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "operator workflow failed";
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
