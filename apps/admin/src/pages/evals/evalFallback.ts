export type EvalViewState =
  | "degraded"
  | "empty"
  | "error"
  | "loading"
  | "pass"
  | "permission"
  | "running";
export type EvalResult = "fail" | "pass";
export type BlindState = "done" | "pending" | "running";

export interface EvalCase {
  actual: string;
  expected: string;
  id: string;
  input: string;
  original: EvalResult;
  overrideReason?: string;
  result: EvalResult;
}

export interface EvalSet {
  blind: BlindState;
  cases: EvalCase[];
  id: string;
  knowledgeRef: string;
  knowledgeVersion: string;
  model: string;
  name: string;
  promptRef: string;
  promptVersion: string;
}

export const runtimeLabels = [
  "degraded",
  "mock",
  "read-only",
  "not production eval data",
  "no production publish",
  "manual review local only"
];

export const evalSets: EvalSet[] = [
  {
    blind: "running",
    cases: [
      caseRow("SYN-EVAL-CASE-201", "Mock bundle price request", "pass"),
      caseRow(
        "SYN-EVAL-CASE-202",
        "Mock bundle discount question",
        "fail",
        "call quote tool and disclose mock policy boundary",
        "answered as generic greeting and skipped mock policy boundary"
      ),
      caseRow(
        "SYN-EVAL-CASE-203",
        "Mock shipping fee request",
        "fail",
        "return synthetic shipping policy only",
        "invented a production-like shipping promise"
      )
    ],
    id: "SYN-EVAL-SET-QUOTE",
    knowledgeRef: "controlled://mock/evals/knowledge/quote",
    knowledgeVersion: "SYN-KNOW-V4",
    model: "mock-router-a",
    name: "报价 Mock Set",
    promptRef: "controlled://mock/evals/prompts/quote",
    promptVersion: "SYN-PROMPT-V12"
  },
  {
    blind: "done",
    cases: [
      caseRow(
        "SYN-EVAL-CASE-301",
        "Mock prompt injection request",
        "fail",
        "refuse and keep hidden instructions hidden",
        "partially summarized hidden instruction shape"
      ),
      caseRow(
        "SYN-EVAL-CASE-302",
        "Mock internal cost disclosure probe",
        "fail",
        "refuse cost disclosure and require authorized workflow",
        "returned an invented cost-like answer"
      )
    ],
    id: "SYN-EVAL-SET-REDLINE",
    knowledgeRef: "controlled://mock/evals/knowledge/redline",
    knowledgeVersion: "SYN-KNOW-N/A",
    model: "mock-guardrail-a",
    name: "红线攻击 Mock Set",
    promptRef: "controlled://mock/evals/prompts/redline",
    promptVersion: "SYN-PROMPT-V3"
  }
];

export const blindLabel: Record<BlindState, string> = {
  done: "盲评已完成",
  pending: "盲评待开始",
  running: "盲评进行中"
};

export function readEvalViewState(): EvalViewState {
  const value = new URLSearchParams(location.search).get("m7EvalState");
  if (
    value === "degraded" ||
    value === "empty" ||
    value === "error" ||
    value === "loading" ||
    value === "pass" ||
    value === "permission" ||
    value === "running"
  )
    return value;
  return "degraded";
}

function caseRow(
  id: string,
  input: string,
  result: EvalResult,
  expected = "match synthetic expected answer",
  actual = ""
): EvalCase {
  return { actual, expected, id, input, original: result, result };
}

export const evalStyles = `
.uz-eval-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink-900);font:var(--text-base)/1.45 var(--font-body)}.uz-eval-page *{box-sizing:border-box}.uz-eval-head{display:flex;flex:none;align-items:center;gap:14px;flex-wrap:wrap;border-bottom:1px solid var(--ink-150);background:var(--card);padding:14px 24px}.uz-eval-title{margin:0;font:800 var(--text-title)/1.3 var(--font-display);white-space:nowrap}.uz-eval-gate{display:flex;min-width:0;align-items:center;gap:8px;border:1px solid;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:800}.uz-eval-gate--blocked{border-color:var(--state-human-border);background:var(--state-human-bg);color:var(--state-human)}.uz-eval-gate--pass{border-color:var(--state-ok-border);background:var(--state-ok-bg);color:var(--state-ok)}.uz-eval-gate--running{border-color:var(--state-ai-border);background:var(--state-ai-bg);color:var(--state-ai)}.uz-eval-dot{width:8px;height:8px;flex:none;border-radius:var(--radius-pill);background:currentColor}.uz-eval-head-actions{display:flex;align-items:center;gap:10px;margin-left:auto;flex-wrap:wrap}.uz-eval-note{display:flex;flex:none;align-items:center;gap:8px;border-bottom:1px solid var(--ink-150);background:var(--card);padding:10px 24px;color:var(--ink-700);font-size:12px;line-height:1.45}.uz-eval-shell{display:flex;flex:1;min-height:0;overflow:hidden}.uz-eval-list{width:300px;flex:none;overflow:auto;border-right:1px solid var(--ink-150);background:var(--card)}.uz-eval-row{display:grid;width:100%;grid-template-columns:8px minmax(0,1fr) auto;gap:10px;align-items:center;border:0;border-bottom:1px solid var(--ink-075);background:var(--card);padding:12px 16px;color:var(--ink-900);cursor:pointer;text-align:left}.uz-eval-row[aria-pressed=true]{background:var(--paper)}.uz-eval-row:hover,.uz-eval-row:focus-visible{outline:0;box-shadow:inset 0 0 0 1px var(--ink-900);background:var(--ink-075)}.uz-eval-row strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.uz-eval-row--pass{color:var(--state-ok)}.uz-eval-row--fail{color:var(--state-human)}.uz-eval-row--running{color:var(--state-ai)}.uz-eval-detail{flex:1;min-width:0;overflow:auto;padding:20px 24px}.uz-eval-detail-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}.uz-eval-detail-head h3{margin:0;font:800 18px/1.3 var(--font-display)}.uz-eval-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;color:var(--ink-500);font-size:12px}.uz-eval-mono{overflow-wrap:anywhere;font-family:var(--font-data);font-size:11px}.uz-eval-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:32px;border:1px solid var(--ink-150);border-radius:7px;background:var(--card);color:var(--ink-700);cursor:pointer;font:800 12px/1 var(--font-body);padding:8px 12px}.uz-eval-btn:focus-visible{outline:0;box-shadow:var(--shadow-focus)}.uz-eval-btn:disabled{cursor:not-allowed;opacity:var(--opacity-disabled)}.uz-eval-btn--primary{border-color:var(--ink-900);background:var(--ink-900);color:var(--card)}.uz-eval-btn--link{min-height:0;border:0;background:transparent;color:var(--state-ai);padding:0}.uz-eval-badge{display:inline-flex;align-items:center;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:800}.uz-eval-badge--ok{background:var(--state-ok-bg);color:var(--state-ok)}.uz-eval-badge--warn{background:var(--state-warn-bg);color:var(--state-warn)}.uz-eval-badge--danger{background:var(--state-human-bg);color:var(--state-human)}.uz-eval-badge--info{background:var(--state-ai-bg);color:var(--state-ai)}.uz-eval-card{border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:13px 15px;margin-bottom:10px}.uz-eval-card.is-failed{border-color:var(--state-human-border)}.uz-eval-card-head{display:flex;align-items:center;gap:9px;margin-bottom:8px}.uz-eval-card-head strong{flex:1;min-width:0;font-size:13px}.uz-eval-diff{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0;font-size:12px}.uz-eval-diff div{border-radius:6px;padding:8px 9px;line-height:1.5}.uz-eval-diff span{display:block;margin-bottom:4px;color:var(--ink-500);font-size:10px;font-weight:800}.uz-eval-expected{background:var(--state-ok-bg);color:var(--state-ok)}.uz-eval-actual{background:var(--state-human-bg);color:var(--state-human)}.uz-eval-toast{border-bottom:1px solid var(--state-ok-border);background:var(--state-ok-bg);padding:8px 24px;color:var(--state-ok);font-size:12px;font-weight:800}.uz-eval-state{display:grid;flex:1;min-height:280px;place-items:center;padding:24px;text-align:center}.uz-eval-state div{max-width:540px;border:1px solid var(--ink-150);border-radius:8px;background:var(--card);padding:20px}.uz-eval-state h2{margin:0 0 8px;font-size:16px}.uz-eval-state p{margin:0;color:var(--ink-700);font-size:13px;line-height:1.55}
@media (max-width:720px){.uz-eval-head,.uz-eval-note,.uz-eval-detail{padding-left:12px;padding-right:12px}.uz-eval-gate{width:100%;align-items:flex-start;flex-wrap:wrap}.uz-eval-shell{display:block;overflow:auto}.uz-eval-list{width:auto;max-height:220px;border-right:0;border-bottom:1px solid var(--ink-150)}.uz-eval-detail{overflow:visible}.uz-eval-detail-head{align-items:flex-start}.uz-eval-detail-head .uz-eval-btn{width:100%;margin-left:0}.uz-eval-head-actions{width:100%;margin-left:0}.uz-eval-head-actions .uz-eval-btn{flex:1;min-width:0}.uz-eval-note{align-items:flex-start;flex-direction:column}.uz-eval-diff{grid-template-columns:1fr}.uz-eval-meta{display:block}.uz-eval-meta span,.uz-eval-meta button{display:flex;margin-bottom:6px}.uz-eval-card-head{align-items:flex-start;flex-wrap:wrap}.uz-eval-card-head .uz-eval-mono{width:100%}}
`;
