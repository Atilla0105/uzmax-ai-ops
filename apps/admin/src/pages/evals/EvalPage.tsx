import { useMemo, useState } from "react";
import { ConfirmModal } from "../../patterns";
import {
  evalSets,
  evalStyles,
  readEvalViewState,
  type BlindState,
  type EvalCase,
  type EvalSet
} from "./evalFallback";
import {
  EvalDetail,
  EvalSetList,
  RuntimeNote,
  StatePanel,
  gateCopy,
  gateTone,
  summarizeGate,
  summarizeSet
} from "./EvalViews";

export function EvalPage({ selectedTenantId }: { selectedTenantId: string }) {
  const viewState = readEvalViewState();
  const [sets, setSets] = useState(() =>
    viewState === "pass" ? forcePass(evalSets) : evalSets
  );
  const [selectedId, setSelectedId] = useState(sets[0]?.id ?? "");
  const [runningSetId, setRunningSetId] = useState(
    viewState === "running" ? sets[0]?.id : ""
  );
  const [overrideCase, setOverrideCase] = useState<EvalCase | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishReason, setPublishReason] = useState("");
  const [toast, setToast] = useState("");
  const computed = useMemo(
    () => sets.map((set) => summarizeSet(set, runningSetId === set.id)),
    [runningSetId, sets]
  );
  const selected = computed.find((set) => set.id === selectedId) ?? computed[0]!;
  const gate = summarizeGate(computed);
  const gateStyle = gateTone(gate);

  if (!isInteractiveView(viewState)) return <StatePanel state={viewState} />;

  function runSelected() {
    if (runningSetId) return;
    setRunningSetId(selected.id);
    window.setTimeout(() => setRunningSetId(""), 900);
  }

  function setBlind(setId: string, next: BlindState) {
    setSets((current) =>
      current.map((set) => (set.id === setId ? { ...set, blind: next } : set))
    );
  }

  function markOverride() {
    if (!overrideCase) return;
    setSets((current) =>
      current.map((set) =>
        set.id !== selected.id
          ? set
          : {
              ...set,
              cases: set.cases.map((item) =>
                item.id === overrideCase.id
                  ? { ...item, overrideReason, result: "pass" }
                  : item
              )
            }
      )
    );
    setOverrideCase(null);
    setToast(
      "manual review local only: mock override recorded; no production eval data changed."
    );
  }

  function publishLocal() {
    setPublishOpen(false);
    setToast(
      `local-only publish preview; no production publish. reason: ${publishReason}`
    );
  }

  return (
    <section
      className="uz-eval-page"
      data-runtime-state="degraded"
      data-tenant-id={selectedTenantId}
      data-testid="m7-eval-page"
    >
      <style>{evalStyles}</style>
      <header className="uz-eval-head">
        <h2 className="uz-eval-title">评测中心</h2>
        <div
          className="uz-eval-gate"
          data-testid="m7-eval-gate"
          style={
            {
              "--gate-bg": gateStyle.bg,
              "--gate-border": gateStyle.border,
              "--gate-color": gateStyle.color
            } as React.CSSProperties
          }
        >
          <span className="uz-eval-dot" />
          Production Gate：{gateStyle.label}
          <span className="uz-eval-mono">{gateCopy(gate, computed)}</span>
        </div>
        <div className="uz-eval-head-actions">
          <button
            className="uz-eval-btn"
            data-testid="m7-eval-first-blocked"
            disabled={gate !== "blocked"}
            onClick={() =>
              setSelectedId(computed.find((set) => set.failed)?.id ?? selected.id)
            }
            type="button"
          >
            查看未通过项
          </button>
          <button
            className="uz-eval-btn uz-eval-btn--primary"
            data-testid="m7-eval-publish"
            disabled={gate !== "pass"}
            onClick={() => {
              setPublishReason("");
              setPublishOpen(true);
            }}
            type="button"
          >
            发布配置
          </button>
        </div>
      </header>
      <RuntimeNote />
      <div className="uz-eval-toast" data-testid="m7-eval-toast" hidden={!toast}>
        {toast}
      </div>
      <main className="uz-eval-shell">
        <EvalSetList
          selectedId={selected.id}
          sets={computed}
          setSelectedId={setSelectedId}
        />
        <EvalDetail
          onOverride={(item) => {
            setOverrideCase(item);
            setOverrideReason("");
          }}
          runSelected={runSelected}
          runDisabled={!!runningSetId}
          selected={selected}
          setBlind={setBlind}
        />
      </main>
      <ConfirmModal
        confirmLabel="确认本地发布预览"
        description="This confirms a local-only mock publish preview. It writes no production eval data and performs no production publish."
        onCancel={() => setPublishOpen(false)}
        onConfirm={publishLocal}
        open={publishOpen}
        reason={{
          label: "Publish reason",
          onChange: setPublishReason,
          placeholder: "Required local audit reason; no production publish",
          required: true,
          value: publishReason
        }}
        title="发布配置预览"
      />
      <ConfirmModal
        confirmLabel="人工复核为通过"
        description="Manual review is local only. It changes this browser state only and does not alter production eval data."
        onCancel={() => setOverrideCase(null)}
        onConfirm={markOverride}
        open={!!overrideCase}
        reason={{
          label: "Override reason",
          onChange: setOverrideReason,
          placeholder: "Required reason before accepting",
          required: true,
          value: overrideReason
        }}
        title={`复核 ${overrideCase?.id ?? ""}`}
      />
    </section>
  );
}

function forcePass(sets: EvalSet[]): EvalSet[] {
  return sets.map((set) => ({
    ...set,
    cases: set.cases.map((item) => ({ ...item, result: "pass" }))
  }));
}

function isInteractiveView(viewState: ReturnType<typeof readEvalViewState>) {
  return viewState === "degraded" || viewState === "pass" || viewState === "running";
}
