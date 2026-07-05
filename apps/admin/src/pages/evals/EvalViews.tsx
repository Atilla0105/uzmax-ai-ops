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

export function StatePanel({
  state
}: {
  state: "empty" | "error" | "loading" | "permission";
}) {
  const copy = {
    empty: ["empty", "No synthetic mock eval sets are available for this view."],
    error: ["error", "Mock eval runtime unavailable; no API retry is attempted."],
    loading: ["loading", "Loading synthetic mock eval center..."],
    permission: [
      "permission",
      "Permission denied; backend authz remains authoritative."
    ]
  }[state];
  return (
    <section className="uz-eval-page" data-testid="m7-eval-page">
      <style>{evalStyles}</style>
      <main className="uz-eval-state" data-testid={`m7-eval-state-${state}`}>
        <div>
          <h2>{copy[0]}</h2>
          <p>{copy[1]}</p>
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
    <nav className="uz-eval-list" data-testid="m7-eval-set-list">
      {sets.map((set) => (
        <button
          aria-pressed={set.id === selectedId}
          className="uz-eval-row"
          data-testid={`m7-eval-set-${set.id}`}
          key={set.id}
          onClick={() => setSelectedId(set.id)}
          type="button"
        >
          <span className="uz-eval-dot" style={{ color: gateTone(set.status).color }} />
          <strong>{set.name}</strong>
          <small>{set.running ? "运行中" : `${set.score}%`}</small>
        </button>
      ))}
    </nav>
  );
}

export function EvalDetail({
  onOverride,
  runSelected,
  selected,
  setBlind
}: {
  onOverride: (item: EvalCase) => void;
  runSelected: () => void;
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
          disabled={selected.running}
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

export function BlindToggle({
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

export function CaseCard({
  caseItem,
  onOverride
}: {
  caseItem: EvalCase;
  onOverride: () => void;
}) {
  const pass = caseItem.result === "pass";
  const tone = pass ? "ok" : "danger";
  return (
    <article
      className="uz-eval-card"
      data-testid={`m7-eval-case-${caseItem.id}`}
      style={
        {
          "--case-border": pass ? "var(--ink-150)" : "var(--state-human-border)"
        } as React.CSSProperties
      }
    >
      <header className="uz-eval-card-head">
        <span className={`uz-eval-badge uz-eval-badge--${tone}`}>
          {pass ? "通过" : "失败"}
        </span>
        <strong>{caseItem.input}</strong>
        <span className="uz-eval-mono">{caseItem.id}</span>
      </header>
      {pass ? renderOverrideNote(caseItem) : renderDiff(caseItem, onOverride)}
    </article>
  );
}

export function ScoreBadge({
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

export function gateTone(result: Gate | EvalResult | "running") {
  if (result === "pass")
    return { bg: "#EAF4EE", border: "#CDE6D7", color: "#2E7D4F", label: "通过" };
  if (result === "running")
    return { bg: "#EBF0F9", border: "#D8E2F2", color: "#30518C", label: "运行中" };
  return { bg: "#FCEEE8", border: "#F3D8CB", color: "#D4502B", label: "阻断" };
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
  return <p className="uz-eval-mono">manual review local only override accepted</p>;
}

function blindActionLabel(blind: BlindState) {
  if (blind === "pending") return "开始人工盲评";
  if (blind === "running") return "标记盲评完成";
  return "重新开启盲评";
}
