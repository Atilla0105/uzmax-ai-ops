import { FlaskConical, RefreshCw } from "lucide-react";
import { IconSlot } from "../../primitives";
import {
  blindLabel,
  evalStyles,
  runtimeLabels,
  type BlindState,
  type EvalCase,
  type EvalResult,
  type EvalSet
} from "./evalFallback";
export type Gate = "blocked" | "pass" | "running";
export type ComputedEvalSet = ReturnType<typeof summarizeSet>;
type StatePanelState = "empty" | "error" | "loading" | "permission";
export function RuntimeNote() {
  return (
    <div className="uz-eval-note" data-testid="m7-eval-runtime-note">
      <span className="uz-eval-badge uz-eval-badge--warn">
        {runtimeLabels.slice(0, 3).join(" · ")}
      </span>
      <span>{runtimeLabels.slice(3).join(" · ")}</span>
    </div>
  );
}
export function StatePanel({ state }: { state: StatePanelState }) {
  const copy = {
    empty: "No synthetic mock eval sets are available for this view.",
    error: "Mock eval runtime unavailable; no API retry is attempted.",
    loading: "Loading synthetic mock eval center.",
    permission: "Permission denied; backend authz remains authoritative."
  }[state];

  return (
    <section
      className="uz-eval-page"
      data-runtime-state={state}
      data-testid="m7-eval-page"
    >
      <style>{evalStyles}</style>
      <main className="uz-eval-state" data-testid={`m7-eval-state-${state}`}>
        <div>
          <h2>{state}</h2>
          <p>{`${copy} ${runtimeLabels.join(" · ")}`}</p>
        </div>
      </main>
    </section>
  );
}
export function EvalSetList({
  selectedId,
  sets,
  setSelectedId
}: {
  selectedId: string;
  sets: ComputedEvalSet[];
  setSelectedId: (id: string) => void;
}) {
  return (
    <nav aria-label="评测集" className="uz-eval-list" data-testid="m7-eval-set-list">
      {sets.map((set) => (
        <button
          aria-pressed={set.id === selectedId}
          className={`uz-eval-row uz-eval-row--${set.status}`}
          data-testid={`m7-eval-set-${set.id}`}
          key={set.id}
          onClick={() => setSelectedId(set.id)}
          type="button"
        >
          <span className="uz-eval-dot" />
          <strong>{set.name}</strong>
          <small className="uz-eval-mono">
            {set.running ? "运行中" : `${set.score}%`}
          </small>
        </button>
      ))}
    </nav>
  );
}

export function EvalDetail({
  onOverride,
  runSelected,
  runDisabled,
  selected,
  setBlind
}: {
  onOverride: (item: EvalCase) => void;
  runSelected: () => void;
  runDisabled: boolean;
  selected: ComputedEvalSet;
  setBlind: (setId: string, next: BlindState) => void;
}) {
  const runLabel = selected.running ? "评测运行中" : "运行评测";

  return (
    <section className="uz-eval-detail" data-testid="m7-eval-detail">
      <div className="uz-eval-detail-head">
        <h3>{selected.name}</h3>
        <ScoreBadge result={selected.status} score={selected.score} />
        <button
          className="uz-eval-btn"
          data-testid="m7-eval-run"
          disabled={runDisabled}
          onClick={runSelected}
          type="button"
        >
          <IconSlot icon={RefreshCw} size="sm" />
          {runLabel}
        </button>
      </div>
      <div className="uz-eval-meta">
        <span>{`prompt ${selected.promptVersion} · knowledge ${selected.knowledgeVersion} · model ${selected.model} · ${selected.cases.length} cases`}</span>
        <span className="uz-eval-mono">{selected.promptRef}</span>
        <span className="uz-eval-mono">{selected.knowledgeRef}</span>
        <BlindToggle set={selected} setBlind={setBlind} />
      </div>
      {selected.cases.map((item) => (
        <CaseCard caseItem={item} key={item.id} onOverride={() => onOverride(item)} />
      ))}
    </section>
  );
}

function BlindToggle({
  set,
  setBlind
}: {
  set: EvalSet;
  setBlind: (setId: string, next: BlindState) => void;
}) {
  const next =
    set.blind === "pending" ? "running" : set.blind === "running" ? "done" : "pending";
  return (
    <button
      className="uz-eval-btn uz-eval-btn--link"
      data-testid="m7-eval-blind-toggle"
      onClick={() => setBlind(set.id, next)}
      type="button"
    >
      <IconSlot icon={FlaskConical} size="sm" />
      {blindLabel[set.blind]} · {blindActionLabel(set.blind)}
    </button>
  );
}

function CaseCard({
  caseItem,
  onOverride
}: {
  caseItem: EvalCase;
  onOverride: () => void;
}) {
  const pass = caseItem.result === "pass";
  return (
    <article
      className={`uz-eval-card${pass ? "" : " is-failed"}`}
      data-testid={`m7-eval-case-${caseItem.id}`}
    >
      <header className="uz-eval-card-head">
        <span className={`uz-eval-badge uz-eval-badge--${pass ? "ok" : "danger"}`}>
          {pass ? "通过" : "失败"}
        </span>
        <strong>{caseItem.input}</strong>
        <span className="uz-eval-mono">{caseItem.id}</span>
      </header>
      {pass ? renderOverrideNote(caseItem) : renderDiff(caseItem, onOverride)}
    </article>
  );
}

function ScoreBadge({
  result,
  score
}: {
  result: EvalResult | "running";
  score: number;
}) {
  const tone = result === "running" ? "info" : result === "pass" ? "ok" : "danger";
  const label = result === "running" ? "运行中" : result === "pass" ? "通过" : "未通过";
  return (
    <span
      className={`uz-eval-badge uz-eval-badge--${tone}`}
    >{`${label} ${score}%`}</span>
  );
}

export function summarizeSet(set: EvalSet, running: boolean) {
  const passed = set.cases.filter((item) => item.result === "pass").length;
  const score = Math.round((passed / set.cases.length) * 100);
  const failed = set.cases.length - passed;
  const status: EvalResult | "running" = running ? "running" : failed ? "fail" : "pass";
  return { ...set, failed, running, score, status };
}

export function summarizeGate(sets: ComputedEvalSet[]): Gate {
  if (sets.some((set) => set.running)) return "running";
  return sets.some((set) => set.failed > 0) ? "blocked" : "pass";
}

export function gateClass(gate: Gate) {
  return `uz-eval-gate uz-eval-gate--${gate}`;
}

export function gateLabel(gate: Gate) {
  if (gate === "running") return "运行中";
  if (gate === "pass") return "通过";
  return "阻断";
}

export function gateCopy(gate: Gate, sets: ComputedEvalSet[]) {
  if (gate === "running") return "mock eval running · no production publish";
  if (gate === "pass")
    return "all synthetic cases pass · local publish preview enabled";
  return `${sets.filter((set) => set.failed > 0).length} mock sets blocked`;
}

function renderDiff(caseItem: EvalCase, onOverride: () => void) {
  return (
    <>
      <div className="uz-eval-diff" data-testid={`m7-eval-diff-${caseItem.id}`}>
        <div className="uz-eval-expected">
          <span>Expected</span>
          {caseItem.expected}
        </div>
        <div className="uz-eval-actual">
          <span>Actual</span>
          {caseItem.actual}
        </div>
      </div>
      <button className="uz-eval-btn" onClick={onOverride} type="button">
        人工复核为通过
      </button>
    </>
  );
}

function renderOverrideNote(caseItem: EvalCase) {
  if (caseItem.original !== "fail") return null;
  const reason = caseItem.overrideReason ? ` · reason: ${caseItem.overrideReason}` : "";
  return (
    <p className="uz-eval-mono">{`manual review local only override accepted${reason}`}</p>
  );
}

function blindActionLabel(blind: BlindState) {
  if (blind === "pending") return "开始人工盲评";
  if (blind === "running") return "标记盲评完成";
  return "重新开启盲评";
}
